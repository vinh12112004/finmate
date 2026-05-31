import { useState } from "react";
import {
    ActionButton,
    AlertBanner,
    AppPage,
    SelectField,
    Surface,
    TextField,
} from "../components/ui";
import { useFinance } from "../hooks/useFinance";

const currencies = [
    { code: "VND", label: "VND - Đồng Việt Nam" },
    { code: "USD", label: "USD - Đô la Mỹ" },
    { code: "EUR", label: "EUR - Euro" },
    { code: "JPY", label: "JPY - Yên Nhật" },
    { code: "KRW", label: "KRW - Won Hàn Quốc" },
    { code: "GBP", label: "GBP - Bảng Anh" },
    { code: "CNY", label: "CNY - Nhân dân tệ" },
];

const currencySymbols = {
    VND: "₫",
    USD: "$",
    EUR: "€",
    JPY: "¥",
    KRW: "₩",
    GBP: "£",
    CNY: "¥",
};

export function SettingsPage() {
    const {
        budget,
        budgetError,
        createBudget,
        isBudgetLoading,
        refreshBudget,
        settings,
        updateBudget,
        updateSettings,
        resetData,
    } = useFinance();
    const [saved, setSaved] = useState(false);
    const currency = settings.currency || "VND";
    const hasBudget = Boolean(budget?.id);

    const showSaved = () => {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1400);
    };

    const update = (nextSettings) => {
        updateSettings(nextSettings);
        showSaved();
    };

    const handleReset = () => {
        resetData();
        showSaved();
    };

    return (
        <AppPage
            eyebrow="Tùy chọn"
            title="Cài đặt"
            description="Quản lý ngân sách, đơn vị tiền tệ và cảnh báo thông minh."
        >
            {saved ? (
                <AlertBanner tone="success">Đã lưu thay đổi.</AlertBanner>
            ) : null}

            <Surface className="space-y-5">
                <SectionTitle
                    icon="account_balance_wallet"
                    title="Ngân sách tháng"
                    description="Đặt mục tiêu để FinMate tính giới hạn ngày và tuần."
                />
                <BudgetForm
                    key={budget?.id || "new-budget"}
                    budgetError={budgetError}
                    createBudget={createBudget}
                    currency={currency}
                    hasBudget={hasBudget}
                    initialMonthlyBudget={
                        hasBudget ? settings.monthlyBudget : ""
                    }
                    isBudgetLoading={isBudgetLoading}
                    onRefresh={refreshBudget}
                    onSaved={showSaved}
                    updateBudget={updateBudget}
                />
            </Surface>

            <Surface className="space-y-5">
                <SectionTitle
                    icon="payments"
                    title="Đơn vị tiền tệ"
                    description="Chỉ thay đổi định dạng hiển thị, không quy đổi giá trị."
                />
                <SelectField
                    id="currency"
                    label="Định dạng hiển thị"
                    value={currency}
                    onChange={(event) =>
                        update({ currency: event.target.value })
                    }
                >
                    {currencies.map((item) => (
                        <option key={item.code} value={item.code}>
                            {item.label}
                        </option>
                    ))}
                </SelectField>
            </Surface>

            <Surface className="space-y-4">
                <SectionTitle
                    icon="notifications_active"
                    title="Cảnh báo thông minh"
                    description="Bật các gợi ý giúp bạn phản ứng sớm với thay đổi chi tiêu."
                />
                <ToggleRow
                    title="Cảnh báo vượt chi"
                    description="Nhận thông báo khi vượt 80% ngân sách."
                    checked={settings.smartAlerts}
                    onChange={(checked) => update({ smartAlerts: checked })}
                />
                {/* <ToggleRow
          title="Đăng ký bất thường"
          description="Theo dõi các khoản định kỳ cần chú ý."
          checked={settings.subscriptionAlerts}
          onChange={(checked) => update({ subscriptionAlerts: checked })}
        /> */}
            </Surface>

            <Surface className="space-y-4">
                <SectionTitle
                    icon="database"
                    title="Dữ liệu cục bộ"
                    description="Đưa các tùy chọn hiển thị về mặc định."
                    tone="danger"
                />
                <ActionButton
                    variant="danger"
                    icon="restart_alt"
                    onClick={handleReset}
                    className="w-full"
                >
                    Đặt lại dữ liệu cục bộ
                </ActionButton>
            </Surface>
        </AppPage>
    );
}

function BudgetForm({
    budgetError,
    createBudget,
    currency,
    hasBudget,
    initialMonthlyBudget,
    isBudgetLoading,
    onRefresh,
    onSaved,
    updateBudget,
}) {
    const [budgetInput, setBudgetInput] = useState(
        initialMonthlyBudget ? String(initialMonthlyBudget) : "",
    );
    const [budgetFormError, setBudgetFormError] = useState("");
    const [isSavingBudget, setIsSavingBudget] = useState(false);

    const handleBudgetSubmit = async (event) => {
        event.preventDefault();

        const monthlyBudget = Number(budgetInput);
        if (!monthlyBudget || monthlyBudget <= 0) {
            setBudgetFormError("Ngân sách tháng phải lớn hơn 0.");
            return;
        }

        setBudgetFormError("");
        setIsSavingBudget(true);

        try {
            if (hasBudget) {
                await updateBudget(monthlyBudget);
            } else {
                await createBudget(monthlyBudget);
            }

            onSaved();
        } catch (saveError) {
            setBudgetFormError(saveError.message || "Không thể lưu ngân sách.");
        } finally {
            setIsSavingBudget(false);
        }
    };

    return (
        <form onSubmit={handleBudgetSubmit} className="space-y-4">
            {isBudgetLoading ? (
                <p className="font-body text-sm text-on-surface-variant">
                    Đang tải ngân sách...
                </p>
            ) : null}

            {budgetError ? (
                <AlertBanner
                    tone="error"
                    action={
                        <ActionButton
                            variant="secondary"
                            size="sm"
                            onClick={onRefresh}
                        >
                            Tải lại
                        </ActionButton>
                    }
                >
                    {budgetError}
                </AlertBanner>
            ) : null}

            {!isBudgetLoading ? (
                <>
                    <TextField
                        label={`Mục tiêu chi tháng (${currencySymbols[currency] || currency})`}
                        min="0"
                        type="number"
                        value={budgetInput}
                        onChange={(event) => setBudgetInput(event.target.value)}
                        disabled={isSavingBudget}
                        placeholder="Nhập ngân sách tháng"
                    />
                    {budgetFormError ? (
                        <AlertBanner tone="error">
                            {budgetFormError}
                        </AlertBanner>
                    ) : null}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-body text-sm text-on-surface-variant">
                            {hasBudget
                                ? "Ngân sách đã được tạo. Bạn có thể cập nhật giá trị."
                                : "Bạn chưa có ngân sách tháng. Hãy tạo ngân sách trước."}
                        </p>
                        <ActionButton type="submit" disabled={isSavingBudget}>
                            {isSavingBudget
                                ? "Đang lưu..."
                                : hasBudget
                                  ? "Lưu ngân sách"
                                  : "Tạo ngân sách"}
                        </ActionButton>
                    </div>
                </>
            ) : null}
        </form>
    );
}

function SectionTitle({ description, icon, title, tone = "primary" }) {
    const toneClass =
        tone === "danger"
            ? "text-error bg-error-container/25"
            : "text-primary bg-primary-container/45";

    return (
        <div className="flex items-start gap-3">
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClass}`}
            >
                <span className="material-symbols-outlined icon-fill text-[22px]">
                    {icon}
                </span>
            </div>
            <div>
                <h2 className="font-headline text-lg font-extrabold text-on-surface">
                    {title}
                </h2>
                <p className="mt-1 font-body text-sm leading-relaxed text-on-surface-variant">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ToggleRow({ title, description, checked, onChange }) {
    return (
        <label className="flex items-center justify-between gap-4 rounded-lg bg-surface-container-low p-4">
            <span>
                <span className="block font-headline text-base font-bold text-on-surface">
                    {title}
                </span>
                <span className="mt-1 block font-body text-sm leading-relaxed text-on-surface-variant">
                    {description}
                </span>
            </span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-6 w-6 shrink-0 accent-primary"
            />
        </label>
    );
}
