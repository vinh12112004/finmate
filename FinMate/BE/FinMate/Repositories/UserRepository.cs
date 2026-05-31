using FinMate.Data;
using FinMate.Models;
using Microsoft.EntityFrameworkCore;

namespace FinMate.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByIdAsync(int id);
    Task AddAsync(User user);
}

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;
    public UserRepository(AppDbContext db) => _db = db;

    public Task<User?> GetByUsernameAsync(string username)
        => _db.Users.FirstOrDefaultAsync(x => x.Username == username);

    public Task<User?> GetByIdAsync(int id)
        => _db.Users.FirstOrDefaultAsync(x => x.Id == id);

    public async Task AddAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }
}