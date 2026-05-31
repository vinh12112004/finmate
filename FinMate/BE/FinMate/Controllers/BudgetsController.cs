using FinMate.Dtos;
using FinMate.Models;
using FinMate.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FinMate.Controllers;

[ApiController]
[Route("api/budgets")]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetRepository _budgets;
    public BudgetsController(IBudgetRepository budgets) => _budgets = budgets;

    [HttpGet]
    public async Task<IActionResult> GetByUser([FromQuery] int userId)
        => Ok(await _budgets.GetByUserAsync(userId));

    [HttpPost]
    public async Task<IActionResult> Create(BudgetCreateRequest req)
    {
        if (req.UserId <= 0 || req.MonthlyBudget <= 0) return BadRequest("Invalid data.");

        var budget = new Budget { UserId = req.UserId, MonthlyBudget = req.MonthlyBudget };
        await _budgets.AddAsync(budget);
        return Ok(budget);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, BudgetUpdateRequest req)
    {
        if (req.MonthlyBudget <= 0) return BadRequest("MonthlyBudget must be > 0.");
        var budget = await _budgets.GetByUserAsync(req.UserId);
        if (budget == null || budget.Id != id) return NotFound();

        budget.MonthlyBudget = req.MonthlyBudget;
        await _budgets.UpdateAsync(budget);
        return Ok(budget);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] int userId)
    {
        var budget = await _budgets.GetByUserAsync(userId);
        if (budget == null || budget.Id != id) return NotFound();

        await _budgets.DeleteAsync(budget);
        return NoContent();
    }
}