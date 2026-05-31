using FinMate.Dtos;
using FinMate.Models;
using FinMate.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FinMate.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _users;
    public AuthController(IUserRepository users) => _users = users;

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Username and password are required.");

        var existing = await _users.GetByUsernameAsync(req.Username);
        if (existing != null) return BadRequest("Username already exists.");

        var user = new User { Username = req.Username, Password = req.Password };
        await _users.AddAsync(user);
        return Ok(new { user.Id, user.Username });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _users.GetByUsernameAsync(req.Username);
        if (user == null || user.Password != req.Password) return Unauthorized("Invalid credentials.");
        return Ok(new { user.Id, user.Username });
    }
}