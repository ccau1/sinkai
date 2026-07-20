import type { CollectionAfterReadHook } from 'payload'
import type { Form } from '../payload-types'
import { defaultLocale, locales } from '../locales'

const WEB_APP_URL = process.env.WEB_APP_URL

export const populateShareableLinks: CollectionAfterReadHook<Form> = async ({ doc }) => {
  if (!WEB_APP_URL) {
    return doc
  }

  const orderedLocales = [defaultLocale, ...locales.filter((locale) => locale !== defaultLocale)]

  const base = WEB_APP_URL.replace(/\/$/, '')
  doc.shareableLinks = orderedLocales
    .map((locale) => `${base}/${locale}/forms/${doc.id}/`)
    .join('\n')

  return doc
}
