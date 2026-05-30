const categoryStyles = {
  'Food & Drink': {
    icon: 'restaurant',
    className: 'bg-secondary-container/70 text-secondary-dim',
  },
  'Ăn uống': {
    icon: 'restaurant',
    className: 'bg-secondary-container/70 text-secondary-dim',
  },
  Coffee: {
    icon: 'local_cafe',
    className: 'bg-primary-container/70 text-primary',
  },
  'Cà phê': {
    icon: 'local_cafe',
    className: 'bg-primary-container/70 text-primary',
  },
  Transport: {
    icon: 'directions_bus',
    className: 'bg-tertiary-container/70 text-tertiary',
  },
  'Di chuyển': {
    icon: 'directions_bus',
    className: 'bg-tertiary-container/70 text-tertiary',
  },
  Education: {
    icon: 'book',
    className: 'bg-surface-container-highest text-on-surface-variant',
  },
  'Học tập': {
    icon: 'book',
    className: 'bg-surface-container-highest text-on-surface-variant',
  },
  Subscriptions: {
    icon: 'subscriptions',
    className: 'bg-surface-variant text-on-surface-variant',
  },
  'Đăng ký': {
    icon: 'subscriptions',
    className: 'bg-surface-variant text-on-surface-variant',
  },
  Income: {
    icon: 'payments',
    className: 'bg-secondary-container/70 text-secondary-dim',
  },
  'Thu nhập': {
    icon: 'payments',
    className: 'bg-secondary-container/70 text-secondary-dim',
  },
}

export function TransactionIcon({ category }) {
  const style = categoryStyles[category] || {
    icon: 'receipt_long',
    className: 'bg-surface-container-highest text-on-surface-variant',
  }

  return (
    <div
      className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${style.className}`}
    >
      <span
        className="material-symbols-outlined text-[22px]"
        style={{ fontVariationSettings: '"FILL" 1' }}
      >
        {style.icon}
      </span>
    </div>
  )
}
