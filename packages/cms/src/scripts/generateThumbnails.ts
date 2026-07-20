/**
 * Backfill thumbnails for existing public image media.
 *
 * Iterates all public media documents with an image mimeType, checks whether
 * the pre-generated R2 thumbnail exists and is fresh, and triggers the
 * sinkai-cms-thumbnails workflow when it is missing or stale.
 *
 * Run locally (local bindings):
 *   npm run generate:thumbnails
 *
 * Run against REMOTE staging bindings:
 *   npm run generate:thumbnails:remote
 *
 * Run against REMOTE production bindings:
 *   npm run generate:thumbnails:production
 *
 * Dry-run to preview what would be triggered:
 *   DRY_RUN=true npm run generate:thumbnails
 */

import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import { getCfEnv } from '../lib/cloudflareEnv'
import { fileKeyFor, thumbKeyFor } from '../lib/media'

dotenvConfig({ path: '.env' })

const DRY_RUN = process.env.DRY_RUN === 'true'
const PAGE_SIZE = 50

interface MediaDoc {
  id: number | string
  filename?: string | null
  mimeType?: string | null
  prefix?: string | null
  updatedAt?: string | null
}

function isImage(doc: MediaDoc) {
  return typeof doc.mimeType === 'string' && doc.mimeType.startsWith('image/')
}

async function checkThumbnail(
  env: CloudflareEnv,
  doc: MediaDoc,
): Promise<'fresh' | 'missing' | 'stale' | 'error'> {
  if (!doc.filename) return 'error'
  const key = fileKeyFor(doc.prefix, doc.filename)
  try {
    const res = await env.THUMBNAILS.fetch(
      `https://thumbnails/check?key=${encodeURIComponent(key)}&filename=${encodeURIComponent(doc.filename)}`,
      { method: 'GET' },
    )
    if (!res.ok) return 'error'
    const data = (await res.json()) as { status?: string }
    if (data.status === 'fresh') return 'fresh'
    if (data.status === 'stale') return 'stale'
    return 'missing'
  } catch (err) {
    console.warn(`[generate-thumbnails] check failed for ${doc.filename}:`, err)
    return 'error'
  }
}

async function triggerThumbnail(
  env: CloudflareEnv,
  doc: MediaDoc,
): Promise<boolean> {
  if (!doc.filename) return false
  const key = fileKeyFor(doc.prefix, doc.filename)
  try {
    const res = await env.THUMBNAILS.fetch('https://thumbnails/trigger', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        key,
        filename: doc.filename,
        updatedAt: doc.updatedAt ?? new Date().toISOString(),
      }),
    })
    return res.ok
  } catch (err) {
    console.warn(`[generate-thumbnails] trigger failed for ${doc.filename}:`, err)
    return false
  }
}

async function deleteStaleThumbnail(env: CloudflareEnv, doc: MediaDoc): Promise<void> {
  if (!doc.filename) return
  try {
    await env.R2.delete(thumbKeyFor(doc.filename))
  } catch (err) {
    console.warn(`[generate-thumbnails] failed to delete stale thumbnail for ${doc.filename}:`, err)
  }
}

async function main() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  let env: CloudflareEnv | undefined
  try {
    env = await getCfEnv()
  } catch (err) {
    console.error('[generate-thumbnails] failed to resolve Cloudflare bindings:', err)
  }

  if (!env?.THUMBNAILS) {
    console.error('[generate-thumbnails] THUMBNAILS service binding is not available.')
    process.exit(1)
  }

  if (!env.R2) {
    console.error('[generate-thumbnails] R2 binding is not available.')
    process.exit(1)
  }

  let page = 1
  let scanned = 0
  let fresh = 0
  let triggered = 0
  let failed = 0
  let skipped = 0

  console.log(`[generate-thumbnails] DRY_RUN=${DRY_RUN}`)

  for (;;) {
    const result = await payload.find({
      collection: 'media',
      depth: 0,
      limit: PAGE_SIZE,
      page,
      overrideAccess: true,
    })

    if (result.docs.length === 0) break

    for (const raw of result.docs) {
      const doc = raw as unknown as MediaDoc
      scanned++

      if (!doc.filename) {
        skipped++
        continue
      }

      if (doc.prefix === 'private') {
        skipped++
        continue
      }

      if (!isImage(doc)) {
        skipped++
        continue
      }

      const status = await checkThumbnail(env, doc)

      if (status === 'fresh') {
        fresh++
        continue
      }

      if (status === 'stale') {
        if (!DRY_RUN) {
          await deleteStaleThumbnail(env, doc)
        } else {
          console.log(`[generate-thumbnails] would delete stale thumbnail for ${doc.filename}`)
        }
      }

      if (DRY_RUN) {
        console.log(`[generate-thumbnails] would trigger ${doc.filename} (status=${status})`)
        triggered++
        continue
      }

      const ok = await triggerThumbnail(env, doc)
      if (ok) {
        triggered++
        console.log(`[generate-thumbnails] triggered ${doc.filename}`)
      } else {
        failed++
        console.error(`[generate-thumbnails] failed to trigger ${doc.filename}`)
      }
    }

    if (!result.hasNextPage) break
    page++
  }

  console.log(
    `[generate-thumbnails] done. scanned=${scanned} fresh=${fresh} triggered=${triggered} failed=${failed} skipped=${skipped}`,
  )

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('[generate-thumbnails] fatal:', err)
  process.exit(1)
})
