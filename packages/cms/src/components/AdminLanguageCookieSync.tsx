import { cookies as nextCookies } from 'next/headers'
import type { ServerProps } from 'payload'
import React from 'react'

import { defaultAdminLanguage, type AdminLanguage } from '../adminLanguages'
import { AdminLanguageRefresh } from './AdminLanguageRefresh'

type AdminLanguageCookieSyncProps = {
  children: React.ReactNode
} & ServerProps

export default async function AdminLanguageCookieSync({
  children,
  user,
}: AdminLanguageCookieSyncProps) {
  const configModule = await import('@payload-config')
  const config = await configModule.default
  const cookieName = `${config.cookiePrefix || 'payload'}-lng`
  const cookies = await nextCookies()
  const currentCookie = cookies.get(cookieName)?.value

  const preferredLanguage = (user?.preferences?.language as AdminLanguage) || defaultAdminLanguage
  const shouldSync = preferredLanguage && currentCookie !== preferredLanguage

  return (
    <>
      {shouldSync && <AdminLanguageRefresh language={preferredLanguage} />}
      {children}
    </>
  )
}
