'use server'

import { cookies as nextCookies } from 'next/headers'

export async function syncAdminLanguageCookie(language: string): Promise<void> {
  const configModule = await import('@payload-config')
  const config = await configModule.default
  const cookies = await nextCookies()

  cookies.set({
    name: `${config.cookiePrefix || 'payload'}-lng`,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    value: language,
  })
}
