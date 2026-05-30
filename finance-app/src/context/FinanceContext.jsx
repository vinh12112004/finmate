import { useCallback, useEffect, useMemo, useState } from "react";
import {
    createBudget as createBudgetApi,
    fetchBudget,
    updateBudget as updateBudgetApi,
} from "../api/budgetsApi";
import {
    createExpense,
    deleteExpense,
    fetchExpenses,
    getExpenseRecommendation as getExpenseRecommendationApi,
} from "../api/expensesApi";
import {
    addGoalContribution as addGoalContributionApi,
    createGoal as createGoalApi,
    deleteGoal as deleteGoalApi,
    fetchGoals,
    updateGoal as updateGoalApi,
} from "../api/goalsApi";
import { sampleSettings } from "../data/sampleData";
import { useAuth } from "../hooks/useAuth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { isSameMonth } from "../utils/dateUtils";
import { FinanceContext } from "./financeContextValue";

function sortGoals(a, b) {
    return new Date(`${a.deadline}T12:00:00`) - new Date(`${b.deadline}T12:00:00`);
}

export function FinanceProvider({ children }) {
    const { user } = useAuth();
    const userId = user?.id;
    const [transactions, setTransactions] = useState([]);
    const [budget, setBudget] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isBudgetLoading, setIsBudgetLoading] = useState(false);
    const [goals, setGoals] = useState([]);
    const [isGoalsLoading, setIsGoalsLoading] = useState(false);
    const [error, setError] = useState("");
    const [budgetError, setBudgetError] = useState("");
    const [goalsError, setGoalsError] = useState("");
    const [localSettings, setLocalSettings] = useLocalStorage(
        "settings",
        sampleSettings,
    );

    const settings = useMemo(
        () => ({
            ...localSettings,
            monthlyBudget: userId
                ? Number(budget?.monthlyBudget || 0)
                : Number(localSettings.monthlyBudget || 0),
        }),
        [budget, localSettings, userId],
    );

    const refreshExpenses = useCallback(async () => {
        if (!userId) {
            setTransactions([]);
            setError("");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const expenses = await fetchExpenses(userId);
            setTransactions(expenses);
        } catch (fetchError) {
            setError(fetchError.message || "Không thể tải dữ liệu chi tiêu.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const refreshBudget = useCallback(async () => {
        if (!userId) {
            setBudget(null);
            setBudgetError("");
            return null;
        }

        setIsBudgetLoading(true);
        setBudgetError("");

        try {
            const nextBudget = await fetchBudget(userId);
            setBudget(nextBudget);
            return nextBudget;
        } catch (fetchError) {
            setBudgetError(
                fetchError.message || "Không thể tải dữ liệu ngân sách.",
            );
            return null;
        } finally {
            setIsBudgetLoading(false);
        }
    }, [userId]);

    const refreshGoals = useCallback(async () => {
        if (!userId) {
            setGoals([]);
            setGoalsError("");
            return [];
        }

        setIsGoalsLoading(true);
        setGoalsError("");

        try {
            const nextGoals = await fetchGoals(userId);
            setGoals(nextGoals);
            return nextGoals;
        } catch (fetchError) {
            setGoalsError(
                fetchError.message || "Không thể tải dữ liệu mục tiêu.",
            );
            return [];
        } finally {
            setIsGoalsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            Promise.resolve().then(() => {
                setTransactions([]);
                setError("");
                setIsLoading(false);
            });
            return;
        }

        let isCurrent = true;

        Promise.resolve().then(() => {
            if (!isCurrent) return;
            setIsLoading(true);
        });

        fetchExpenses(userId)
            .then((expenses) => {
                if (!isCurrent) return;
                setTransactions(expenses);
                setError("");
            })
            .catch((fetchError) => {
                if (!isCurrent) return;
                setError(
                    fetchError.message || "Không thể tải dữ liệu chi tiêu.",
                );
            })
            .finally(() => {
                if (!isCurrent) return;
                setIsLoading(false);
            });

        return () => {
            isCurrent = false;
        };
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            Promise.resolve().then(() => {
                setBudget(null);
                setBudgetError("");
                setIsBudgetLoading(false);
            });
            return;
        }

        let isCurrent = true;

        Promise.resolve().then(() => {
            if (!isCurrent) return;
            setIsBudgetLoading(true);
            setBudgetError("");
        });

        fetchBudget(userId)
            .then((nextBudget) => {
                if (!isCurrent) return;
                setBudget(nextBudget);
                setBudgetError("");
            })
            .catch((fetchError) => {
                if (!isCurrent) return;
                setBudgetError(
                    fetchError.message || "Không thể tải dữ liệu ngân sách.",
                );
            })
            .finally(() => {
                if (!isCurrent) return;
                setIsBudgetLoading(false);
            });

        return () => {
            isCurrent = false;
        };
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            Promise.resolve().then(() => {
                setGoals([]);
                setGoalsError("");
                setIsGoalsLoading(false);
            });
            return;
        }

        let isCurrent = true;

        Promise.resolve().then(() => {
            if (!isCurrent) return;
            setIsGoalsLoading(true);
            setGoalsError("");
        });

        fetchGoals(userId)
            .then((nextGoals) => {
                if (!isCurrent) return;
                setGoals(nextGoals);
                setGoalsError("");
            })
            .catch((fetchError) => {
                if (!isCurrent) return;
                setGoalsError(
                    fetchError.message || "Không thể tải dữ liệu mục tiêu.",
                );
            })
            .finally(() => {
                if (!isCurrent) return;
                setIsGoalsLoading(false);
            });

        return () => {
            isCurrent = false;
        };
    }, [userId]);

    const addTransaction = async (transaction) => {
        if (!userId) {
            throw new Error("Bạn cần đăng nhập để thêm khoản chi.");
        }

        const createdExpense = await createExpense({
            userId,
            amount: Number(transaction.amount),
            category: transaction.category,
            note: transaction.note,
        });

        setTransactions((current) => [createdExpense, ...current]);
        return createdExpense;
    };

    const deleteTransaction = async (id) => {
        await deleteExpense(id);
        setTransactions((current) => current.filter((item) => item.id !== id));
    };

    const createBudget = async (monthlyBudget) => {
        if (!userId) {
            throw new Error("Bạn cần đăng nhập để tạo ngân sách.");
        }

        const nextBudget = await createBudgetApi({
            userId,
            monthlyBudget: Number(monthlyBudget),
        });

        setBudget(nextBudget);
        setBudgetError("");
        return nextBudget;
    };

    const updateBudget = async (monthlyBudget) => {
        if (!userId) {
            throw new Error("Bạn cần đăng nhập để sửa ngân sách.");
        }

        if (!budget?.id) {
            throw new Error("Chưa có ngân sách để cập nhật.");
        }

        const nextBudget = await updateBudgetApi({
            id: budget.id,
            userId,
            monthlyBudget: Number(monthlyBudget),
        });

        setBudget(nextBudget);
        setBudgetError("");
        return nextBudget;
    };

    const createGoal = async ({ name, targetAmount, deadline }) => {
        if (!userId) {
            throw new Error("Bạn cần đăng nhập để tạo mục tiêu.");
        }

        const nextGoal = await createGoalApi({
            userId,
            name,
            targetAmount: Number(targetAmount),
            deadline,
        });

        setGoals((current) => [...current, nextGoal].sort(sortGoals));
        setGoalsError("");
        return nextGoal;
    };

    const updateGoal = async (id, { name, targetAmount, deadline }) => {
        const nextGoal = await updateGoalApi({
            id,
            name,
            targetAmount: Number(targetAmount),
            deadline,
        });

        setGoals((current) =>
            current
                .map((goal) => (goal.id === id ? nextGoal : goal))
                .sort(sortGoals),
        );
        setGoalsError("");
        return nextGoal;
    };

    const deleteGoal = async (id) => {
        await deleteGoalApi(id);
        setGoals((current) => current.filter((goal) => goal.id !== id));
    };

    const addGoalContribution = async ({ goalId, amount }) => {
        const nextGoal = await addGoalContributionApi({
            goalId,
            amount: Number(amount),
        });

        setGoals((current) =>
            current
                .map((goal) => (goal.id === goalId ? nextGoal : goal))
                .sort(sortGoals),
        );
        setGoalsError("");
        return nextGoal;
    };

    const getExpenseRecommendation = async ({ amount, category, note }) => {
        if (!userId) {
            throw new Error("Bạn cần đăng nhập để nhận lời khuyên.");
        }

        return getExpenseRecommendationApi({
            userId,
            amount: Number(amount),
            category,
            note,
        });
    };

    const updateSettings = (nextSettings) => {
        const localOnlySettings = { ...nextSettings };
        delete localOnlySettings.monthlyBudget;

        setLocalSettings((current) => ({ ...current, ...localOnlySettings }));
    };

    const resetData = () => {
        setLocalSettings(sampleSettings);
    };

    const summary = useMemo(() => {
        const expenses = transactions.filter((item) => item.type !== "income");
        const monthlySpent = expenses
            .filter((item) => isSameMonth(item.date))
            .reduce((total, item) => total + Number(item.amount), 0);
        const monthlyIncome = transactions
            .filter((item) => item.type === "income" && isSameMonth(item.date))
            .reduce((total, item) => total + Number(item.amount), 0);
        const remainingBudget = Math.max(
            settings.monthlyBudget - monthlySpent,
            0,
        );
        const now = new Date();

        const currentDay = now.getDate();

        const daysInMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
        ).getDate();

        const remainingDaysInMonth = Math.max(daysInMonth - currentDay + 1, 1);

        const dailyLimit = remainingBudget / remainingDaysInMonth;

        // CN=0, T2=1, ...
        const dayOfWeek = now.getDay();

        // số ngày còn lại trong tuần hiện tại
        const daysLeftInWeek = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

        const weeklyLimit = Math.min(
            dailyLimit * daysLeftInWeek,
            remainingBudget,
        );

        return {
            monthlySpent,
            monthlyIncome,
            remainingBudget,
            balance: monthlyIncome + remainingBudget,
            dailyLimit,
            weeklyLimit,
            budgetUsage: settings.monthlyBudget
                ? Math.min((monthlySpent / settings.monthlyBudget) * 100, 100)
                : 0,
        };
    }, [settings.monthlyBudget, transactions]);

    const value = {
        transactions,
        budget,
        goals,
        settings,
        summary,
        isLoading,
        isBudgetLoading,
        isGoalsLoading,
        error,
        budgetError,
        goalsError,
        addGoalContribution,
        addTransaction,
        createBudget,
        createGoal,
        deleteGoal,
        deleteTransaction,
        getExpenseRecommendation,
        refreshExpenses,
        refreshBudget,
        refreshGoals,
        updateBudget,
        updateGoal,
        updateSettings,
        resetData,
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
}
