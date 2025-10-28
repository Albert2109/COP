namespace Four_in_row_api.Model
{
    public class GameRoom
    {
        public string RoomCode { get; set; }
        public List<PlayerConnection> Players { get; set; } = new List<PlayerConnection>();
        public string? FirstPlayerId { get; set; }
        public int Rows { get; set; } = 6; 
        public int Columns { get; set; } = 7;
    }
}
