namespace Four_in_row_api.Model
{
    public class GameRoom
    {
        public string RoomCode { get; set; }
        public List<PlayerConnection> Players { get; set; } = new List<PlayerConnection>();
        public string? FirstPlayerId { get; set; }
    }
}
