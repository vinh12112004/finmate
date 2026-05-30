const expensesUrl = "/api/expenses";

function toIsoDate(value) {
    if (!value) return new Date().toISOString().slice(0, 10);
    return new Date(value).toISOString().slice(0, 10);
}

export function mapExpenseFromApi(expense) {
    const note = expense.note || "";
    return {
        id: expense.id,
        backendId: expense.id,
        userId: expense.userId,
        amount: Number(expense.amount || 0),
        category: expense.category || "Khác",
        date: toIsoDate(expense.createdAt),
        title: note || `Khoản chi #${expense.id}`,
        note,
        type: "expense",
        createdAt: expense.createdAt,
    };
}

async function parseJsonResponse(response) {
    if (response.status === 204) return null;
    return response.json();
}

async function request(path, options = {}) {
    const response = await fetch(path, {
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Không thể kết nối dữ liệu chi tiêu.");
    }

    return parseJsonResponse(response);
}

export async function fetchExpenses(userId) {
    const expenses = await request(`${expensesUrl}?userId=${userId}`);
    return expenses.map(mapExpenseFromApi);
}

export async function createExpense({ userId, amount, category, note }) {
    const expense = await request(expensesUrl, {
        method: "POST",
        body: JSON.stringify({
            userId,
            amount,
            category,
            note,
        }),
    });
    return mapExpenseFromApi(expense);
}

export async function getExpenseRecommendation({
    userId,
    amount,
    category,
    note,
}) {
    return request(`${expensesUrl}/recommendation`, {
        method: "POST",
        body: JSON.stringify({
            userId,
            amount,
            category,
            note,
        }),
    });
}

export async function deleteExpense(id) {
    await request(`${expensesUrl}/${id}`, {
        method: "DELETE",
    });
}
