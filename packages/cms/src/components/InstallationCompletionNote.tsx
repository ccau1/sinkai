import type { I18nClient } from '@payloadcms/translations'
import React from 'react'

import { t } from '../uiTranslations'

type InstallationCompletionNoteProps = {
  i18n: I18nClient
}

/**
 * Helper note shown above the installations completion date field,
 * explaining how the Planning / Upcoming badges are derived.
 */
export default function InstallationCompletionNote({ i18n }: InstallationCompletionNoteProps) {
  const language = i18n.language

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
      <strong>{t('installationCompletion.noteTitle', language)}</strong>{' '}
      {t('installationCompletion.noteIntro', language)}
      <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
        <li>{t('installationCompletion.noteEmpty', language)}</li>
        <li>{t('installationCompletion.noteFuture', language)}</li>
        <li>{t('installationCompletion.notePast', language)}</li>
      </ul>
    </div>
  )
}
