export function isSameMonth(dateValue, baseDate = new Date()) {
  const date = new Date(dateValue)
  return (
    date.getMonth() === baseDate.getMonth() &&
    date.getFullYear() === baseDate.getFullYear()
  )
}

export function formatTransactionDate(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Hôm nay'
  if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua'

  return date.toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric',
  })
}

export function currentMonthLabel() {
  return new Date().toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  })
}
