import { useMemo, useState } from 'react'
import { TransactionIcon } from '../components/common/TransactionIcon'
import {
  ActionButton,
  AlertBanner,
  AppPage,
  EmptyState,
  SelectField,
  Surface,
  TextField,
  TransactionRow,
} from '../components/ui'
import { useFinance } from '../hooks/useFinance'
import { formatCategory } from '../utils/categoryLabels'
import { formatTransactionDate } from '../utils/dateUtils'
import { formatCurrency } from '../utils/formatCurrency'

const pageSize = 10

export function HistoryPage() {
  const { error, isLoading, refreshExpenses, settings, transactions } =
    useFinance()
  const currency = settings.currency || 'VND'
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const allExpenses = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type !== 'income')
        .sort(
          (a, b) =>
            new Date(`${b.date}T12:00:00`) - new Date(`${a.date}T12:00:00`),
        ),
    [transactions],
  )

  const categories = useMemo(
    () =>
      [...new Set(allExpenses.map((transaction) => transaction.category))].sort(),
    [allExpenses],
  )

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return allExpenses.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        transaction.title.toLowerCase().includes(normalizedSearch) ||
        (transaction.note || '').toLowerCase().includes(normalizedSearch)
      const matchesCategory =
        category === 'All' || transaction.category === category
      const matchesFromDate = !fromDate || transaction.date >= fromDate
      const matchesToDate = !toDate || transaction.date <= toDate

      return (
        matchesSearch && matchesCategory && matchesFromDate && matchesToDate
      )
    })
  }, [allExpenses, category, fromDate, search, toDate])

  const pageCount = Math.max(Math.ceil(filteredExpenses.length / pageSize), 1)
  const effectiveCurrentPage = Math.min(currentPage, pageCount)
  const paginatedExpenses = filteredExpenses.slice(
    (effectiveCurrentPage - 1) * pageSize,
    effectiveCurrentPage * pageSize,
  )
  const totalSpent = allExpenses.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0,
  )
  const filteredSpent = filteredExpenses.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0,
  )
  const hasFilters = Boolean(search || category !== 'All' || fromDate || toDate)
  const hasExpenses = allExpenses.length > 0

  const resetPage = (setter) => (value) => {
    setter(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setFromDate('')
    setToDate('')
    setCurrentPage(1)
  }

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(Math.min(page, pageCount) - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(Math.min(page, pageCount) + 1, pageCount))
  }

  return (
    <AppPage
      eyebrow="Lịch sử"
      title="Tất cả khoản chi"
      description="Tìm kiếm và lọc các khoản chi đã lưu từ backend."
      actions={
        <ActionButton to="/add-expense" icon="add">
          Thêm
        </ActionButton>
      }
    >
      <Surface className="flex items-center justify-between gap-4">
        <div>
          <p className="font-label text-xs font-bold uppercase text-on-surface-variant">
            Tổng đã chi
          </p>
          <p className="mt-1 font-headline text-2xl font-extrabold text-on-surface">
            {formatCurrency(hasFilters ? filteredSpent : totalSpent, currency)}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container/55 text-primary">
          <span className="material-symbols-outlined icon-fill">payments</span>
        </div>
      </Surface>

      {error ? (
        <AlertBanner
          tone="error"
          action={
            <ActionButton variant="secondary" size="sm" onClick={refreshExpenses}>
              Tải lại
            </ActionButton>
          }
        >
          {error}
        </AlertBanner>
      ) : null}

      {hasExpenses ? (
        <Surface className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <TextField
              label="Tìm kiếm"
              type="search"
              placeholder="Tên hoặc ghi chú"
              value={search}
              onChange={(event) => resetPage(setSearch)(event.target.value)}
            />
            <SelectField
              label="Danh mục"
              value={category}
              onChange={(event) => resetPage(setCategory)(event.target.value)}
            >
              <option value="All">Tất cả danh mục</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {formatCategory(item)}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Từ ngày"
              type="date"
              value={fromDate}
              onChange={(event) => resetPage(setFromDate)(event.target.value)}
            />
            <TextField
              label="Đến ngày"
              type="date"
              value={toDate}
              onChange={(event) => resetPage(setToDate)(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-label text-sm font-semibold text-on-surface-variant">
              {filteredExpenses.length} / {allExpenses.length} khoản chi
            </p>
            {hasFilters ? (
              <ActionButton variant="secondary" size="sm" onClick={clearFilters}>
                Xóa bộ lọc
              </ActionButton>
            ) : null}
          </div>
        </Surface>
      ) : null}

      {isLoading ? (
        <Surface>
          <p className="font-body text-sm text-on-surface-variant">
            Đang tải lịch sử chi tiêu...
          </p>
        </Surface>
      ) : hasExpenses ? (
        filteredExpenses.length ? (
          <Surface className="space-y-3">
            {paginatedExpenses.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                amount={transaction.amount}
                category={formatCategory(transaction.category)}
                currency={(value) => formatCurrency(value, currency)}
                date={formatTransactionDate(transaction.date)}
                icon={<TransactionIcon category={transaction.category} />}
                note={transaction.note}
                title={transaction.title}
              />
            ))}

            {filteredExpenses.length > pageSize ? (
              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="font-label text-sm font-semibold text-on-surface-variant">
                  Trang {effectiveCurrentPage} / {pageCount}
                </p>
                <div className="flex items-center gap-2">
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={effectiveCurrentPage === 1}
                  >
                    Trước
                  </ActionButton>
                  <ActionButton
                    size="sm"
                    onClick={goToNextPage}
                    disabled={effectiveCurrentPage === pageCount}
                  >
                    Sau
                  </ActionButton>
                </div>
              </div>
            ) : null}
          </Surface>
        ) : (
          <EmptyState
            icon="filter_alt_off"
            title="Không có khoản chi phù hợp"
            action={
              <ActionButton onClick={clearFilters} variant="secondary">
                Xóa bộ lọc
              </ActionButton>
            }
          >
            Hãy thử từ khóa, danh mục hoặc khoảng ngày khác.
          </EmptyState>
        )
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
          Thêm khoản chi đầu tiên để bắt đầu tạo lịch sử chi tiêu.
        </EmptyState>
      )}
    </AppPage>
  )
}
