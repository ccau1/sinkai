/**
 * One-off repair: installation `description` values that were stored as plain
 * strings instead of Lexical objects (the seed wrote raw text into the
 * richText field, which breaks the Lexical editor in the admin).
 *
 * Safe to re-run: locales whose description is already an object are skipped.
 *
 * Run locally:
 *   npm run repair:installation-descriptions
 *
 * Run against REMOTE staging:
 *   npm run repair:installation-descriptions:remote
 *
 * Run against REMOTE production:
 *   npm run repair:installation-descriptions:production
 */

import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import { locales, type Locale } from '../locales'

dotenvConfig({ path: '.env' })

const PAGE_SIZE = 50

function textToLexical(text: string): unknown {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const children = paragraphs.map((paragraph) => ({
    type: 'paragraph' as const,
    direction: null as null,
    format: '' as const,
    indent: 0,
    version: 1,
    children: [
      {
        type: 'text' as const,
        text: paragraph,
        version: 1,
        format: 0,
        style: '' as const,
        mode: 'normal' as const,
        detail: 0,
      },
    ],
  }))

  return {
    root: {
      type: 'root' as const,
      direction: null as null,
      format: '' as const,
      indent: 0,
      version: 1,
      children,
    },
  }
}

async function main() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  let page = 1
  let scanned = 0
  let converted = 0

  for (;;) {
    const result = await payload.find({
      collection: 'installations',
      depth: 0,
      limit: PAGE_SIZE,
      page,
    })

    for (const doc of result.docs) {
      for (const locale of locales) {
        const localized = await payload.findByID({
          collection: 'installations',
          id: doc.id,
          locale: locale as Locale,
          fallbackLocale: false,
          depth: 0,
        })
        scanned++

        const description = (localized as { description?: unknown }).description
        if (typeof description === 'string' && description.trim()) {
          await payload.update({
            collection: 'installations',
            id: doc.id,
            locale: locale as Locale,
            data: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              description: textToLexical(description) as any,
            },
          })
          converted++
          console.log(`Converted installation ${doc.id} [${locale}]`)
        }
      }
    }

    if (!result.hasNextPage) break
    page++
  }

  console.log(`Done: scanned ${scanned} localized descriptions, converted ${converted}.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
