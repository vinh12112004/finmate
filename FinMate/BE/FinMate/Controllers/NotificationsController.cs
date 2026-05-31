using FinMate.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FinMate.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRepository _notifications;
    public NotificationsController(INotificationRepository notifications) => _notifications = notifications;

    [HttpGet]
    public async Task<IActionResult> GetByUser([FromQuery] int userId)
        => Ok(await _notifications.GetByUserAsync(userId));

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var noti = await _notifications.GetByIdAsync(id);
        if (noti == null) return NotFound();

        noti.IsRead = true;
        await _notifications.UpdateAsync(noti);
        return Ok(noti);
    }
}