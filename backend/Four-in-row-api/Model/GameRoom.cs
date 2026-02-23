namespace Four_in_row_api.Model
{
    public class GameRoom
    {
        public string RoomCode { get; set; }
        public List<PlayerConnection> Players { get; set; } = new List<PlayerConnection>();
        public string? FirstPlayerId { get; set; }
        public int Rows { get; set; }
        public int Columns { get; set; }
        public bool IsFinished { get; set; } = false;

        public string? LastWinnerConnectionId { get; set; }
        public string? LastGameTime { get; set; }
    }
}