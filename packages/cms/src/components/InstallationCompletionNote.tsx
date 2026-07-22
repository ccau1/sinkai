import React from 'react'

/**
 * Helper note shown above the installations completion date field,
 * explaining how the Planning / Upcoming badges are derived.
 */
export default function InstallationCompletionNote() {
  return (
    <div
      style={{
        backgroundColor: 'var(--theme-elevation-50, #f7f7f7)',
        border: '1px solid var(--theme-elevation-200, #e5e5e5)',
        borderRadius: '8px',
        color: 'var(--theme-elevation-700, #444)',
        fontSize: '13px',
        lineHeight: 1.5,
        padding: '12px 16px',
      }}
    >
      <strong>Status badges</strong> (shown in the admin list and on the public installations
      page) are derived from the completion date:
      <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
        <li>
          Leave the date <strong>empty</strong> → shown as <strong>Planning</strong>
        </li>
        <li>
          Set a <strong>future</strong> date → shown as <strong>Upcoming</strong>
        </li>
        <li>
          Set a <strong>past</strong> date → no badge (completed)
        </li>
      </ul>
    </div>
  )
}
