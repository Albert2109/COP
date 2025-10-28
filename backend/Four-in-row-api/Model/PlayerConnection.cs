namespace Four_in_row_api.Model
{
    public class PlayerConnection
    {
        public string Nickname { get; set; }
        public string ConnectionId { get; set; }
        public bool WantsRestart { get; set; } = false;
    }
}
