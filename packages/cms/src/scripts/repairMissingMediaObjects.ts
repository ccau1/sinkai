/**
 * One-off repair that makes sure every public media document has its original
 * file in R2 under the expected key (`public/<filename>`).
 *
 * For each non-private media record:
 *   1. Derive the canonical filename by stripping Payload dedupe suffixes such
 *      as `-1`, `-2` before the extension.
 *   2. Look for a matching source file under `packages/web/public`.
 *   3. Upload the source file to `public/<filename>` in R2 if it is missing.
 *   4. Update the document `prefix` to `public` and `filename` to the canonical
 *      name when needed.
 *
 * Private files are left untouched. Records whose source file cannot be found
 * are logged as warnings.
 *
 * Run against staging:
 *   CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ACCOUNT_ID=xxx \
 *     NODE_ENV=production PAYLOAD_REMOTE=true PAYLOAD_SECRET=ignore \
 *     MEDIA_PUBLIC_URL=https://sinkai-cms-media.staging.tribalorigin.com \
 *     tsx src/scripts/repairMissingMediaObjects.ts
 */

import fs from 'fs'
import path from 'path'
import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import { r2ObjectExists, r2UploadFile } from '../lib/r2Upload'

dotenvConfig({ path: '.env' })

const webPublicDir = path.resolve(process.cwd(), '../web/public')

function walk(dir: string, map: Map<string, string>): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, map)
    } else {
      map.set(entry.name, fullPath)
    }
  }
}

function stripDedupeSuffix(filename: string): string {
  return filename.replace(/-\d+(?=\.[^.]+$)/, '')
}

async function main() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  const fileMap = new Map<string, string>()
  if (fs.existsSync(webPublicDir)) {
    walk(webPublicDir, fileMap)
  }

  let checked = 0
  let uploaded = 0
  let updated = 0
  let missingSource = 0
  let skippedPrivate = 0
  let page = 1

  for (;;) {
    const result = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 100,
      page,
      overrideAccess: true,
    })
    if (!result.docs.length) break

    for (const doc of result.docs) {
      checked++
      const filename = (doc.filename as string | undefined) || ''
      const prefix = (doc.prefix as string | undefined) || ''

      if (!filename) {
        console.warn(`[repair] media ${doc.id} has no filename`)
        continue
      }

      if (prefix === 'private') {
        skippedPrivate++
        continue
      }

      const canonicalFilename = stripDedupeSuffix(filename)
      const objectKey = `public/${canonicalFilename}`
      const sourcePath = fileMap.get(canonicalFilename)

      if (!sourcePath) {
        console.warn(`[repair] source file not found for ${filename}`)
        missingSource++
        continue
      }

      const exists = await r2ObjectExists(objectKey)
      if (!exists) {
        console.log(`[repair] uploading ${objectKey}`)
        await r2UploadFile(sourcePath, objectKey)
        uploaded++
      }

      const needsDocUpdate =
        doc.prefix !== 'public' || doc.filename !== canonicalFilename
      if (needsDocUpdate) {
        await payload.update({
          collection: 'media',
          id: doc.id,
          data: {
            prefix: 'public',
            filename: canonicalFilename,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          overrideAccess: true,
        })
        updated++
      }
    }

    if (!result.hasNextPage) break
    page++
  }

  console.log(
    `[repair] checked ${checked}, uploaded ${uploaded}, updated ${updated}, missing source ${missingSource}, skipped private ${skippedPrivate}`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
