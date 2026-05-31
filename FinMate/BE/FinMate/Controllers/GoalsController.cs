using FinMate.Dtos;
using FinMate.Models;
using FinMate.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FinMate.Controllers;

[ApiController]
[Route("api/goals")]
public class GoalsController : ControllerBase
{
    private readonly IGoalRepository _goals;

    public GoalsController(IGoalRepository goals) => _goals = goals;

    [HttpGet]
    public async Task<IActionResult> GetByUser([FromQuery] int userId)
    {
        if (userId <= 0) return BadRequest(new { message = "UserId không hợp lệ." });

        var goals = await _goals.GetByUserAsync(userId);
        return Ok(goals.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var goal = await _goals.GetByIdAsync(id);
        return goal == null ? NotFound() : Ok(ToResponse(goal));
    }

    [HttpPost]
    public async Task<IActionResult> Create(GoalCreateRequest req)
    {
        if (req.UserId <= 0) return BadRequest(new { message = "UserId không hợp lệ." });
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest(new { message = "Tên mục tiêu không được để trống." });
        if (req.TargetAmount <= 0) return BadRequest(new { message = "Số tiền mục tiêu phải lớn hơn 0." });

        var goal = new Goal
        {
            UserId = req.UserId,
            Name = req.Name.Trim(),
            TargetAmount = req.TargetAmount,
            Deadline = req.Deadline.Date
        };

        await _goals.AddAsync(goal);
        return Ok(ToResponse(goal));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, GoalUpdateRequest req)
    {
        var goal = await _goals.GetByIdAsync(id);
        if (goal == null) return NotFound();

        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest(new { message = "Tên mục tiêu không được để trống." });
        if (req.TargetAmount <= 0) return BadRequest(new { message = "Số tiền mục tiêu phải lớn hơn 0." });

        goal.Name = req.Name.Trim();
        goal.TargetAmount = req.TargetAmount;
        goal.Deadline = req.Deadline.Date;

        await _goals.UpdateAsync(goal);
        return Ok(ToResponse(goal));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var goal = await _goals.GetByIdAsync(id);
        if (goal == null) return NotFound();

        await _goals.DeleteAsync(goal);
        return NoContent();
    }

    [HttpPost("{id:int}/contributions")]
    public async Task<IActionResult> AddContribution(int id, GoalContributionCreateRequest req)
    {
        var goal = await _goals.GetByIdAsync(id);
        if (goal == null) return NotFound();
        if (req.Amount <= 0) return BadRequest(new { message = "Số tiền tiết kiệm phải lớn hơn 0." });

        await _goals.AddContributionAsync(new GoalContribution
        {
            GoalId = id,
            Amount = req.Amount
        });

        goal = await _goals.GetByIdAsync(id);
        return Ok(ToResponse(goal!));
    }

    private static GoalResponse ToResponse(Goal goal)
    {
        var currentAmount = goal.Contributions.Sum(x => x.Amount);
        var progressPercent = goal.TargetAmount > 0
            ? Math.Min((currentAmount / goal.TargetAmount) * 100, 100)
            : 0;

        return new GoalResponse(
            goal.Id,
            goal.UserId,
            goal.Name,
            goal.TargetAmount,
            currentAmount,
            progressPercent,
            goal.Deadline,
            goal.CreatedAt);
    }
}
