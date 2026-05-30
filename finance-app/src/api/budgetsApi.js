const budgetsUrl = "/api/budgets";

function mapBudgetFromApi(budget) {
    if (!budget) return null;

    return {
        id: budget.id,
        userId: budget.userId,
        monthlyBudget: Number(budget.monthlyBudget || 0),
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
        throw new Error(message || "Không thể kết nối dữ liệu ngân sách.");
    }

    return parseJsonResponse(response);
}

export async function fetchBudget(userId) {
    const budget = await request(`${budgetsUrl}?userId=${userId}`);
    return mapBudgetFromApi(budget);
}

export async function createBudget({ userId, monthlyBudget }) {
    const budget = await request(budgetsUrl, {
        method: "POST",
        body: JSON.stringify({
            userId,
            monthlyBudget,
        }),
    });

    return mapBudgetFromApi(budget);
}

export async function updateBudget({ id, userId, monthlyBudget }) {
    const budget = await request(`${budgetsUrl}/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            userId,
            monthlyBudget,
        }),
    });

    return mapBudgetFromApi(budget);
}
