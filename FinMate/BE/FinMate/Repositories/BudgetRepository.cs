using FinMate.Data;
using FinMate.Models;
using Microsoft.EntityFrameworkCore;

namespace FinMate.Repositories;

public interface IBudgetRepository
{
    Task<Budget?> GetByUserAsync(int userId);
    Task AddAsync(Budget budget);
    Task UpdateAsync(Budget budget);
    Task DeleteAsync(Budget budget);
}

public class BudgetRepository : IBudgetRepository
{
    private readonly AppDbContext _db;
    public BudgetRepository(AppDbContext db) => _db = db;

    public Task<Budget?> GetByUserAsync(int userId)
        => _db.Budgets.FirstOrDefaultAsync(x => x.UserId == userId);

    public async Task AddAsync(Budget budget)
    {
        _db.Budgets.Add(budget);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Budget budget)
    {
        _db.Budgets.Update(budget);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Budget budget)
    {
        _db.Budgets.Remove(budget);
        await _db.SaveChangesAsync();
    }
}