import { useMemo, useState } from 'react'
import {
  ActionButton,
  AlertBanner,
  AppPage,
  BottomSheet,
  EmptyState,
  ProgressBar,
  SelectField,
  Surface,
  TextField,
} from '../components/ui'
import { useFinance } from '../hooks/useFinance'
import { formatCurrency } from '../utils/formatCurrency'

const emptyGoalForm = {
  name: '',
  targetAmount: '',
  deadline: '',
}

function formatGoalDate(value) {
  if (!value) return 'Chưa đặt'
  return new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function GoalsPage() {
  const {
    addGoalContribution,
    createGoal,
    deleteGoal,
    goals,
    goalsError,
    isGoalsLoading,
    refreshGoals,
    settings,
    updateGoal,
  } = useFinance()
  const currency = settings.currency || 'VND'
  const [isGoalSheetOpen, setIsGoalSheetOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [goalForm, setGoalForm] = useState(emptyGoalForm)
  const [goalFormError, setGoalFormError] = useState('')
  const [isSavingGoal, setIsSavingGoal] = useState(false)
  const [isContributionSheetOpen, setIsContributionSheetOpen] = useState(false)
  const [contributionGoalId, setContributionGoalId] = useState('')
  const [contributionAmount, setContributionAmount] = useState('')
  const [contributionError, setContributionError] = useState('')
  const [isSavingContribution, setIsSavingContribution] = useState(false)

  const totals = useMemo(
    () =>
      goals.reduce(
        (acc, goal) => ({
          target: acc.target + Number(goal.targetAmount),
          current: acc.current + Number(goal.currentAmount),
        }),
        { target: 0, current: 0 },
      ),
    [goals],
  )

  const openCreateGoal = () => {
    setEditingGoal(null)
    setGoalForm(emptyGoalForm)
    setGoalFormError('')
    setIsGoalSheetOpen(true)
  }

  const openEditGoal = (goal) => {
    setEditingGoal(goal)
    setGoalForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      deadline: goal.deadline,
    })
    setGoalFormError('')
    setIsGoalSheetOpen(true)
  }

  const closeGoalSheet = () => {
    if (isSavingGoal) return
    setIsGoalSheetOpen(false)
    setGoalFormError('')
  }

  const openContribution = (goal) => {
    setContributionGoalId(goal?.id ? String(goal.id) : goals[0]?.id ? String(goals[0].id) : '')
    setContributionAmount('')
    setContributionError('')
    setIsContributionSheetOpen(true)
  }

  const closeContributionSheet = () => {
    if (isSavingContribution) return
    setIsContributionSheetOpen(false)
    setContributionError('')
  }

  const updateGoalField = (field, value) => {
    setGoalForm((current) => ({ ...current, [field]: value }))
    setGoalFormError('')
  }

  const handleGoalSubmit = async (event) => {
    event.preventDefault()
    const name = goalForm.name.trim()
    const targetAmount = Number(goalForm.targetAmount)

    if (!name) {
      setGoalFormError('Vui lòng nhập tên mục tiêu.')
      return
    }

    if (!targetAmount || targetAmount <= 0) {
      setGoalFormError('Số tiền mục tiêu phải lớn hơn 0.')
      return
    }

    if (!goalForm.deadline) {
      setGoalFormError('Vui lòng chọn deadline.')
      return
    }

    setGoalFormError('')
    setIsSavingGoal(true)

    try {
      const payload = {
        name,
        targetAmount,
        deadline: goalForm.deadline,
      }

      if (editingGoal) {
        await updateGoal(editingGoal.id, payload)
      } else {
        await createGoal(payload)
      }

      setIsGoalSheetOpen(false)
    } catch (saveError) {
      setGoalFormError(saveError.message || 'Không thể lưu mục tiêu.')
    } finally {
      setIsSavingGoal(false)
    }
  }

  const handleDeleteGoal = async (goal) => {
    if (!window.confirm(`Xóa mục tiêu "${goal.name}"?`)) return

    try {
      await deleteGoal(goal.id)
    } catch (deleteError) {
      setGoalFormError(deleteError.message || 'Không thể xóa mục tiêu.')
    }
  }

  const handleContributionSubmit = async (event) => {
    event.preventDefault()
    const amount = Number(contributionAmount)
    const goalId = Number(contributionGoalId)

    if (!goalId) {
      setContributionError('Vui lòng chọn mục tiêu.')
      return
    }

    if (!amount || amount <= 0) {
      setContributionError('Số tiền tiết kiệm phải lớn hơn 0.')
      return
    }

    setContributionError('')
    setIsSavingContribution(true)

    try {
      await addGoalContribution({ goalId, amount })
      await refreshGoals()
      setIsContributionSheetOpen(false)
    } catch (saveError) {
      setContributionError(saveError.message || 'Không thể thêm tiền tiết kiệm.')
    } finally {
      setIsSavingContribution(false)
    }
  }

  return (
    <AppPage
      eyebrow="Mục tiêu"
      title="Mục tiêu tài chính"
      description="Theo dõi tiến độ tiết kiệm và thêm đóng góp cho từng mục tiêu."
      actions={
        <>
          <ActionButton icon="add" onClick={openCreateGoal}>
            Thêm Goal
          </ActionButton>
          {goals.length ? (
            <ActionButton
              variant="secondary"
              icon="savings"
              onClick={() => openContribution(null)}
            >
              Tiết kiệm thêm
            </ActionButton>
          ) : null}
        </>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2">
        <Surface className="flex items-center justify-between gap-4">
          <div>
            <p className="font-label text-xs font-bold uppercase text-on-surface-variant">
              Đã tiết kiệm
            </p>
            <p className="mt-1 font-headline text-2xl font-extrabold text-on-surface">
              {formatCurrency(totals.current, currency)}
            </p>
          </div>
          <span className="material-symbols-outlined icon-fill text-primary text-[32px]">
            savings
          </span>
        </Surface>
        <Surface className="flex items-center justify-between gap-4">
          <div>
            <p className="font-label text-xs font-bold uppercase text-on-surface-variant">
              Tổng mục tiêu
            </p>
            <p className="mt-1 font-headline text-2xl font-extrabold text-on-surface">
              {formatCurrency(totals.target, currency)}
            </p>
          </div>
          <span className="material-symbols-outlined icon-fill text-tertiary text-[32px]">
            flag
          </span>
        </Surface>
      </section>

      {goalsError ? (
        <AlertBanner
          tone="error"
          action={
            <ActionButton variant="secondary" size="sm" onClick={refreshGoals}>
              Tải lại
            </ActionButton>
          }
        >
          {goalsError}
        </AlertBanner>
      ) : null}

      {goalFormError && !isGoalSheetOpen ? (
        <AlertBanner tone="error">{goalFormError}</AlertBanner>
      ) : null}

      {isGoalsLoading ? (
        <Surface>
          <p className="font-body text-sm text-on-surface-variant">
            Đang tải mục tiêu...
          </p>
        </Surface>
      ) : goals.length ? (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              currency={currency}
              onAddContribution={() => openContribution(goal)}
              onDelete={() => handleDeleteGoal(goal)}
              onEdit={() => openEditGoal(goal)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="flag"
          title="Chưa có mục tiêu"
          action={
            <ActionButton icon="add" onClick={openCreateGoal}>
              Thêm mục tiêu
            </ActionButton>
          }
        >
          Tạo mục tiêu đầu tiên để FinMate giúp bạn cân bằng chi tiêu và tiết kiệm.
        </EmptyState>
      )}

      <BottomSheet
        open={isGoalSheetOpen}
        title={editingGoal ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}
        description="Nhập số tiền mục tiêu và deadline để theo dõi tiến độ."
        onClose={closeGoalSheet}
        footer={
          <>
            <ActionButton
              variant="secondary"
              disabled={isSavingGoal}
              onClick={closeGoalSheet}
            >
              Hủy
            </ActionButton>
            <ActionButton disabled={isSavingGoal} onClick={handleGoalSubmit}>
              {isSavingGoal ? 'Đang lưu...' : 'Lưu'}
            </ActionButton>
          </>
        }
      >
        <form onSubmit={handleGoalSubmit} className="space-y-4">
          <TextField
            label="Tên mục tiêu"
            disabled={isSavingGoal}
            placeholder="Ví dụ: Mua Laptop"
            value={goalForm.name}
            onChange={(event) => updateGoalField('name', event.target.value)}
          />
          <TextField
            label="Số tiền mục tiêu"
            disabled={isSavingGoal}
            min="0"
            step="0.01"
            type="number"
            value={goalForm.targetAmount}
            onChange={(event) =>
              updateGoalField('targetAmount', event.target.value)
            }
          />
          <TextField
            label="Deadline"
            disabled={isSavingGoal}
            type="date"
            value={goalForm.deadline}
            onChange={(event) => updateGoalField('deadline', event.target.value)}
          />
          {goalFormError ? <AlertBanner tone="error">{goalFormError}</AlertBanner> : null}
          <button className="hidden" type="submit" />
        </form>
      </BottomSheet>

      <BottomSheet
        open={isContributionSheetOpen}
        title="Tiết kiệm thêm"
        description="Ghi nhận số tiền bạn vừa tiết kiệm cho một mục tiêu."
        onClose={closeContributionSheet}
        footer={
          <>
            <ActionButton
              variant="secondary"
              disabled={isSavingContribution}
              onClick={closeContributionSheet}
            >
              Hủy
            </ActionButton>
            <ActionButton
              disabled={isSavingContribution}
              onClick={handleContributionSubmit}
            >
              {isSavingContribution ? 'Đang lưu...' : 'Thêm'}
            </ActionButton>
          </>
        }
      >
        <form onSubmit={handleContributionSubmit} className="space-y-4">
          <SelectField
            label="Mục tiêu"
            value={contributionGoalId}
            onChange={(event) => setContributionGoalId(event.target.value)}
            disabled={isSavingContribution}
          >
            <option value="">Chọn mục tiêu</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Số tiền tiết kiệm"
            disabled={isSavingContribution}
            min="0"
            step="0.01"
            type="number"
            value={contributionAmount}
            onChange={(event) => {
              setContributionAmount(event.target.value)
              setContributionError('')
            }}
          />
          {contributionError ? (
            <AlertBanner tone="error">{contributionError}</AlertBanner>
          ) : null}
          <button className="hidden" type="submit" />
        </form>
      </BottomSheet>
    </AppPage>
  )
}

function GoalCard({ currency, goal, onAddContribution, onDelete, onEdit }) {
  const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0)

  return (
    <Surface className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-headline text-lg font-extrabold text-on-surface">
            {goal.name}
          </h2>
          <p className="mt-1 font-body text-sm text-on-surface-variant">
            Deadline: {formatGoalDate(goal.deadline)}
          </p>
        </div>
        <span className="rounded-full bg-primary-container/45 px-3 py-1 font-label text-xs font-bold text-primary">
          {Math.round(goal.progressPercent)}%
        </span>
      </div>

      <ProgressBar value={goal.progressPercent} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-container-low p-3">
          <p className="font-label text-xs font-bold uppercase text-on-surface-variant">
            Hiện có
          </p>
          <p className="mt-1 font-headline text-base font-extrabold text-on-surface">
            {formatCurrency(goal.currentAmount, currency)}
          </p>
        </div>
        <div className="rounded-lg bg-surface-container-low p-3">
          <p className="font-label text-xs font-bold uppercase text-on-surface-variant">
            Mục tiêu
          </p>
          <p className="mt-1 font-headline text-base font-extrabold text-on-surface">
            {formatCurrency(goal.targetAmount, currency)}
          </p>
        </div>
      </div>

      <p className="font-body text-sm text-on-surface-variant">
        Còn thiếu {formatCurrency(remainingAmount, currency)} để hoàn thành.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ActionButton size="sm" icon="savings" onClick={onAddContribution}>
          Tiết kiệm thêm
        </ActionButton>
        <ActionButton size="sm" variant="secondary" icon="edit" onClick={onEdit}>
          Sửa
        </ActionButton>
        <ActionButton size="sm" variant="danger" icon="delete" onClick={onDelete}>
          Xóa
        </ActionButton>
      </div>
    </Surface>
  )
}
