/**
 * One-off repair: media `alt` values that were stored as JSON strings instead
 * of proper localized objects (Payload/D1 serialization bug).
 *
 * Safe to re-run: documents with a non-JSON-string `alt` are skipped.
 *
 * Run locally:
 *   npm run repair:media-alt
 *
 * Run against REMOTE staging:
 *   npm run repair:media-alt:remote
 *
 * Run against REMOTE production:
 *   npm run repair:media-alt:production
 */

import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import type { Locale } from '../locales'

dotenvConfig({ path: '.env' })

const PAGE_SIZE = 50

function parseJsonAlt(value: unknown): Record<Locale, string> | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<Locale, string>
    }
  } catch {
    // not valid JSON
  }
  return null
}

async function main() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  let page = 1
  let repaired = 0
  let skipped = 0
  let failed = 0

  for (;;) {
    const result = await payload.find({
      collection: 'media',
      depth: 0,
      limit: PAGE_SIZE,
      page,
      overrideAccess: true,
    })

    if (result.docs.length === 0) break

    for (const doc of result.docs) {
      const altMap = parseJsonAlt(doc.alt)
      if (!altMap) {
        skipped++
        continue
      }

      try {
        for (const locale of ['en', 'zh-CN', 'zh-TW'] as Locale[]) {
          await payload.update({
            collection: 'media',
            id: doc.id,
            locale,
            data: { alt: altMap[locale] ?? altMap['en'] ?? '' },
            depth: 0,
            overrideAccess: true,
          })
        }
        repaired++
        console.log(`[repair] ${doc.filename}: repaired localized alt`)
      } catch (err) {
        failed++
        console.error(`[repair] ${doc.filename}: failed to repair alt:`, err)
      }
    }

    if (!result.hasNextPage) break
    page++
  }

  console.log(`[repair] done. repaired=${repaired} skipped=${skipped} failed=${failed}`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('[repair] fatal:', err)
  process.exit(1)
})
