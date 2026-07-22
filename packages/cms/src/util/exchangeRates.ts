import { CURRENCY_CODES, FALLBACK_HKD_PER_UNIT } from './currency'

/**
 * Live exchange rates from the free open.er-api.com endpoint (no API key,
 * daily updates, ~160 currencies incl. HKD and TWD). Rates are cached in
 * memory for 1 month per server instance (we don't need super-accurate
 * rates); on any failure we fall back to the
 * static FALLBACK_HKD_PER_UNIT table so the admin UI always renders.
 *
 * Rates are used for display-only conversions; stored amounts are never
 * rewritten.
 */

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000 // ~1 month
const RATES_URL = 'https://open.er-api.com/v6/latest/HKD'

export type ExchangeRates = {
  /** HKD value of one unit of each supported currency. */
  hkdPerUnit: Record<string, number>
  source: 'live' | 'static'
  updatedAt?: string
}

let cache: { rates: Record<string, number>; fetchedAt: number; updatedAt?: string } | null = null

export async function getExchangeRates(): Promise<ExchangeRates> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return { hkdPerUnit: cache.rates, source: 'live', updatedAt: cache.updatedAt }
  }

  try {
    const res = await fetch(RATES_URL, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`rates request failed: ${res.status}`)

    const json = (await res.json()) as {
      result?: string
      rates?: Record<string, number>
      time_last_update_utc?: string
    }
    if (json.result !== 'success' || !json.rates) throw new Error('unexpected rates response')

    // API returns "1 HKD = X <currency>"; we store the inverse (HKD per unit).
    const hkdPerUnit: Record<string, number> = {}
    for (const code of CURRENCY_CODES) {
      const perHKD = json.rates[code]
      if (typeof perHKD === 'number' && perHKD > 0) {
        hkdPerUnit[code] = 1 / perHKD
      }
    }
    if (Object.keys(hkdPerUnit).length === 0) throw new Error('no usable rates in response')

    cache = { rates: hkdPerUnit, fetchedAt: Date.now(), updatedAt: json.time_last_update_utc }
    return { hkdPerUnit, source: 'live', updatedAt: json.time_last_update_utc }
  } catch {
    return { hkdPerUnit: FALLBACK_HKD_PER_UNIT, source: 'static' }
  }
}
