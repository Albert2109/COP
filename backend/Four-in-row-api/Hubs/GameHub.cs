using Four_in_row_api.Model;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace Four_in_row_api.Hubs
{
    public class GameHub : Hub
    {
        private static readonly ConcurrentDictionary<string, GameRoom> Rooms = new ConcurrentDictionary<string, GameRoom>();

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

            if (room.Players.Count == 2 && !room.IsFinished) 
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

        public async Task MakeMove(string roomCode, int column)
        {
            if (!Rooms.TryGetValue(roomCode, out _)) return;
            await Clients.OthersInGroup(roomCode).SendAsync("MoveMade", Context.ConnectionId, column);
        }

        public async Task NotifyGameEnd(string roomCode)
        {
            if (Rooms.TryGetValue(roomCode, out var room))
            {
                if (room.IsFinished)
                {
                    Console.WriteLine($"Room {roomCode}: Game already finished, ignoring NotifyGameEnd call.");
                    return;
                }

                room.IsFinished = true;
                foreach (var p in room.Players) { p.WantsRestart = false; }
                Console.WriteLine($"Game in room {roomCode} ended. Notifying clients.");
                await Clients.Group(roomCode).SendAsync("GameFinished"); 
            }
            else
            {
                Console.WriteLine($"NotifyGameEnd called for non-existent room: {roomCode}");
            }
        }

        public async Task RequestRestart(string roomCode)
        {
            if (Rooms.TryGetValue(roomCode, out var room))
            {
                if (!room.IsFinished)
                {
                    Console.WriteLine($"Room {roomCode}: Restart requested but game is not finished.");
                    return;
                }

                var player = room.Players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
                var opponent = room.Players.FirstOrDefault(p => p.ConnectionId != Context.ConnectionId);

                if (player == null || opponent == null)
                {
                    Console.WriteLine($"Room {roomCode}: Cannot restart, player or opponent missing.");
                    await Clients.Caller.SendAsync("Error", "Не вдається перезапустити гру (опонент від'єднався?).");
                    return;
                }

                player.WantsRestart = true;
                Console.WriteLine($"Room {roomCode}: Player {player.Nickname} wants restart.");

                if (opponent.WantsRestart) 
                {
                    Console.WriteLine($"Room {roomCode}: Both players agreed to restart. Starting new game.");
                    player.WantsRestart = false;
                    opponent.WantsRestart = false;
                    room.IsFinished = false;

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
                else 
                {
                    Console.WriteLine($"Room {roomCode}: Notifying opponent {opponent.Nickname} about restart request.");
                    await Clients.Client(opponent.ConnectionId).SendAsync("RestartRequested", player.Nickname);
                    await Clients.Caller.SendAsync("WaitingForRestart"); 
                }
            }
            else
            {
                Console.WriteLine($"RequestRestart called for non-existent room: {roomCode}");
            }
        }

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
                    remainingPlayer.WantsRestart = false; 
                }
                if (room.Players.Count == 0)
                {
                    Rooms.TryRemove(roomCodeToRemove, out _);
                    Console.WriteLine($"Room {roomCodeToRemove} removed (empty).");
                }
                else
                {

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