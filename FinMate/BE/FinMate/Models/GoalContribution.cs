namespace FinMate.Models;

public class GoalContribution
{
    public int Id { get; set; }
    public int GoalId { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Goal? Goal { get; set; }
}
