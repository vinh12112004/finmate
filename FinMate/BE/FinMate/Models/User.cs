namespace FinMate.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public List<Expense> Expenses { get; set; } = new();
    public List<Budget> Budgets { get; set; } = new();
    public List<Notification> Notifications { get; set; } = new();
    public List<Goal> Goals { get; set; } = new();
}
