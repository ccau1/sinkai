'use server'

import { cookies as nextCookies } from 'next/headers'
import { getPayload } from 'payload'

import type { AdminLanguage } from '../adminLanguages'

export async function setAdminLanguage({
  language,
  userId,
}: {
  language: AdminLanguage
  userId: number | string
}): Promise<void> {
  const configModule = await import('@payload-config')
  const config = await configModule.default
  const payload = await getPayload({ config })

  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      preferences: {
        language,
      },
    },
  })

  const cookies = await nextCookies()
  cookies.set({
    name: `${config.cookiePrefix || 'payload'}-lng`,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    value: language,
  })
}
