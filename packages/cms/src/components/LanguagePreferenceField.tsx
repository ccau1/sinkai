'use client'

import { FieldDescription, FieldLabel, useAuth, useField } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React from 'react'

import { setAdminLanguage } from '../actions/setAdminLanguage'
import {
  adminLanguageFieldDescription,
  adminLanguageFieldLabel,
  adminLanguageLabels,
  defaultAdminLanguage,
  type AdminLanguage,
} from '../adminLanguages'

const isAdminLanguage = (value: string): value is AdminLanguage =>
  Object.keys(adminLanguageLabels).includes(value)

export default function LanguagePreferenceField() {
  const { user } = useAuth()
  const { setValue, value } = useField<AdminLanguage>({ path: 'preferences.language' })
  const router = useRouter()

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const rawLanguage = event.target.value
    const language = isAdminLanguage(rawLanguage) ? rawLanguage : defaultAdminLanguage
    setValue(language)

    if (user?.id) {
      await setAdminLanguage({ language, userId: user.id })
    }

    router.refresh()
  }

  return (
    <div>
      <FieldLabel label={adminLanguageFieldLabel} path="preferences.language" />
      <FieldDescription description={adminLanguageFieldDescription} path="preferences.language" />
      <select
        onChange={handleChange}
        value={value || defaultAdminLanguage}
        style={{
          backgroundColor: 'var(--theme-input-bg)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-s)',
          color: 'var(--theme-text)',
          fontSize: '1rem',
          marginTop: '0.5rem',
          padding: '0.5rem 0.75rem',
          width: '100%',
        }}
      >
        {Object.entries(adminLanguageLabels).map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
