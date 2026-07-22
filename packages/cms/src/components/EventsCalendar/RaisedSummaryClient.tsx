'use client'

import React, { useState } from 'react'
import { CURRENCY_CODES, convertCurrency, formatCurrency, roundToNearest10 } from '../../util/currency'

type RaisedSummaryClientProps = {
  /** Totals raised, keyed by the currency the donations were made in. */
  totals: Record<string, number>
  targetAmount: number | null
  targetCurrency: string
  /** HKD value of one unit of each currency (live or static fallback). */
  rates: Record<string, number>
  ratesSource: 'live' | 'static'
  ratesUpdatedAt?: string
}

export default function RaisedSummaryClient({
  totals,
  targetAmount,
  targetCurrency,
  rates,
  ratesSource,
  ratesUpdatedAt,
}: RaisedSummaryClientProps) {
  const [viewCurrency, setViewCurrency] = useState(targetCurrency)

  const entries = Object.entries(totals)

  // Total raised in the event's own currency — the pinned headline figure.
  let rawTotalInTarget = 0
  let anyConvertedToTarget = false
  let hasUnconvertible = false
  for (const [currency, total] of entries) {
    if (currency === targetCurrency) {
      rawTotalInTarget += total
      continue
    }
    const converted = convertCurrency(total, currency, targetCurrency, rates)
    if (converted === null) {
      hasUnconvertible = true
    } else {
      rawTotalInTarget += converted
      anyConvertedToTarget = true
    }
  }
  const totalInTargetCurrency = anyConvertedToTarget
    ? roundToNearest10(rawTotalInTarget)
    : rawTotalInTarget

  // Sum all donations converted into the selected viewing currency.
  let rawTotal = 0
  let anyConverted = false
  for (const [currency, total] of entries) {
    if (currency === viewCurrency) {
      rawTotal += total
      continue
    }
    const converted = convertCurrency(total, currency, viewCurrency, rates)
    if (converted === null) {
      hasUnconvertible = true
    } else {
      rawTotal += converted
      anyConverted = true
    }
  }
  // Round to the nearest 10 for readability when conversions are involved;
  // exact when everything is already in the viewing currency.
  const convertedTotal = anyConverted ? roundToNearest10(rawTotal) : rawTotal

  const rawTarget =
    targetAmount !== null ? convertCurrency(targetAmount, targetCurrency, viewCurrency, rates) : null
  const convertedTarget =
    rawTarget !== null && targetCurrency !== viewCurrency ? roundToNearest10(rawTarget) : rawTarget
  const percent =
    rawTarget && rawTarget > 0 ? Math.round((rawTotal / rawTarget) * 100) : null

  return (
    <div
      style={{
        backgroundColor: 'var(--theme-elevation-50, #f7f7f7)',
        border: '1px solid var(--theme-elevation-200, #e5e5e5)',
        borderRadius: '8px',
        marginTop: '8px',
        padding: '16px',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Funding progress</h3>
        <label style={{ alignItems: 'center', display: 'flex', fontSize: '13px', gap: '6px' }}>
          View in
          <select
            onChange={(e) => setViewCurrency(e.target.value)}
            style={{ padding: '2px 4px' }}
            value={viewCurrency}
          >
            {CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>

      {entries.length === 0 ? (
        <p style={{ color: 'var(--theme-elevation-600, #666)', margin: 0 }}>
          No donations allocated to this event yet.
        </p>
      ) : (
        <>
          <p style={{ margin: '0 0 8px' }}>
            Total raised: <strong>{formatCurrency(totalInTargetCurrency, targetCurrency)}</strong>
            {hasUnconvertible && ' (some donations have no exchange rate and are excluded)'}
          </p>
          {viewCurrency !== targetCurrency && (
            <p style={{ margin: '0 0 8px' }}>
              Raised in {viewCurrency}:{' '}
              <strong>{formatCurrency(convertedTotal, viewCurrency)}</strong>
            </p>
          )}
          <ul
            style={{
              color: 'var(--theme-elevation-600, #666)',
              fontSize: '13px',
              listStyle: 'none',
              margin: '0 0 4px',
              padding: 0,
            }}
          >
            {entries.map(([currency, total]) => (
              <li key={currency}>
                {formatCurrency(total, currency)}
                {currency !== viewCurrency &&
                  (() => {
                    const converted = convertCurrency(total, currency, viewCurrency, rates)
                    return converted !== null
                      ? ` ≈ ${formatCurrency(roundToNearest10(converted), viewCurrency)}`
                      : ''
                  })()}
              </li>
            ))}
          </ul>
        </>
      )}

      {targetAmount !== null && (
        <div style={{ marginTop: '12px' }}>
          <p style={{ margin: '0 0 6px' }}>
            Target:{' '}
            <strong>
              {convertedTarget !== null
                ? formatCurrency(convertedTarget, viewCurrency)
                : formatCurrency(targetAmount, targetCurrency)}
            </strong>
            {percent !== null && ` — ${percent}% funded`}
          </p>
          <div
            style={{
              backgroundColor: 'var(--theme-elevation-150, #eee)',
              borderRadius: '4px',
              height: '8px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--theme-success-500, #22c55e)',
                height: '100%',
                width: `${Math.min(100, percent ?? 0)}%`,
              }}
            />
          </div>
        </div>
      )}

      <p
        style={{
          color: 'var(--theme-elevation-500, #999)',
          fontSize: '12px',
          fontStyle: 'italic',
          margin: '10px 0 0',
        }}
      >
        {ratesSource === 'live'
          ? `Conversions use daily reference rates from open.er-api.com${ratesUpdatedAt ? ` (updated ${ratesUpdatedAt})` : ''}, via HKD as the pivot currency.`
          : 'Conversions use approximate static fallback rates (live rates unavailable), via HKD as the pivot currency.'}
      </p>
    </div>
  )
}
