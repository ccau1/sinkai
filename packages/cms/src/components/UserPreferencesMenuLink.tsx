'use client'

import { useTranslation } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

import { userPreferencesMenuLabel } from '../adminLanguages'

export default function UserPreferencesMenuLink() {
  const { i18n } = useTranslation()
  const label = userPreferencesMenuLabel[i18n.language as keyof typeof userPreferencesMenuLabel]

  return (
    <Link
      href="/admin/account"
      style={{
        alignItems: 'center',
        color: 'var(--theme-text)',
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        textDecoration: 'none',
        width: '100%',
      }}
    >
      {label}
    </Link>
  )
}
