using FinMate.Data;
using FinMate.Models;
using Microsoft.EntityFrameworkCore;

namespace FinMate.Repositories;

public interface INotificationRepository
{
    Task<List<Notification>> GetByUserAsync(int userId);
    Task AddAsync(Notification notification);
    Task<Notification?> GetByIdAsync(int id);
    Task UpdateAsync(Notification notification);
}

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _db;
    public NotificationRepository(AppDbContext db) => _db = db;

    public Task<List<Notification>> GetByUserAsync(int userId)
        => _db.Notifications.Where(x => x.UserId == userId).OrderByDescending(x => x.CreatedAt).ToListAsync();

    public Task<Notification?> GetByIdAsync(int id)
        => _db.Notifications.FirstOrDefaultAsync(x => x.Id == id);

    public async Task AddAsync(Notification notification)
    {
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Notification notification)
    {
        _db.Notifications.Update(notification);
        await _db.SaveChangesAsync();
    }
}