/**
 * One-off migration: move legacy media files from the R2 bucket root to the
 * `public/` prefix and backfill `prefix`/`visibility` on media documents.
 *
 * Safe to re-run: documents that already have a `prefix` are skipped.
 *
 * Run locally (local bindings):
 *   npm run migrate:media-prefixes
 *
 * Run against REMOTE staging bindings (uses the PAYLOAD_REMOTE pattern from
 * migrate:remote — requires wrangler auth / CLOUDFLARE_API_TOKEN):
 *   npm run migrate:media-prefixes:remote
 *
 * Run against REMOTE production bindings:
 *   npm run migrate:media-prefixes:production
 */

import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import { getCfEnv } from '../lib/cloudflareEnv'
import { fileKeyFor } from '../lib/media'

dotenvConfig({ path: '.env' })

const PAGE_SIZE = 50

async function main() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  const env = await getCfEnv()

  let page = 1
  let migrated = 0
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
      const filename = doc.filename as string | undefined
      if (!filename) {
        skipped++
        continue
      }
      if (doc.prefix) {
        // Already marked as migrated — but verify the object actually exists
        // at the prefixed key. If it doesn't (e.g. seed set the prefix without
        // moving the object), copy the legacy root object over.
        const expectedKey = fileKeyFor(doc.prefix as string, filename)
        try {
          const head = await env.R2.head(expectedKey)
          if (head) {
            skipped++
            continue
          }
          const legacy = await env.R2.get(filename)
          if (!legacy) {
            console.warn(
              `[migrate] ${filename}: no R2 object at ${expectedKey} or at bucket root; needs re-upload.`,
            )
            failed++
            continue
          }
          // Keep the legacy root object in place (other docs may reference it).
          // Buffer the body: the local miniflare binding requires a known length.
          await env.R2.put(expectedKey, await legacy.arrayBuffer(), {
            httpMetadata: legacy.httpMetadata,
            customMetadata: legacy.customMetadata,
          })
          repaired++
          console.log(`[migrate] ${filename}: repaired missing object -> ${expectedKey}`)
        } catch (err) {
          failed++
          console.error(`[migrate] ${filename}: repair failed:`, err)
        }
        continue
      }

      const oldKey = filename
      const newKey = fileKeyFor('public', filename)

      try {
        const obj = await env.R2.get(oldKey)
        if (!obj) {
          console.warn(`[migrate] ${filename}: no R2 object at ${oldKey}; skipping.`)
          failed++
          continue
        }
        await env.R2.put(newKey, await obj.arrayBuffer(), {
          httpMetadata: obj.httpMetadata,
          customMetadata: obj.customMetadata,
        })

        await payload.update({
          collection: 'media',
          id: doc.id,
          data: { prefix: 'public', visibility: 'public' },
          depth: 0,
          overrideAccess: true,
        })

        await env.R2.delete(oldKey)

        // Enqueue thumbnail generation for images (worker de-dupes itself).
        if (typeof doc.mimeType === 'string' && doc.mimeType.startsWith('image/')) {
          try {
            await env.THUMBNAILS.fetch('https://thumbnails/trigger', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                key: newKey,
                filename,
                updatedAt: new Date().toISOString(),
              }),
            })
          } catch (err) {
            console.warn(`[migrate] ${filename}: thumbnail trigger failed:`, err)
          }
        }

        migrated++
        console.log(`[migrate] ${filename}: moved ${oldKey} -> ${newKey}`)
      } catch (err) {
        failed++
        console.error(`[migrate] ${filename}: failed:`, err)
      }
    }

    if (!result.hasNextPage) break
    page++
  }

  console.log(`[migrate] done. migrated=${migrated} repaired=${repaired} skipped=${skipped} failed=${failed}`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('[migrate] fatal:', err)
  process.exit(1)
})
