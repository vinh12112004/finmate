namespace FinMate.Dtos;

public record RegisterRequest(string Username, string Password);
public record LoginRequest(string Username, string Password);

public record ExpenseCreateRequest(int UserId, decimal Amount, string? Category, string? Note);
public record ExpenseUpdateRequest(decimal? Amount, string? Category, string? Note);
public record ExpenseRecommendationRequest(int UserId, decimal Amount, string? Category, string? Note);
public record ExpenseRecommendationResponse(bool ShouldWarn, string Message);

public record BudgetCreateRequest(int UserId, decimal MonthlyBudget);
public record BudgetUpdateRequest(int UserId, decimal MonthlyBudget);

public record GoalCreateRequest(int UserId, string Name, decimal TargetAmount, DateTime Deadline);
public record GoalUpdateRequest(string Name, decimal TargetAmount, DateTime Deadline);
public record GoalContributionCreateRequest(decimal Amount);
public record GoalResponse(
    int Id,
    int UserId,
    string Name,
    decimal TargetAmount,
    decimal CurrentAmount,
    decimal ProgressPercent,
    DateTime Deadline,
    DateTime CreatedAt);

public record VoicePreviewRequest(string Text);

public class VoiceParseRequest
{
    public string Text { get; set; } = "";
    public int UserId { get; set; }
}

public class AiExpenseResult
{
    public decimal Amount { get; set; }
    public string Category { get; set; } = "Khác";
    public string Note { get; set; } = "";
}
