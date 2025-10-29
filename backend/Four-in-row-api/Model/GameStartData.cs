// Переконайся, що namespace правильний
namespace Four_in_row_api.Model
{
    public class GameStartData
    {
        public string FirstPlayerId { get; set; }
        public int Rows { get; set; }
        public int Columns { get; set; }
        public List<PlayerConnection> Players { get; set; }
    }
}