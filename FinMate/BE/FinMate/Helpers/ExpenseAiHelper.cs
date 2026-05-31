using System.Text.RegularExpressions;

namespace FinMate.Helpers;

public static class ExpenseAiHelper
{
    private static readonly Dictionary<string, string> CategoryMap = new()
    {
        { "tra sua", "Food & Drink" },
        { "ca phe", "Food & Drink" },
        { "an", "Food & Drink" },
        { "xe buyt", "Transport" },
        { "taxi", "Transport" },
        { "shopee", "Shopping" },
        { "netflix", "Subscriptions" }
    };

    public static string GuessCategory(string text)
    {
        var lower = text.ToLowerInvariant();
        foreach (var kv in CategoryMap)
        {
            if (lower.Contains(kv.Key)) return kv.Value;
        }
        return "Other";
    }

    public static decimal ParseAmount(string text)
    {
        var match = Regex.Match(text.ToLowerInvariant(), @"(\d+)(k)?");
        if (!match.Success) return 0;

        var value = decimal.Parse(match.Groups[1].Value);
        if (match.Groups[2].Success) value *= 1000;
        return value;
    }
}