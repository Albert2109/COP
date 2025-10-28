using Four_in_row_api.Model;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent; 

namespace Four_in_row_api.Hubs
{
    public class GameHub : Hub
    {
        private static readonly ConcurrentDictionary<string, GameRoom> Rooms = new ConcurrentDictionary<string, GameRoom>();

        public async Task JoinOrCreateRoom(string roomCode, string nickname)
        {
            GameRoom room;
            bool isCreating = false;

            if (string.IsNullOrEmpty(roomCode))
            {
                roomCode = GenerateRoomCode();
                room = new GameRoom { RoomCode = roomCode };
                if (!Rooms.TryAdd(roomCode, room))
                {
                    await Clients.Caller.SendAsync("Error", "Помилка створення кімнати, спробуйте ще.");
                    return;
                }
                isCreating = true;
            }
            else if (!Rooms.TryGetValue(roomCode, out room))
            {
                await Clients.Caller.SendAsync("Error", "Кімнату не знайдено.");
                return;
            }
            if (!room.Players.Any(p => p.ConnectionId == Context.ConnectionId))
            {
                if (room.Players.Count >= 2 && !isCreating)
                {
                    await Clients.Caller.SendAsync("Error", "Кімната повна.");
                    return;
                }
                var player = new PlayerConnection
                {
                    Nickname = nickname,
                    ConnectionId = Context.ConnectionId
                };
                room.Players.Add(player);
                await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            }
            await Clients.Caller.SendAsync("JoinedRoom", roomCode, room.Players);
            await Clients.Group(roomCode).SendAsync("UpdatePlayerList", room.Players);
            if (room.Players.Count == 2)
            {
                room.FirstPlayerId = room.Players[0].ConnectionId;
                await Clients.Group(roomCode).SendAsync("GameStart", room.FirstPlayerId);
            }
        }
        public async Task MakeMove(string roomCode, int column)
        {
            if (!Rooms.TryGetValue(roomCode, out _)) return;
            await Clients.OthersInGroup(roomCode).SendAsync("MoveMade", Context.ConnectionId, column);
        }

        public async Task RequestRestart(string roomCode)
        {
            if (Rooms.TryGetValue(roomCode, out var room))
            {
                var player = room.Players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
                if (player == null) return;
                await Clients.OthersInGroup(roomCode).SendAsync("RestartRequested", player.Nickname);
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
                if (room.Players.Count == 0)
                {
                    Rooms.TryRemove(roomCodeToRemove, out _);
                }
                else
                {
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