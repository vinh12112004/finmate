using FinMate.Dtos;
using FinMate.Helpers;
using FinMate.Models;
using FinMate.Repositories;
using FinMate.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinMate.Controllers;

[ApiController]
[Route("api/expenses")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseRepository _expenses;
    private readonly IBudgetRepository _budgets;
    private readonly INotificationRepository _notifications;
    private readonly IGoalRepository _goals;
    private readonly GeminiExpenseAiService _geminiExpenseAi;

    public ExpensesController(
        IExpenseRepository expenses,
        IBudgetRepository budgets,
        INotificationRepository notifications,
        IGoalRepository goals,
        GeminiExpenseAiService geminiExpenseAi)
    {
        _expenses = expenses;
        _budgets = budgets;
        _notifications = notifications;
        _goals = goals;
        _geminiExpenseAi = geminiExpenseAi;
    }

    [HttpGet]
    public async Task<IActionResult> GetByUser([FromQuery] int userId)
        => Ok(await _expenses.GetByUserAsync(userId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var expense = await _expenses.GetByIdAsync(id);
        return expense == null ? NotFound() : Ok(expense);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ExpenseCreateRequest req)
    {
        if (req.UserId <= 0 || req.Amount <= 0) return BadRequest("Invalid userId or amount.");

        var category = string.IsNullOrWhiteSpace(req.Category)
            ? ExpenseAiHelper.GuessCategory(req.Note ?? "")
            : req.Category;

        var expense = new Expense
        {
            UserId = req.UserId,
            Amount = req.Amount,
            Category = category,
            Note = req.Note
        };

        await _expenses.AddAsync(expense);

        await CreateBudgetWarningIfNeeded(req.UserId);

        return Ok(expense);
    }

    [HttpPost("recommendation")]
    public async Task<IActionResult> Recommendation(ExpenseRecommendationRequest req)
    {
        if (req.UserId <= 0 || req.Amount <= 0)
            return BadRequest(new { message = "Invalid userId or amount." });

        var budget = await _budgets.GetByUserAsync(req.UserId);
        if (budget == null || budget.MonthlyBudget <= 0)
        {
            return Ok(new ExpenseRecommendationResponse(
                false,
                "Bạn chưa thiết lập ngân sách tháng nên FinMate chưa thể đánh giá ảnh hưởng tới mục tiêu."));
        }

        var now = DateTime.UtcNow;
        var monthTotal = await _expenses.GetMonthTotalAsync(req.UserId, now.Year, now.Month);
        var goals = (await _goals.GetByUserAsync(req.UserId))
            .Select(goal =>
            {
                var currentAmount = goal.Contributions.Sum(x => x.Amount);
                var missingAmount = Math.Max(goal.TargetAmount - currentAmount, 0);
                var daysUntilDeadline = Math.Max((goal.Deadline.Date - now.Date).Days, 0);
                var monthsLeft = Math.Max((int)Math.Ceiling(Math.Max(daysUntilDeadline, 1) / 30m), 1);
                var monthlyNeed = missingAmount / monthsLeft;

                return new
                {
                    Goal = goal,
                    CurrentAmount = currentAmount,
                    MissingAmount = missingAmount,
                    MonthlyNeed = monthlyNeed,
                    MonthsLeft = monthsLeft
                };
            })
            .Where(x => x.MissingAmount > 0 && x.Goal.Deadline.Date >= now.Date)
            .ToList();

        if (!goals.Any())
        {
            return Ok(new ExpenseRecommendationResponse(
                false,
                "Khoản chi này chưa ảnh hưởng đáng kể tới mục tiêu tài chính hiện tại."));
        }

        var totalMonthlyGoalNeed = goals.Sum(x => x.MonthlyNeed);
        var safeToSpend = budget.MonthlyBudget - monthTotal - totalMonthlyGoalNeed;
        var shouldWarn = req.Amount > safeToSpend;

        if (!shouldWarn)
        {
            return Ok(new ExpenseRecommendationResponse(
                false,
                "Khoản chi này vẫn nằm trong vùng an toàn so với ngân sách và mục tiêu hiện tại."));
        }

        var impactedGoal = goals
            .OrderBy(x => x.Goal.Deadline)
            .ThenByDescending(x => x.MonthlyNeed)
            .First();

        var fallbackMessage = $"Khoản chi này có thể làm chậm tiến độ mục tiêu {impactedGoal.Goal.Name}. Bạn nên cân nhắc giảm hoặc hoãn khoản chi.";
        var message = fallbackMessage;

        try
        {
            var prompt = $@"
            Bạn là trợ lý tài chính của FinMate.
            Hãy viết một cảnh báo ngắn gọn bằng tiếng Việt, một câu, không markdown.

            Dữ liệu:
            - Tên mục tiêu: {impactedGoal.Goal.Name}
            - Số tiền mục tiêu: {impactedGoal.Goal.TargetAmount}
            - Đã tiết kiệm: {impactedGoal.CurrentAmount}
            - Còn thiếu: {impactedGoal.MissingAmount}
            - Deadline: {impactedGoal.Goal.Deadline:yyyy-MM-dd}
            - Ngân sách tháng: {budget.MonthlyBudget}
            - Đã chi tháng này: {monthTotal}
            - Khoản chi mới: {req.Amount}
            - Danh mục khoản chi: {req.Category ?? "Khác"}
            - Ghi chú khoản chi: {req.Note ?? ""}

            Nội dung cần truyền đạt: khoản chi này có thể làm chậm tiến độ đạt mục tiêu, nên cân nhắc giảm hoặc hoãn.
            ";

            var aiMessage = await _geminiExpenseAi.GenerateRecommendationMessageAsync(prompt);
            if (!string.IsNullOrWhiteSpace(aiMessage))
            {
                message = aiMessage;
            }
        }
        catch
        {
            message = fallbackMessage;
        }

        return Ok(new ExpenseRecommendationResponse(true, message));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ExpenseUpdateRequest req)
    {
        var expense = await _expenses.GetByIdAsync(id);
        if (expense == null) return NotFound();

        if (req.Amount.HasValue && req.Amount.Value <= 0) return BadRequest("Amount must be > 0.");

        expense.Amount = req.Amount ?? expense.Amount;
        expense.Category = string.IsNullOrWhiteSpace(req.Category) ? expense.Category : req.Category;
        expense.Note = req.Note ?? expense.Note;

        await _expenses.UpdateAsync(expense);

        await CreateBudgetWarningIfNeeded(expense.UserId);

        return Ok(expense);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var expense = await _expenses.GetByIdAsync(id);
        if (expense == null) return NotFound();

        await _expenses.DeleteAsync(expense);
        return NoContent();
    }

    private async Task CreateBudgetWarningIfNeeded(int userId)
    {
        var budget = await _budgets.GetByUserAsync(userId);
        if (budget == null || budget.MonthlyBudget <= 0) return;

        var now = DateTime.UtcNow;
        var total = await _expenses.GetMonthTotalAsync(userId, now.Year, now.Month);
        if (total > budget.MonthlyBudget * 0.8m)
        {
            await _notifications.AddAsync(new Notification
            {
                UserId = userId,
                Message = "You have used over 80% of your monthly budget."
            });
        }
    }
}
