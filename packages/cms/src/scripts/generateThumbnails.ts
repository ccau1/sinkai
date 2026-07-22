/**
 * Backfill thumbnails for existing public image media.
 *
 * Iterates all public media documents with an image mimeType and generates a
 * 320px WebP thumbnail locally with sharp, writing it directly to R2 via the
 * REST API. The thumbnails worker service binding is not reliably reachable
 * from CLI/TSX scripts, so this script does not use it.
 *
 * Run locally (local bindings):
 *   npm run generate:thumbnails
 *
 * Run against REMOTE staging (requires CLOUDFLARE_API_TOKEN and
 * CLOUDFLARE_ACCOUNT_ID in packages/cms/.env):
 *   npm run generate:thumbnails:remote
 *
 * Run against REMOTE production (requires CLOUDFLARE_API_TOKEN and
 * CLOUDFLARE_ACCOUNT_ID in packages/cms/.env):
 *   npm run generate:thumbnails:production
 *
 * Dry-run to preview what would be generated:
 *   DRY_RUN=true npm run generate:thumbnails
 */

import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import { getCfEnv } from '../lib/cloudflareEnv'
import {
  checkThumbnailFreshness,
  generateThumbnailLocally,
} from '../lib/thumbnails'

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

async function main() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  let env: CloudflareEnv | undefined
  try {
    env = await getCfEnv()
  } catch (err) {
    console.error('[generate-thumbnails] failed to resolve Cloudflare bindings:', err)
  }

  // Credentials are loaded from .env; the actual R2 reads/writes use the REST
  // API so we do not need the THUMBNAILS/R2 bindings here.

  let page = 1
  let scanned = 0
  let fresh = 0
  const triggered = 0
  let generated = 0
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

      const status = await checkThumbnailFreshness(env, doc.prefix, doc.filename)

      if (status === 'fresh') {
        fresh++
        continue
      }

      if (status === 'error') {
        failed++
        console.error(`[generate-thumbnails] source missing or errored for ${doc.filename}`)
        continue
      }

      if (DRY_RUN) {
        console.log(`[generate-thumbnails] would generate ${doc.filename}`)
        generated++
        continue
      }

      const ok = await generateThumbnailLocally(env, doc.prefix, doc.filename)
      if (ok) {
        generated++
        console.log(`[generate-thumbnails] generated ${doc.filename}`)
      } else {
        failed++
        console.error(`[generate-thumbnails] failed to generate ${doc.filename}`)
      }
    }

    if (!result.hasNextPage) break
    page++
  }

  console.log(
    `[generate-thumbnails] done. scanned=${scanned} fresh=${fresh} triggered=${triggered} generated=${generated} failed=${failed} skipped=${skipped}`,
  )

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('[generate-thumbnails] fatal:', err)
  process.exit(1)
})
