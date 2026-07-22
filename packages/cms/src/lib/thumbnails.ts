/**
 * Shared thumbnail helpers for the CMS and local scripts.
 *
 * The deployed sinkai-cms-thumbnails worker uses Cloudflare Image Resizing to
 * generate thumbnails. CLI scripts run in Node.js and can fall back to sharp
 * when the worker service binding is not available (common in local dev).
 */

import sharp from 'sharp'
import { fileKeyFor, thumbKeyFor } from './media'
import { r2GetObject, r2ObjectExists, r2UploadFile } from './r2Upload'

export type ThumbnailStatus = 'fresh' | 'stale' | 'missing' | 'error'

/**
 * Check whether a thumbnail for `filename` exists and looks fresh.
 *
 * Uses the R2 REST API instead of the R2 binding because CLI backfill scripts
 * run in Node/TSX and `getPlatformProxy` remote bindings do not reliably read
 * from the remote R2 bucket.
 */
export async function checkThumbnailFreshness(
  _env: Pick<CloudflareEnv, 'R2'>,
  prefix: string | null | undefined,
  filename: string,
): Promise<ThumbnailStatus> {
  const key = fileKeyFor(prefix, filename)
  try {
    const [sourceExists, thumbExists] = await Promise.all([
      r2ObjectExists(key),
      r2ObjectExists(thumbKeyFor(filename)),
    ])
    if (!sourceExists) return 'error'
    if (!thumbExists) return 'missing'
    // Treat existing pairs as fresh during backfill. A full etag comparison
    // would require reading custom metadata via the REST API headers; for a
    // one-time backfill regenerating a thumbnail that already exists is cheap.
    return 'fresh'
  } catch (err) {
    console.warn(`[thumbnails] freshness check failed for ${filename}:`, err)
    return 'error'
  }
}

/**
 * Generate a 320px-wide WebP thumbnail for `filename` using sharp and store it
 * in R2 at the conventional thumbnail key.
 *
 * Uses the R2 REST API for reads/writes so this works from CLI/TSX scripts
 * where the R2 binding proxy is unreliable.
 */
export async function generateThumbnailLocally(
  _env: Pick<CloudflareEnv, 'R2'>,
  prefix: string | null | undefined,
  filename: string,
): Promise<boolean> {
  const key = fileKeyFor(prefix, filename)
  const thumbKey = thumbKeyFor(filename)
  try {
    const source = await r2GetObject(key)
    if (!source) {
      console.warn(`[thumbnails] source object missing: ${key}`)
      return false
    }

    const resized = await sharp(source, {
      // Treat GIFs as static images; animated GIFs are not supported.
      animated: false,
    })
      .resize({
        width: 320,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 80 })
      .toBuffer()

    await r2UploadFile(thumbKey, thumbKey, resized)

    return true
  } catch (err) {
    console.warn(`[thumbnails] local generation failed for ${filename}:`, err)
    return false
  }
}
