/**
 * One-off cleanup: remove duplicate blog documents in the CMS.
 *
 * The old `shortId` hook mutated values on every save and the seed looked up
 * existing posts by the unstable deterministic shortId, causing multiple docs
 * to be created for the same logical post.
 *
 * This script groups blogs by the canonical default-locale slug (`slugName.zh-TW`),
 * keeps the "best" doc for each group, and deletes the rest.
 *
 * Run locally (local bindings):
 *   npm run remove:duplicate-blogs
 *
 * Run against REMOTE staging bindings:
 *   npm run remove:duplicate-blogs:remote
 *
 * Run against REMOTE production bindings:
 *   npm run remove:duplicate-blogs:production
 *
 * Dry-run to preview what would be deleted:
 *   DRY_RUN=true npm run remove:duplicate-blogs
 */

import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'

import { generateShortId } from '../util/shortId'

dotenvConfig({ path: '.env' })

const DRY_RUN = process.env.DRY_RUN === 'true'
const PAGE_SIZE = 100

interface BlogDoc {
  id: number | string
  slugName?: Record<string, string> | string | null
  shortId?: string | null
  coverImage?: number | string | null
  title?: Record<string, string> | string | null
  createdAt?: string | null
}

function parseLocalizedSlug(value: unknown): Record<string, string> | string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') {
    // Defensive: Payload sometimes serializes localized objects as JSON strings.
    const trimmed = value.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, string>
        }
      } catch {
        // Not a JSON object; treat as a plain slug string.
      }
    }
    return value
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, string>
  }
  return undefined
}

function getAllSlugs(doc: BlogDoc): string[] {
  const slugName = parseLocalizedSlug(doc.slugName)
  if (!slugName) return []
  if (typeof slugName === 'string') return [slugName]
  return Object.values(slugName).filter(Boolean)
}

function countLocales(doc: BlogDoc): number {
  const slugName = parseLocalizedSlug(doc.slugName)
  if (slugName && typeof slugName === 'object' && !Array.isArray(slugName)) {
    return Object.values(slugName).filter(Boolean).length
  }
  return 0
}

function isCanonicalShortId(doc: BlogDoc, canonicalSlug: string): boolean {
  if (!doc.shortId) return false
  return doc.shortId === generateShortId(canonicalSlug)
}

function scoreDoc(doc: BlogDoc, canonicalSlug: string): number {
  let score = 0
  score += countLocales(doc) * 10
  if (doc.coverImage) score += 5
  if (isCanonicalShortId(doc, canonicalSlug)) score += 3
  if (doc.shortId) score += 1
  // Older docs are preferred as a tie-breaker (higher timestamp = older).
  if (doc.createdAt) score += new Date(doc.createdAt).getTime() / 1e12
  return score
}

async function main() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  let page = 1
  const docs: BlogDoc[] = []

  for (;;) {
    const result = await payload.find({
      collection: 'blogs',
      depth: 0,
      limit: PAGE_SIZE,
      page,
      overrideAccess: true,
      locale: 'all',
    })
    if (result.docs.length === 0) break
    docs.push(...(result.docs as unknown as BlogDoc[]))
    if (!result.hasNextPage) break
    page++
  }

  // Group docs by shared slug values across any locale. A doc can belong to
  // multiple groups if its slugs differ per locale, but in practice duplicates
  // share the same slug in the default locale.
  const grouped = new Map<string, BlogDoc[]>()
  for (const doc of docs) {
    const slugs = getAllSlugs(doc)
    if (slugs.length === 0) continue
    for (const slug of slugs) {
      const group = grouped.get(slug) || []
      group.push(doc)
      grouped.set(slug, group)
    }
  }

  const scanned = docs.length
  let groups = 0
  let deleted = 0
  let kept = 0
  let failed = 0

  console.log(`[remove-duplicate-blogs] DRY_RUN=${DRY_RUN}`)
  console.log(`[remove-duplicate-blogs] scanned ${scanned} blog docs`)

  for (const [slug, group] of grouped) {
    // Deduplicate ids within a group in case a doc matched multiple slugs.
    const uniqueGroup = Array.from(new Map(group.map((d) => [d.id, d])).values())
    if (uniqueGroup.length <= 1) continue

    groups++
    // Pick the best doc to keep.
    uniqueGroup.sort((a, b) => scoreDoc(b, slug) - scoreDoc(a, slug))
    const [winner, ...duplicates] = uniqueGroup

    console.log(
      `[remove-duplicate-blogs] group "${slug}" has ${group.length} docs; keeping id=${winner.id}`,
    )

    for (const dup of duplicates) {
      if (DRY_RUN) {
        console.log(`[remove-duplicate-blogs] would delete id=${dup.id} shortId=${dup.shortId}`)
        deleted++
        continue
      }

      try {
        await payload.delete({
          collection: 'blogs',
          id: dup.id,
          overrideAccess: true,
        })
        deleted++
        console.log(`[remove-duplicate-blogs] deleted id=${dup.id} shortId=${dup.shortId}`)
      } catch (err) {
        failed++
        console.error(`[remove-duplicate-blogs] failed to delete id=${dup.id}:`, err)
      }
    }

    kept++
  }

  console.log(
    `[remove-duplicate-blogs] done. groups=${groups} kept=${kept} deleted=${deleted} failed=${failed}`,
  )

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('[remove-duplicate-blogs] fatal:', err)
  process.exit(1)
})
