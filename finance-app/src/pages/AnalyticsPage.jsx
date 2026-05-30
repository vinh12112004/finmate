import { useMemo } from 'react'
import {
  AppPage,
  EmptyState,
  ProgressBar,
  StatCard,
  Surface,
} from '../components/ui'
import { useFinance } from '../hooks/useFinance'
import { formatCategory } from '../utils/categoryLabels'
import { currentMonthLabel, isSameMonth } from '../utils/dateUtils'
import { formatCurrency } from '../utils/formatCurrency'

const categoryIcons = {
  'Food & Drink': 'restaurant',
  'Ăn uống': 'restaurant',
  Coffee: 'local_cafe',
  'Cà phê': 'local_cafe',
  Transport: 'directions_bus',
  'Di chuyển': 'directions_bus',
  Education: 'book',
  'Học tập': 'book',
  Subscriptions: 'subscriptions',
  'Đăng ký': 'subscriptions',
}

export function AnalyticsPage() {
  const { settings, transactions, summary } = useFinance()
  const currency = settings.currency || 'VND'

  const monthlyExpenses = useMemo(
    () =>
      transactions.filter(
        (item) => item.type !== 'income' && isSameMonth(item.date),
      ),
    [transactions],
  )

  const categoryTotals = useMemo(() => {
    const totals = monthlyExpenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount)
      return acc
    }, {})

    return Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
  }, [monthlyExpenses])

  const dailyTotals = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        total: 0,
      }
    })

    const dayMap = Object.fromEntries(days.map((day) => [day.key, day]))

    transactions
      .filter((item) => item.type !== 'income' && dayMap[item.date])
      .forEach((item) => {
        dayMap[item.date].total += Number(item.amount)
      })

    return days
  }, [transactions])

  const maxCategory = Math.max(...categoryTotals.map((item) => item.total), 1)
  const maxDaily = Math.max(...dailyTotals.map((item) => item.total), 1)
  const topCategory = categoryTotals[0]

  return (
    <AppPage
      eyebrow={currentMonthLabel()}
      title="Phân tích chi tiêu"
      description="Nhìn nhanh danh mục chi nhiều, tốc độ dùng ngân sách và nhịp chi trong 7 ngày gần nhất."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon="payments"
          label="Tổng đã chi"
          value={formatCurrency(summary.monthlySpent, currency)}
        />
        <StatCard
          icon="savings"
          label="Còn lại"
          value={formatCurrency(summary.remainingBudget, currency)}
          tone="secondary"
        />
        <StatCard
          icon="pie_chart"
          label="Danh mục top"
          value={topCategory ? formatCategory(topCategory.category) : 'Chưa có'}
          tone="tertiary"
        />
      </section>

      <Surface className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-headline text-lg font-extrabold text-on-surface">
              Ngân sách tháng
            </h2>
            <p className="mt-1 font-body text-sm text-on-surface-variant">
              Đã dùng {Math.round(summary.budgetUsage)}% ngân sách.
            </p>
          </div>
          <span className="rounded-full bg-primary-container/45 px-3 py-1 font-label text-xs font-bold text-primary">
            {formatCurrency(settings.monthlyBudget, currency)}
          </span>
        </div>
        <ProgressBar
          value={summary.budgetUsage}
          tone={summary.budgetUsage >= 80 ? 'danger' : 'primary'}
        />
      </Surface>

      <Surface className="space-y-5">
        <div>
          <h2 className="font-headline text-lg font-extrabold text-on-surface">
            7 ngày gần nhất
          </h2>
          <p className="mt-1 font-body text-sm text-on-surface-variant">
            Dữ liệu lấy từ các khoản chi đã lưu.
          </p>
        </div>
        <div className="flex h-40 items-end justify-between gap-2">
          {dailyTotals.map((item) => {
            const height = item.total ? Math.max((item.total / maxDaily) * 100, 8) : 4
            return (
              <div key={item.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-28 w-full items-end rounded-lg bg-surface-container-low px-1">
                  <div
                    className="w-full rounded-md bg-primary"
                    style={{ height: `${height}%` }}
                    title={formatCurrency(item.total, currency)}
                  />
                </div>
                <span className="font-label text-[11px] font-bold text-on-surface-variant">
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </Surface>

      <Surface className="space-y-4">
        <div>
          <h2 className="font-headline text-lg font-extrabold text-on-surface">
            Danh mục chi nhiều
          </h2>
          <p className="mt-1 font-body text-sm text-on-surface-variant">
            Tỷ trọng theo tháng hiện tại.
          </p>
        </div>

        {categoryTotals.length ? (
          <div className="space-y-4">
            {categoryTotals.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                    <span className="material-symbols-outlined icon-fill text-[20px]">
                      {categoryIcons[item.category] || 'receipt_long'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-label text-sm font-bold text-on-surface">
                        {formatCategory(item.category)}
                      </p>
                      <p className="shrink-0 font-label text-sm font-bold text-on-surface">
                        {formatCurrency(item.total, currency)}
                      </p>
                    </div>
                    <ProgressBar value={(item.total / maxCategory) * 100} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="insights" title="Chưa có dữ liệu tháng này">
            Thêm khoản chi để xem phân tích theo danh mục và ngày.
          </EmptyState>
        )}
      </Surface>
    </AppPage>
  )
}
