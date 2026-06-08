import { useId } from 'react'
import { Link } from 'react-router-dom'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

const buttonVariants = {
  primary:
    'bg-primary text-on-primary shadow-[0_10px_24px_rgba(15,118,110,0.18)] hover:bg-primary-dim',
  secondary:
    'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
  subtle: 'bg-transparent text-primary hover:bg-primary-container/50',
  danger:
    'bg-error-container/25 text-error hover:bg-error-container/40',
}

const buttonSizes = {
  sm: 'min-h-11 px-4 text-sm',
  md: 'min-h-12 px-5 text-sm',
  lg: 'min-h-14 px-6 text-base',
}

export function ActionButton({
  children,
  className = '',
  disabled = false,
  icon,
  onClick,
  size = 'md',
  to,
  type = 'button',
  variant = 'primary',
}) {
  const classes = cx(
    'inline-flex items-center justify-center gap-2 rounded-full font-headline font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-55',
    buttonVariants[variant],
    buttonSizes[size],
    className,
  )

  const content = (
    <>
      {icon ? (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      ) : null}
      <span>{children}</span>
    </>
  )

  if (to && !disabled) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {content}
    </button>
  )
}

export function AlertBanner({ action, children, className = '', tone = 'info' }) {
  const toneClass =
    tone === 'error'
      ? 'bg-error-container/25 text-error'
      : tone === 'success'
        ? 'bg-secondary-container/40 text-secondary-dim'
        : 'bg-primary-container/35 text-primary-dim'

  return (
    <div
      className={cx(
        'flex flex-col gap-3 rounded-lg px-4 py-3 text-sm font-medium sm:flex-row sm:items-center sm:justify-between',
        toneClass,
        className,
      )}
    >
      <div className="font-body leading-relaxed">{children}</div>
      {action}
    </div>
  )
}

export function AppHeader({
  actions,
  className = '',
  leading,
  subtitle,
  title,
}) {
  return (
    <header
      className={cx(
        'sticky top-0 z-40 border-b border-outline-variant/50 bg-surface/92 backdrop-blur-xl pt-safe',
        className,
      )}
    >
      <div className="mx-auto flex min-h-[64px] w-full max-w-5xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          {leading}
          <div className="min-w-0">
            <h1 className="truncate font-headline text-lg font-extrabold text-on-surface">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate font-label text-xs font-semibold text-on-surface-variant">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}

export function AppPage({
  actions,
  children,
  className = '',
  description,
  eyebrow,
  title,
}) {
  return (
    <main
      className={cx(
        'mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 pb-[calc(6.75rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:pb-10',
        className,
      )}
    >
      {(title || description || actions) ? (
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="font-label text-xs font-bold uppercase text-on-surface-variant">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-1 font-headline text-[2rem] font-extrabold leading-tight text-on-background">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-on-surface-variant">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
          ) : null}
        </section>
      ) : null}
      {children}
    </main>
  )
}

export function BottomSheet({
  children,
  description,
  footer,
  onClose,
  open,
  title,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-inverse-surface/45 px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:items-center sm:p-6">
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-t-xl bg-surface-container-lowest shadow-[0_24px_70px_rgba(11,15,16,0.28)] sm:rounded-xl">
        <div className="mx-auto mt-4 h-1 w-12 shrink-0 rounded-full bg-outline-variant sm:hidden" />
        <div className="flex shrink-0 items-start justify-between gap-3 p-5 pb-4">
          <div>
            <h2 className="font-headline text-xl font-extrabold text-on-surface">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 font-body text-sm text-on-surface-variant">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton icon="close" label="Đóng" onClick={onClose} />
        </div>
        <div className="space-y-4 overflow-y-auto px-5 pb-2">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 grid shrink-0 grid-cols-2 gap-3 bg-surface-container-lowest p-5 pt-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function EmptyState({
  action,
  children,
  className = '',
  icon = 'inbox',
  title,
}) {
  return (
    <div className={cx('rounded-xl bg-surface-container-low p-8 text-center', className)}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/45 text-primary">
        <span className="material-symbols-outlined icon-fill text-[28px]">
          {icon}
        </span>
      </div>
      <h3 className="font-headline text-xl font-extrabold text-on-surface">
        {title}
      </h3>
      {children ? (
        <p className="mx-auto mt-2 max-w-sm font-body text-sm leading-relaxed text-on-surface-variant">
          {children}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function IconButton({
  className = '',
  disabled = false,
  icon,
  label,
  onClick,
  to,
  type = 'button',
}) {
  const classes = cx(
    'tap-target inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-55',
    className,
  )

  const content = <span className="material-symbols-outlined text-[22px]">{icon}</span>

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} aria-label={label} title={label}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {content}
    </button>
  )
}

export function ProgressBar({ className = '', tone = 'primary', value }) {
  const width = Math.min(Math.max(Number(value || 0), 0), 100)
  const toneClass =
    tone === 'danger'
      ? 'bg-error'
      : tone === 'secondary'
        ? 'bg-secondary'
        : tone === 'tertiary'
          ? 'bg-tertiary'
          : 'bg-primary'

  return (
    <div className={cx('h-2.5 overflow-hidden rounded-full bg-surface-container-high', className)}>
      <div
        className={cx('h-full rounded-full transition-[width]', toneClass)}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export function SegmentedControl({ onChange, options, value }) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-lg bg-surface-container-low p-1 scrollbar-hide">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cx(
              'min-h-10 shrink-0 rounded-md px-4 font-label text-sm font-bold transition-colors',
              selected
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function SelectField({
  children,
  className = '',
  disabled,
  id,
  label,
  onChange,
  value,
}) {
  return (
    <label className={cx('block', className)} htmlFor={id}>
      {label ? (
        <span className="mb-2 block font-label text-sm font-bold text-on-surface-variant">
          {label}
        </span>
      ) : null}
      <select
        id={id}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="min-h-12 w-full rounded-lg border border-transparent bg-surface-container-high px-4 font-body text-base text-on-surface outline-none transition focus:border-primary/40 focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {children}
      </select>
    </label>
  )
}

export function StatCard({
  className = '',
  icon,
  label,
  tone = 'primary',
  value,
}) {
  const toneClass =
    tone === 'secondary'
      ? 'bg-secondary-container/55 text-secondary-dim'
      : tone === 'tertiary'
        ? 'bg-tertiary-container/45 text-tertiary-dim'
        : tone === 'danger'
          ? 'bg-error-container/25 text-error'
          : 'bg-primary-container/45 text-primary'

  return (
    <Surface className={cx('flex items-center gap-4', className)}>
      {icon ? (
        <div className={cx('flex h-12 w-12 shrink-0 items-center justify-center rounded-lg', toneClass)}>
          <span className="material-symbols-outlined icon-fill text-[24px]">
            {icon}
          </span>
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="font-label text-xs font-bold uppercase text-on-surface-variant">
          {label}
        </p>
        <p className="mt-1 truncate font-headline text-xl font-extrabold text-on-surface">
          {value}
        </p>
      </div>
    </Surface>
  )
}

export function Surface({
  children,
  className = '',
  as: Component = 'section',
  ...props
}) {
  return (
    <Component
      {...props}
      className={cx(
        'rounded-xl border border-outline-variant/45 bg-surface-container-lowest p-4 shadow-[0_14px_32px_rgba(15,23,42,0.04)]',
        className,
      )}
    >
      {children}
    </Component>
  )
}

export function TextField({
  autoComplete,
  autoFocus,
  className = '',
  disabled,
  id,
  inputMode,
  inputClassName = '',
  label,
  min,
  multiline = false,
  onChange,
  placeholder,
  rows = 4,
  step,
  trailingAction,
  type = 'text',
  value,
}) {
  const generatedId = useId()
  const controlId = id || generatedId
  const controlClass = cx(
    'min-h-12 w-full rounded-lg border border-transparent bg-surface-container-high px-4 font-body text-base text-on-surface placeholder:text-outline outline-none transition focus:border-primary/40 focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60',
    multiline ? 'resize-none py-3 leading-relaxed' : 'py-3',
    trailingAction && !multiline ? 'pr-12' : '',
    inputClassName,
  )

  return (
    <div className={cx('block', className)}>
      {label ? (
        <label
          htmlFor={controlId}
          className="mb-2 block font-label text-sm font-bold text-on-surface-variant"
        >
          {label}
        </label>
      ) : null}
      {multiline ? (
        <textarea
          id={controlId}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={controlClass}
        />
      ) : (
        <div className="relative">
          <input
            id={controlId}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            disabled={disabled}
            inputMode={inputMode}
            min={min}
            placeholder={placeholder}
            step={step}
            type={type}
            value={value}
            onChange={onChange}
            className={controlClass}
          />
          {trailingAction ? (
            <div className="absolute inset-y-0 right-1 flex items-center">
              {trailingAction}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function TransactionRow({
  amount,
  category,
  currency,
  date,
  icon,
  note,
  title,
  type = 'expense',
}) {
  const isIncome = type === 'income'

  return (
    <article className="flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
      {icon}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-headline text-sm font-bold text-on-surface">
          {title}
        </h3>
        <p className="mt-1 truncate font-label text-xs font-semibold text-on-surface-variant">
          {date} • {category}
        </p>
        {note ? (
          <p className="mt-1 line-clamp-2 font-body text-xs text-on-surface-variant">
            {note}
          </p>
        ) : null}
      </div>
      <p
        className={`shrink-0 text-right font-headline text-sm font-extrabold ${
          isIncome ? 'text-secondary-dim' : 'text-on-surface'
        }`}
      >
        {isIncome ? '+' : '-'}
        {currency(amount)}
      </p>
    </article>
  )
}
