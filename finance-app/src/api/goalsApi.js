const goalsUrl = "/api/goals";

function toIsoDate(value) {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
}

export function mapGoalFromApi(goal) {
    return {
        id: goal.id,
        userId: goal.userId,
        name: goal.name || "",
        targetAmount: Number(goal.targetAmount || 0),
        currentAmount: Number(goal.currentAmount || 0),
        progressPercent: Number(goal.progressPercent || 0),
        deadline: toIsoDate(goal.deadline),
        createdAt: goal.createdAt,
    };
}

async function parseJsonResponse(response) {
    if (response.status === 204) return null;
    return response.json();
}

async function readError(response, fallback) {
    const message = await response.text();
    if (!message) return fallback;

    try {
        const data = JSON.parse(message);
        return data.message || fallback;
    } catch {
        return message;
    }
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
        throw new Error(
            await readError(response, "Không thể kết nối dữ liệu mục tiêu."),
        );
    }

    return parseJsonResponse(response);
}

export async function fetchGoals(userId) {
    const goals = await request(`${goalsUrl}?userId=${userId}`);
    return goals.map(mapGoalFromApi);
}

export async function createGoal({ userId, name, targetAmount, deadline }) {
    const goal = await request(goalsUrl, {
        method: "POST",
        body: JSON.stringify({
            userId,
            name,
            targetAmount,
            deadline,
        }),
    });

    return mapGoalFromApi(goal);
}

export async function updateGoal({ id, name, targetAmount, deadline }) {
    const goal = await request(`${goalsUrl}/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            name,
            targetAmount,
            deadline,
        }),
    });

    return mapGoalFromApi(goal);
}

export async function deleteGoal(id) {
    await request(`${goalsUrl}/${id}`, {
        method: "DELETE",
    });
}

export async function addGoalContribution({ goalId, amount }) {
    const goal = await request(`${goalsUrl}/${goalId}/contributions`, {
        method: "POST",
        body: JSON.stringify({
            amount,
        }),
    });

    return mapGoalFromApi(goal);
}
