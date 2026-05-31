using FinMate.Data;
using FinMate.Models;
using Microsoft.EntityFrameworkCore;

namespace FinMate.Repositories;

public interface IGoalRepository
{
    Task<List<Goal>> GetByUserAsync(int userId);
    Task<Goal?> GetByIdAsync(int id);
    Task AddAsync(Goal goal);
    Task UpdateAsync(Goal goal);
    Task DeleteAsync(Goal goal);
    Task AddContributionAsync(GoalContribution contribution);
}

public class GoalRepository : IGoalRepository
{
    private readonly AppDbContext _db;

    public GoalRepository(AppDbContext db) => _db = db;

    public Task<List<Goal>> GetByUserAsync(int userId)
        => _db.Goals
            .Include(x => x.Contributions)
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.Deadline)
            .ToListAsync();

    public Task<Goal?> GetByIdAsync(int id)
        => _db.Goals
            .Include(x => x.Contributions)
            .FirstOrDefaultAsync(x => x.Id == id);

    public async Task AddAsync(Goal goal)
    {
        _db.Goals.Add(goal);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Goal goal)
    {
        _db.Goals.Update(goal);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Goal goal)
    {
        _db.Goals.Remove(goal);
        await _db.SaveChangesAsync();
    }

    public async Task AddContributionAsync(GoalContribution contribution)
    {
        _db.GoalContributions.Add(contribution);
        await _db.SaveChangesAsync();
    }
}
