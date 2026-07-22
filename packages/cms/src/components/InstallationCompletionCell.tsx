'use client'

import React from 'react'

const badgeBase: React.CSSProperties = {
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  lineHeight: 1,
  padding: '3px 8px',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
}

/**
 * List-view cell for the installations completion date:
 * - no date        -> "Planning" badge
 * - future date    -> date + "Upcoming" badge
 * - past date      -> date only
 */
export default function InstallationCompletionCell({ cellData }: { cellData?: string | null }) {
  if (!cellData) {
    return (
      <span
        style={{
          ...badgeBase,
          backgroundColor: 'var(--theme-elevation-150, #e5e5e5)',
          color: 'var(--theme-elevation-600, #666)',
        }}
      >
        Planning
      </span>
    )
  }

  const date = new Date(cellData)
  const isUpcoming = date > new Date()

  return (
    <span style={{ alignItems: 'center', display: 'inline-flex', gap: '6px' }}>
      {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      {isUpcoming && (
        <span
          style={{
            ...badgeBase,
            backgroundColor: 'var(--theme-warning-500, #f59e0b)',
            color: 'var(--theme-elevation-0, #fff)',
          }}
        >
          Upcoming
        </span>
      )}
    </span>
  )
}
