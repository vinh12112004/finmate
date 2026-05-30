const currencyConfig = {
  VND: { locale: 'vi-VN', maximumFractionDigits: 0 },
  USD: { locale: 'en-US', maximumFractionDigits: 2 },
  EUR: { locale: 'de-DE', maximumFractionDigits: 2 },
  JPY: { locale: 'ja-JP', maximumFractionDigits: 0 },
  KRW: { locale: 'ko-KR', maximumFractionDigits: 0 },
  GBP: { locale: 'en-GB', maximumFractionDigits: 2 },
  CNY: { locale: 'zh-CN', maximumFractionDigits: 2 },
}

export function formatCurrency(value, currency = 'VND') {
  const config = currencyConfig[currency] || currencyConfig.VND

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyConfig[currency] ? currency : 'VND',
    maximumFractionDigits: config.maximumFractionDigits,
  }).format(Number(value || 0))
}
