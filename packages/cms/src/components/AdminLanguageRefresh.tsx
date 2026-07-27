'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { syncAdminLanguageCookie } from '../actions/syncAdminLanguageCookie'

export function AdminLanguageRefresh({ language }: { language: string }): null {
  const router = useRouter()

  useEffect(() => {
    syncAdminLanguageCookie(language).then(() => router.refresh())
  }, [language, router])

  return null
}
