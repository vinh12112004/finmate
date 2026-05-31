namespace FinMate.Models;

public class Goal
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = "";
    public decimal TargetAmount { get; set; }
    public DateTime Deadline { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User? User { get; set; }
    public List<GoalContribution> Contributions { get; set; } = new();
}
