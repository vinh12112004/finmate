using System.Text;
using System.Text.Json;
using FinMate.Dtos;

namespace FinMate.Services;

public class GeminiExpenseAiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public GeminiExpenseAiService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task<AiExpenseResult> ParseAsync(string text)
    {
        var apiKey = _config["Gemini:ApiKey"];

        var prompt = $@"
        Bạn là AI phân tích chi tiêu cho app FinMate.
        Chỉ trả về JSON hợp lệ, không markdown.

        Schema:
        {{
          ""amount"": number,
          ""category"": string,
          ""note"": string
        }}

        Danh mục hợp lệ:
        Ăn uống, Cà phê, Di chuyển, Học tập, Đăng ký, Khác.

        Quy đổi:
        25 nghìn = 25000
        100k = 100000
        1 triệu = 1000000

        Câu người dùng: ""{text}""
        ";

        var body = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0,
                responseMimeType = "application/json"
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

        var response = await _httpClient.PostAsync(
            url,
            new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
        );

        if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            throw new Exception("Gemini đang bị giới hạn quota/rate limit. Vui lòng thử lại sau hoặc đổi API key/project.");
        }

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini API error: {(int)response.StatusCode} - {errorBody}");
        }

        var responseText = await response.Content.ReadAsStringAsync();
        Console.WriteLine(responseText);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception(
                $"Gemini API error: {(int)response.StatusCode} - {responseText}"
            );
        }

        using var doc = JsonDocument.Parse(responseText);

        var json = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return JsonSerializer.Deserialize<AiExpenseResult>(
            json ?? "{}",
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        ) ?? new AiExpenseResult();
    }

    public async Task<string> GenerateRecommendationMessageAsync(string prompt)
    {
        var apiKey = _config["Gemini:ApiKey"];

        var body = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.2
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

        var response = await _httpClient.PostAsync(
            url,
            new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
        );

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini API error: {(int)response.StatusCode} - {errorBody}");
        }

        var responseText = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseText);

        return doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString()
            ?.Trim() ?? "";
    }
}
