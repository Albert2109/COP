using Four_in_row_api.Model;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace Four_in_row_api.Hubs
{
    public class GameHub : Hub
    {
        private static readonly ConcurrentDictionary<string, GameRoom> Rooms = new ConcurrentDictionary<string, GameRoom>();

        // Метод JoinOrCreateRoom залишається без змін (твій варіант був правильний)
        public async Task JoinOrCreateRoom(string roomCode, string nickname, int rows = 6, int columns = 7)
        {
            GameRoom room;
            bool isCreating = false;

            if (string.IsNullOrEmpty(roomCode))
            {
                isCreating = true;
                roomCode = GenerateRoomCode();
                room = new GameRoom { RoomCode = roomCode, Rows = rows, Columns = columns };
                if (!Rooms.TryAdd(roomCode, room))
                {
                    await Clients.Caller.SendAsync("Error", "Помилка створення кімнати (код вже існує), спробуйте ще.");
                    return;
                }
            }
            else if (!Rooms.TryGetValue(roomCode, out room))
            {
                isCreating = true;
                room = new GameRoom { RoomCode = roomCode, Rows = rows, Columns = columns };
                if (!Rooms.TryAdd(roomCode, room))
                {
                    await Clients.Caller.SendAsync("Error", "Помилка створення кімнати. Спробуйте ще раз.");
                    return;
                }
            }

            if (!isCreating)
            {
                if (room.Players.Count >= 2)
                {
                    await Clients.Caller.SendAsync("Error", $"Кімната '{roomCode}' повна.");
                    return;
                }
            }

            if (!room.Players.Any(p => p.ConnectionId == Context.ConnectionId))
            {
                var player = new PlayerConnection { Nickname = nickname, ConnectionId = Context.ConnectionId };
                room.Players.Add(player);
                await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            }

            await Clients.Caller.SendAsync("JoinedRoom", room.RoomCode, room.Players, room.Rows, room.Columns);
            await Clients.Group(room.RoomCode).SendAsync("UpdatePlayerList", room.Players);

            if (room.Players.Count == 2 && !room.IsFinished) // Додаємо перевірку !IsFinished про всяк випадок
            {
                room.FirstPlayerId = room.Players[0].ConnectionId;
                var gameStartData = new GameStartData
                {
                    FirstPlayerId = room.FirstPlayerId,
                    Rows = room.Rows,
                    Columns = room.Columns,
                    Players = room.Players
                };
                await Clients.Group(room.RoomCode).SendAsync("GameStart", gameStartData);
            }
        }

        // Метод MakeMove залишається простим пересиланням
        public async Task MakeMove(string roomCode, int column)
        {
            if (!Rooms.TryGetValue(roomCode, out _)) return;
            // Просто пересилаємо хід опоненту
            await Clients.OthersInGroup(roomCode).SendAsync("MoveMade", Context.ConnectionId, column);
        }

        // 🔽🔽🔽 НОВИЙ МЕТОД 🔽🔽🔽
        /// <summary>
        /// Клієнт викликає цей метод, коли його локальна логіка визначила переможця.
        /// Сервер перевіряє стан і розсилає всім офіційне повідомлення про кінець гри.
        /// </summary>
        public async Task NotifyGameEnd(string roomCode)
        {
            if (Rooms.TryGetValue(roomCode, out var room))
            {
                // Захист від гонки: якщо гра ВЖЕ закінчена, нічого не робимо
                if (room.IsFinished)
                {
                    Console.WriteLine($"Room {roomCode}: Game already finished, ignoring NotifyGameEnd call.");
                    return;
                }

                // 1. Позначаємо гру як завершену
                room.IsFinished = true;
                // Скидаємо прапорці рестарту на випадок, якщо вони були встановлені до кінця гри
                foreach (var p in room.Players) { p.WantsRestart = false; }

                // 2. Повідомляємо ВСІХ клієнтів ОДНОЧАСНО
                Console.WriteLine($"Game in room {roomCode} ended. Notifying clients.");
                await Clients.Group(roomCode).SendAsync("GameFinished"); // Нова подія!
            }
            else
            {
                Console.WriteLine($"NotifyGameEnd called for non-existent room: {roomCode}");
            }
        }
        // 🔼🔼🔼 КІНЕЦЬ НОВОГО МЕТОДУ 🔼🔼🔼

        // Оновлюємо RequestRestart
        public async Task RequestRestart(string roomCode)
        {
            if (Rooms.TryGetValue(roomCode, out var room))
            {
                // Гра має бути завершена, щоб можна було просити рестарт
                if (!room.IsFinished)
                {
                    Console.WriteLine($"Room {roomCode}: Restart requested but game is not finished.");
                    return;
                }

                var player = room.Players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
                // Перевіряємо, чи є другий гравець (на випадок, якщо опонент вийшов після кінця гри)
                var opponent = room.Players.FirstOrDefault(p => p.ConnectionId != Context.ConnectionId);

                if (player == null || opponent == null)
                {
                    Console.WriteLine($"Room {roomCode}: Cannot restart, player or opponent missing.");
                    await Clients.Caller.SendAsync("Error", "Не вдається перезапустити гру (опонент від'єднався?).");
                    return;
                }

                player.WantsRestart = true;
                Console.WriteLine($"Room {roomCode}: Player {player.Nickname} wants restart.");

                if (opponent.WantsRestart) // Якщо опонент ВЖЕ чекає
                {
                    Console.WriteLine($"Room {roomCode}: Both players agreed to restart. Starting new game.");
                    // --- Починаємо нову гру ---
                    player.WantsRestart = false;
                    opponent.WantsRestart = false;
                    // 🔽🔽🔽 СКИНУТИ ПРАПОРЕЦЬ 🔽🔽🔽
                    room.IsFinished = false;
                    // 🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼🔼

                    // Міняємо, хто ходить першим
                    room.FirstPlayerId = (room.FirstPlayerId == player.ConnectionId) ? opponent.ConnectionId : player.ConnectionId;

                    var gameStartData = new GameStartData
                    {
                        FirstPlayerId = room.FirstPlayerId,
                        Rows = room.Rows,
                        Columns = room.Columns,
                        Players = room.Players
                    };
                    await Clients.Group(roomCode).SendAsync("GameStart", gameStartData);
                }
                else // Якщо ми перші натиснули "Грати ще"
                {
                    Console.WriteLine($"Room {roomCode}: Notifying opponent {opponent.Nickname} about restart request.");
                    // Повідомляємо опонента, що ми хочемо рестарт
                    await Clients.Client(opponent.ConnectionId).SendAsync("RestartRequested", player.Nickname);
                    // Повідомляємо себе, що чекаємо
                    await Clients.Caller.SendAsync("WaitingForRestart"); // Можна додати обробку цього на клієнті
                }
            }
            else
            {
                Console.WriteLine($"RequestRestart called for non-existent room: {roomCode}");
            }
        }

        // OnDisconnectedAsync залишається без змін
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            string roomCodeToRemove = null;
            GameRoom room = null;
            PlayerConnection player = null;

            foreach (var pair in Rooms)
            {
                player = pair.Value.Players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
                if (player != null)
                {
                    room = pair.Value;
                    roomCodeToRemove = pair.Key;
                    break;
                }
            }

            if (room != null && player != null)
            {
                room.Players.Remove(player);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, room.RoomCode);
                await Clients.Group(room.RoomCode).SendAsync("PlayerLeft", player.Nickname);

                var remainingPlayer = room.Players.FirstOrDefault();
                if (remainingPlayer != null)
                {
                    remainingPlayer.WantsRestart = false; // Скидаємо бажання рестарту, якщо опонент вийшов
                }
                if (room.Players.Count == 0)
                {
                    Rooms.TryRemove(roomCodeToRemove, out _);
                    Console.WriteLine($"Room {roomCodeToRemove} removed (empty).");
                }
                else
                {
                    // Якщо гравець вийшов ПІСЛЯ завершення гри, скидаємо IsFinished,
                    // щоб гравець, що залишився, міг вийти.
                    if (room.IsFinished)
                    {
                        room.IsFinished = false;
                        Console.WriteLine($"Room {room.RoomCode}: Resetting IsFinished because player left after game end.");
                    }
                    await Clients.Group(room.RoomCode).SendAsync("UpdatePlayerList", room.Players);
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        private string GenerateRoomCode()
        {
            return Guid.NewGuid().ToString("N").Substring(0, 5).ToUpper();
        }
    }
}