/**
 * Shared thumbnail helpers for the CMS and local scripts.
 *
 * The deployed sinkai-cms-thumbnails worker uses Cloudflare Image Resizing to
 * generate thumbnails. CLI scripts run in Node.js and can fall back to sharp
 * when the worker service binding is not available (common in local dev).
 */

import sharp from 'sharp'
import { fileKeyFor, thumbKeyFor } from './media'

export type ThumbnailStatus = 'fresh' | 'stale' | 'missing' | 'error'

/**
 * Check whether a thumbnail for `filename` is fresh, stale, missing, or errored
 * by comparing the stored thumbnail's `sourceEtag` custom metadata against the
 * source object's etag.
 */
export async function checkThumbnailFreshness(
  env: Pick<CloudflareEnv, 'R2'>,
  prefix: string | null | undefined,
  filename: string,
): Promise<ThumbnailStatus> {
  const key = fileKeyFor(prefix, filename)
  try {
    const [source, thumb] = await Promise.all([
      env.R2.head(key),
      env.R2.head(thumbKeyFor(filename)),
    ])
    if (!source) return 'error'
    if (!thumb) return 'missing'
    if (thumb.customMetadata?.sourceEtag !== source.etag) return 'stale'
    return 'fresh'
  } catch (err) {
    console.warn(`[thumbnails] freshness check failed for ${filename}:`, err)
    return 'error'
  }
}

/**
 * Generate a 320px-wide WebP thumbnail for `filename` using sharp and store it
 * in R2 at the conventional thumbnail key with `sourceEtag` custom metadata.
 */
export async function generateThumbnailLocally(
  env: Pick<CloudflareEnv, 'R2'>,
  prefix: string | null | undefined,
  filename: string,
): Promise<boolean> {
  const key = fileKeyFor(prefix, filename)
  try {
    const source = await env.R2.head(key)
    if (!source) {
      console.warn(`[thumbnails] source object missing: ${key}`)
      return false
    }

    const obj = await env.R2.get(key)
    if (!obj) {
      console.warn(`[thumbnails] source object missing: ${key}`)
      return false
    }

    const buffer = Buffer.from(await obj.arrayBuffer())
    const resized = await sharp(buffer, {
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

    await env.R2.put(thumbKeyFor(filename), resized, {
      httpMetadata: { contentType: 'image/webp' },
      customMetadata: { sourceEtag: source.etag },
    })

    return true
  } catch (err) {
    console.warn(`[thumbnails] local generation failed for ${filename}:`, err)
    return false
  }
}
