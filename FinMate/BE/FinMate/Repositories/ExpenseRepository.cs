using FinMate.Data;
using FinMate.Models;
using Microsoft.EntityFrameworkCore;

namespace FinMate.Repositories;

public interface IExpenseRepository
{
    Task<Expense?> GetByIdAsync(int id);
    Task<List<Expense>> GetByUserAsync(int userId);
    Task AddAsync(Expense expense);
    Task UpdateAsync(Expense expense);
    Task DeleteAsync(Expense expense);
    Task<decimal> GetMonthTotalAsync(int userId, int year, int month);
}
public class ExpenseRepository : IExpenseRepository
{
    private readonly AppDbContext _db;
    public ExpenseRepository(AppDbContext db) => _db = db;

    public Task<Expense?> GetByIdAsync(int id)
        => _db.Expenses.FirstOrDefaultAsync(x => x.Id == id);

    public Task<List<Expense>> GetByUserAsync(int userId)
        => _db.Expenses.Where(x => x.UserId == userId).OrderByDescending(x => x.CreatedAt).ToListAsync();

    public async Task AddAsync(Expense expense)
    {
        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Expense expense)
    {
        _db.Expenses.Update(expense);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Expense expense)
    {
        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync();
    }

    public Task<decimal> GetMonthTotalAsync(int userId, int year, int month)
        => _db.Expenses
            .Where(x => x.UserId == userId && x.CreatedAt.Year == year && x.CreatedAt.Month == month)
            .SumAsync(x => x.Amount);
}