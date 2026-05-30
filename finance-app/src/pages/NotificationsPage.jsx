import { useMemo, useState } from "react";
import {
    ActionButton,
    AppPage,
    SegmentedControl,
    Surface,
} from "../components/ui";
import { useFinance } from "../hooks/useFinance";
import { formatCategory } from "../utils/categoryLabels";
import { formatCurrency } from "../utils/formatCurrency";

export function NotificationsPage() {
    const { summary, settings, transactions } = useFinance();
    const [readAll, setReadAll] = useState(false);
    const [filter, setFilter] = useState("all");
    const currency = settings.currency || "VND";

    const highestExpense = useMemo(
        () =>
            transactions
                .filter((item) => item.type !== "income")
                .sort((a, b) => Number(b.amount) - Number(a.amount))[0],
        [transactions],
    );

    const alerts = [
        {
            id: "budget",
            type: "budget",
            title:
                summary.budgetUsage >= 80
                    ? "Sắp chạm giới hạn ngân sách"
                    : "Nhịp chi tiêu đang ổn",
            body:
                summary.budgetUsage >= 80
                    ? `Bạn đã dùng ${Math.round(summary.budgetUsage)}% trong ngân sách tháng ${formatCurrency(settings.monthlyBudget, currency)}.`
                    : `Bạn vẫn còn ${formatCurrency(summary.remainingBudget, currency)} trong tháng này.`,
            icon: summary.budgetUsage >= 80 ? "warning" : "savings",
            urgent: summary.budgetUsage >= 80,
            action: "Xem ngân sách",
            to: "/settings",
            time: "Bây giờ",
        },
        {
            id: "high-spend",
            type: "spend",
            title: highestExpense
                ? "Khoản chi lớn gần đây"
                : "Chưa có khoản chi",
            body: highestExpense
                ? `${highestExpense.title} là ${formatCurrency(highestExpense.amount, currency)} trong danh mục ${formatCategory(highestExpense.category)}.`
                : "Thêm khoản chi đầu tiên để bắt đầu nhận cảnh báo thông minh.",
            icon: "receipt_long",
            action: "Thêm khoản chi",
            to: "/add-expense",
            time: "Hôm nay",
        },
        // {
        //   id: 'subscription',
        //   type: 'subscription',
        //   title: 'Gợi ý theo dõi đăng ký',
        //   body: 'Bật cảnh báo đăng ký để FinMate nhắc bạn khi có khoản định kỳ cần chú ý.',
        //   icon: 'subscriptions',
        //   action: 'Cài đặt',
        //   to: '/settings',
        //   time: 'Gợi ý',
        // },
    ];

    const visibleAlerts =
        filter === "all"
            ? alerts
            : alerts.filter((alert) => alert.type === filter);

    return (
        <AppPage
            eyebrow="Thông báo"
            title="Cảnh báo tài chính"
            description="Các gợi ý ngắn giúp bạn phản ứng trước khi vượt ngân sách."
            actions={
                <ActionButton
                    variant="secondary"
                    icon="done_all"
                    onClick={() => setReadAll(true)}
                >
                    Đã đọc
                </ActionButton>
            }
        >
            <SegmentedControl
                value={filter}
                onChange={setFilter}
                options={[
                    { value: "all", label: "Tất cả" },
                    { value: "budget", label: "Ngân sách" },
                    { value: "spend", label: "Chi tiêu" },
                    { value: "subscription", label: "Đăng ký" },
                ]}
            />

            <div className="space-y-3">
                {visibleAlerts.map((alert) => (
                    <Surface
                        key={alert.id}
                        className={`relative overflow-hidden ${readAll ? "opacity-70" : ""}`}
                    >
                        {alert.urgent && !readAll ? (
                            <div className="absolute inset-y-0 left-0 w-1 bg-error" />
                        ) : null}
                        <div className="flex items-start gap-3">
                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                                    alert.urgent
                                        ? "bg-error-container/35 text-error"
                                        : "bg-primary-container/45 text-primary"
                                }`}
                            >
                                <span className="material-symbols-outlined icon-fill text-[22px]">
                                    {alert.icon}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="font-headline text-base font-extrabold text-on-surface">
                                        {alert.title}
                                    </h2>
                                    <span className="shrink-0 font-label text-[11px] font-bold text-on-surface-variant">
                                        {readAll ? "Đã đọc" : alert.time}
                                    </span>
                                </div>
                                <p className="mt-1 font-body text-sm leading-relaxed text-on-surface-variant">
                                    {alert.body}
                                </p>
                                <ActionButton
                                    to={alert.to}
                                    variant="subtle"
                                    size="sm"
                                    className="mt-3"
                                >
                                    {alert.action}
                                </ActionButton>
                            </div>
                        </div>
                    </Surface>
                ))}
            </div>
        </AppPage>
    );
}
