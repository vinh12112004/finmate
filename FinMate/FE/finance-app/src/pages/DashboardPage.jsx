import { TransactionIcon } from "../components/common/TransactionIcon";
import {
    ActionButton,
    AlertBanner,
    AppPage,
    EmptyState,
    ProgressBar,
    StatCard,
    Surface,
    TransactionRow,
} from "../components/ui";
import { useFinance } from "../hooks/useFinance";
import { formatCategory } from "../utils/categoryLabels";
import { formatTransactionDate } from "../utils/dateUtils";
import { formatCurrency } from "../utils/formatCurrency";

export function DashboardPage() {
    const {
        error,
        isLoading,
        refreshExpenses,
        settings,
        summary,
        transactions,
    } = useFinance();
    const currency = settings.currency || "VND";
    const recentTransactions = transactions.slice(0, 5);
    const today = new Date();
    // const sevenDaysAgo = new Date();
    const startOfWeek = new Date(today);

    const day = today.getDay(); // CN=0, T2=1, ...
    const diff = day === 0 ? 6 : day - 1;

    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(today.getDate() - diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const todaySpent = transactions
        .filter(
            (item) =>
                item.type !== "income" &&
                item.date === new Date().toISOString().slice(0, 10),
        )
        .reduce((total, item) => total + Number(item.amount), 0);

    const weeklySpent = transactions
        .filter((item) => {
            if (item.type === "income") return false;

            const date = new Date(`${item.date}T12:00:00`);

            return date >= startOfWeek && date <= endOfWeek;
        })
        .reduce((total, item) => total + Number(item.amount), 0);

    const dailyPercent = Math.min(
        (todaySpent / Math.max(summary.dailyLimit, 1)) * 100,
        100,
    );
    const weeklyPercent = Math.min(
        (weeklySpent / Math.max(summary.weeklyLimit, 1)) * 100,
        100,
    );

    return (
        <AppPage
            eyebrow="Hôm nay"
            title={formatCurrency(summary.dailyLimit, currency)}
            description={
                summary.budgetUsage < 80
                    ? "Số tiền gợi ý có thể chi hôm nay để giữ ngân sách tháng ổn định."
                    : "Ngân sách tháng đang sát giới hạn. Hãy ưu tiên các khoản cần thiết."
            }
            actions={
                <ActionButton to="/add-expense" icon="add">
                    Thêm khoản chi
                </ActionButton>
            }
        >
            <section className="grid gap-3 sm:grid-cols-3">
                <StatCard
                    icon="account_balance_wallet"
                    label="Còn lại tháng"
                    value={formatCurrency(summary.remainingBudget, currency)}
                />
                <StatCard
                    icon="today"
                    label="Đã chi hôm nay"
                    value={formatCurrency(todaySpent, currency)}
                    tone="tertiary"
                />
                <StatCard
                    icon="calendar_view_week"
                    label="Tuần này"
                    value={formatCurrency(weeklySpent, currency)}
                    tone="secondary"
                />
            </section>

            <Surface className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="font-headline text-lg font-extrabold text-on-surface">
                            Nhịp chi tiêu
                        </h2>
                        <p className="mt-1 font-body text-sm text-on-surface-variant">
                            Theo dõi ngày và tuần để không vượt ngân sách.
                        </p>
                    </div>
                    <span className="rounded-full bg-primary-container/45 px-3 py-1 font-label text-xs font-bold text-primary">
                        {Math.round(summary.budgetUsage)}%
                    </span>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="font-label text-sm font-bold text-on-surface">
                                Giới hạn ngày
                            </p>
                            <p className="font-label text-xs font-bold text-on-surface-variant">
                                {formatCurrency(todaySpent, currency)} /{" "}
                                {formatCurrency(summary.dailyLimit, currency)}
                            </p>
                        </div>
                        <ProgressBar value={dailyPercent} />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="font-label text-sm font-bold text-on-surface">
                                Giới hạn tuần
                            </p>
                            <p className="font-label text-xs font-bold text-on-surface-variant">
                                {formatCurrency(weeklySpent, currency)} /{" "}
                                {formatCurrency(summary.weeklyLimit, currency)}
                            </p>
                        </div>
                        <ProgressBar value={weeklyPercent} tone="tertiary" />
                    </div>
                </div>
            </Surface>

            {error ? (
                <AlertBanner
                    tone="error"
                    action={
                        <ActionButton
                            variant="secondary"
                            size="sm"
                            onClick={refreshExpenses}
                        >
                            Tải lại
                        </ActionButton>
                    }
                >
                    {error}
                </AlertBanner>
            ) : null}

            <Surface className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-headline text-lg font-extrabold text-on-surface">
                            Gần đây
                        </h2>
                        <p className="font-body text-sm text-on-surface-variant">
                            5 khoản chi mới nhất
                        </p>
                    </div>
                    <ActionButton to="/history" variant="subtle" size="sm">
                        Xem tất cả
                    </ActionButton>
                </div>

                {isLoading ? (
                    <p className="rounded-lg bg-surface-container-low p-4 font-body text-sm text-on-surface-variant">
                        Đang tải khoản chi...
                    </p>
                ) : recentTransactions.length ? (
                    <div className="space-y-2">
                        {recentTransactions.map((transaction) => (
                            <TransactionRow
                                key={transaction.id}
                                amount={transaction.amount}
                                category={formatCategory(transaction.category)}
                                currency={(value) =>
                                    formatCurrency(value, currency)
                                }
                                date={formatTransactionDate(transaction.date)}
                                icon={
                                    <TransactionIcon
                                        category={transaction.category}
                                    />
                                }
                                note={transaction.note}
                                title={transaction.title}
                                type={transaction.type}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="receipt_long"
                        title="Chưa có khoản chi"
                        action={
                            <ActionButton to="/add-expense" icon="add">
                                Thêm khoản chi
                            </ActionButton>
                        }
                    >
                        Tạo khoản chi đầu tiên để FinMate bắt đầu tính ngân sách
                        hằng ngày.
                    </EmptyState>
                )}
            </Surface>
        </AppPage>
    );
}
