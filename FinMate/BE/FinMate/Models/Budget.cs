namespace FinMate.Models;

public class Budget
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal MonthlyBudget { get; set; }
    public User? User { get; set; }
}