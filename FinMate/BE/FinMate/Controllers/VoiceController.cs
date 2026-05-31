using System;
using System.Threading.Tasks;
using FinMate.Dtos;
using FinMate.Models;
using FinMate.Repositories;
using FinMate.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace FinMate.Controllers;

[ApiController]
[Route("api/voice")]
public class VoiceController : ControllerBase
{
    private readonly GeminiExpenseAiService _geminiExpenseAi;
    private readonly IExpenseRepository _expenses;
    private readonly ILogger<VoiceController> _logger;

    public VoiceController(
        GeminiExpenseAiService geminiExpenseAi,
        IExpenseRepository expenses,
        ILogger<VoiceController> logger)
    {
        _geminiExpenseAi = geminiExpenseAi;
        _expenses = expenses;
        _logger = logger;
    }

    [HttpPost("expense/preview")]
    public async Task<IActionResult> PreviewExpense([FromBody] VoicePreviewRequest req)
    {
        if (req == null)
            return BadRequest(new { message = "Dữ liệu yêu cầu không hợp lệ." });

        if (string.IsNullOrWhiteSpace(req.Text))
            return BadRequest(new { message = "Vui lòng cung cấp nội dung giọng nói (Text)." });

        try
        {
            var aiResult = await _geminiExpenseAi.ParseAsync(req.Text);

            if (aiResult.Amount <= 0)
                return BadRequest(new { message = "AI không thể nhận diện được số tiền hợp lệ từ câu nói của bạn." });

            return Ok(new
            {
                amount = aiResult.Amount,
                category = string.IsNullOrWhiteSpace(aiResult.Category)
                    ? "Khác"
                    : aiResult.Category,
                note = string.IsNullOrWhiteSpace(aiResult.Note)
                    ? req.Text
                    : aiResult.Note
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi preview chi tiêu bằng giọng nói. Text: {Text}", req.Text);

            if (ex.Message.Contains("quota/rate limit", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new
                {
                    message = "Hệ thống AI đang quá tải. Vui lòng thử lại sau vài giây."
                });
            }

            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "Đã xảy ra lỗi hệ thống khi phân tích chi tiêu.",
                error = ex.Message
            });
        }
    }

    [HttpPost("expense")]
    public async Task<IActionResult> CreateByVoice([FromBody] VoiceParseRequest req)
    {
        // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào (Validation)
        if (req == null)
            return BadRequest(new { message = "Dữ liệu yêu cầu không hợp lệ." });

        if (req.UserId <= 0)
            return BadRequest(new { message = "UserId không hợp lệ." });

        if (string.IsNullOrWhiteSpace(req.Text))
            return BadRequest(new { message = "Vui lòng cung cấp nội dung giọng nói (Text)." });

        try
        {
            // 2. Gọi AI phân tích văn bản
            var aiResult = await _geminiExpenseAi.ParseAsync(req.Text);

            if (aiResult.Amount <= 0)
                return BadRequest(new { message = "AI không thể nhận diện được số tiền hợp lệ từ câu nói của bạn." });

            // 3. Ánh xạ dữ liệu trả về từ AI sang Model Expense
            var expense = new Expense
            {
                UserId = req.UserId,
                Amount = aiResult.Amount,
                Category = string.IsNullOrWhiteSpace(aiResult.Category)
                    ? "Khác"
                    : aiResult.Category,
                Note = string.IsNullOrWhiteSpace(aiResult.Note)
                    ? req.Text
                    : aiResult.Note
            };

            // 4. Lưu vào Database
            await _expenses.AddAsync(expense);

            // Trả về kết quả thành công cho Frontend/App
            return Ok(expense);
        }
        catch (Exception ex)
        {
            // 5. Ghi log chi tiết lỗi ở server
            _logger.LogError(ex, "Lỗi khi xử lý chi tiêu bằng giọng nói. UserId: {UserId}, Text: {Text}", req.UserId, req.Text);

            // 6. Xử lý ngoại lệ Rate Limit từ Gemini
            if (ex.Message.Contains("quota/rate limit", StringComparison.OrdinalIgnoreCase))
            {
                // Trả về HTTP 429 Too Many Requests
                return StatusCode(StatusCodes.Status429TooManyRequests, new 
                { 
                    message = "Hệ thống AI đang quá tải. Vui lòng thử lại sau vài giây." 
                });
            }

            // 7. Xử lý các lỗi không lường trước (HTTP 500)
            return StatusCode(StatusCodes.Status500InternalServerError, new 
            { 
                message = "Đã xảy ra lỗi hệ thống khi phân tích chi tiêu.",
                error = ex.Message // Lời khuyên: Khi đưa lên Production thật, bạn có thể xóa dòng `error` này đi để bảo mật hệ thống
            });
        }
    }
}
