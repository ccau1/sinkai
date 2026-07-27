/**
 * Shared currency options and approximate static exchange rates.
 *
 * Rates are approximate and manually maintained (update as needed).
 * They are used for display-only conversions in the admin UI — stored
 * donation/target amounts are never converted or rewritten.
 */
export const CURRENCY_OPTIONS = [
  { label: { en: 'Hong Kong Dollar (HKD)', 'zh-CN': '港元 (HKD)', 'zh-TW': '港元 (HKD)' }, value: 'HKD' },
  { label: { en: 'US Dollar (USD)', 'zh-CN': '美元 (USD)', 'zh-TW': '美元 (USD)' }, value: 'USD' },
  { label: { en: 'Chinese Yuan (CNY)', 'zh-CN': '人民币 (CNY)', 'zh-TW': '人民幣 (CNY)' }, value: 'CNY' },
  { label: { en: 'New Taiwan Dollar (TWD)', 'zh-CN': '新台币 (TWD)', 'zh-TW': '新臺幣 (TWD)' }, value: 'TWD' },
  { label: { en: 'Euro (EUR)', 'zh-CN': '欧元 (EUR)', 'zh-TW': '歐元 (EUR)' }, value: 'EUR' },
  { label: { en: 'British Pound (GBP)', 'zh-CN': '英镑 (GBP)', 'zh-TW': '英鎊 (GBP)' }, value: 'GBP' },
]

export const CURRENCY_CODES = CURRENCY_OPTIONS.map((option) => option.value)

/** Approximate value of one unit of each currency, in HKD.
 *  Used only as a fallback when live rates are unavailable (see util/exchangeRates). */
export const FALLBACK_HKD_PER_UNIT: Record<string, number> = {
  HKD: 1,
  USD: 7.8,
  CNY: 1.08,
  TWD: 0.25,
  EUR: 8.9,
  GBP: 10.4,
}

/**
 * Convert an amount between two currencies via the given rates (HKD value per unit).
 * HKD acts only as the internal pivot; any from/to pair works (cross-rate).
 * Returns null when either currency has no known rate.
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number | null {
  const fromRate = rates[from]
  const toRate = rates[to]
  if (!fromRate || !toRate) return null
  return (amount * fromRate) / toRate
}

/** Round a converted amount to the nearest 10 for cleaner display of large numbers. */
export function roundToNearest10(value: number): number {
  return Math.round(value / 10) * 10
}

/** Format an amount as a currency string, e.g. "HK$50,000" or "$1,000". */
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString('en-US')}`
  }
}
