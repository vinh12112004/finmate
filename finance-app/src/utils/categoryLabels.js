const categoryLabels = {
  'Food & Drink': 'Ăn uống',
  Coffee: 'Cà phê',
  Transport: 'Di chuyển',
  Education: 'Học tập',
  Subscriptions: 'Đăng ký',
  Income: 'Thu nhập',
}

export function formatCategory(category) {
  return categoryLabels[category] || category
}
