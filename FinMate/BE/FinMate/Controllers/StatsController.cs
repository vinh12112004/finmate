using FinMate.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FinMate.Controllers;

[ApiController]
[Route("api/stats")]
public class StatsController : ControllerBase
{
    private readonly IExpenseRepository _expenses;
    private readonly IBudgetRepository _budgets;

    public StatsController(IExpenseRepository expenses, IBudgetRepository budgets)
    {
        _expenses = expenses;
        _budgets = budgets;
    }

    [HttpGet("total")]
    public async Task<IActionResult> Total([FromQuery] int userId, [FromQuery] int year, [FromQuery] int month)
        => Ok(new { total = await _expenses.GetMonthTotalAsync(userId, year, month) });

    [HttpGet("daily-limit")]
    public async Task<IActionResult> DailyLimit([FromQuery] int userId)
    {
        var budget = await _budgets.GetByUserAsync(userId);
        if (budget == null) return NotFound("No budget set.");

        var now = DateTime.UtcNow;
        var days = DateTime.DaysInMonth(now.Year, now.Month);
        var limitPerDay = budget.MonthlyBudget / days;

        return Ok(new { dailyLimit = limitPerDay });
    }
}