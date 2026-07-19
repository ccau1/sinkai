export interface ImageTransformOptions {
  width?: number
  height?: number
  fit?: 'scale-down' | 'cover' | 'contain' | 'crop' | 'pad'
  quality?: number
  format?: 'auto' | 'avif' | 'webp' | 'jpeg' | 'png' | 'gif'
}

function getTransformOrigin(): string | undefined {
  const explicit =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_CMS_IMAGE_TRANSFORM_ORIGIN
      : undefined
  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  const cms =
    typeof process !== 'undefined'
      ? process.env.CMS_API_URL || process.env.NEXT_PUBLIC_CMS_API_URL
      : undefined
  return cms ? cms.replace(/\/$/, '') : undefined
}

function getCmsOrigin(): string | undefined {
  const cms =
    typeof process !== 'undefined'
      ? process.env.CMS_API_URL || process.env.NEXT_PUBLIC_CMS_API_URL
      : undefined
  return cms ? cms.replace(/\/$/, '') : undefined
}

/**
 * Rewrite a CMS media URL to request an on-the-fly transformation from
 * Cloudflare Images (`/cdn-cgi/image/...`).
 *
 * If image transforms are disabled, the origin is unknown, or the source is
 * an external/non-CMS URL, the original URL is returned unchanged.
 *
 * Cloudflare Images transformations are free for the first 5,000 unique
 * transformations per month and do not require a paid plan.
 *
 * @see https://developers.cloudflare.com/images/transform-images/
 */
export function transformMediaUrl(
  src: string | undefined,
  options: ImageTransformOptions,
): string | undefined {
  if (!src) return src

  if (process.env.NEXT_PUBLIC_ENABLE_IMAGE_TRANSFORMS !== 'true') {
    return src
  }

  const origin = getTransformOrigin()
  if (!origin) return src

  const cmsOrigin = getCmsOrigin() || origin

  // Only transform URLs that belong to our CMS/origin. Leave external images
  // (e.g. legacy local images, third-party URLs) untouched.
  if (src.startsWith('http') && !src.startsWith(cmsOrigin) && !src.startsWith(origin)) {
    return src
  }

  let sourcePath = src
  if (src.startsWith(origin)) {
    sourcePath = src.slice(origin.length)
  } else if (src.startsWith(cmsOrigin)) {
    sourcePath = src.slice(cmsOrigin.length)
  }

  if (!sourcePath.startsWith('/')) {
    sourcePath = `/${sourcePath}`
  }

  const parts: string[] = []
  if (options.width) parts.push(`width=${options.width}`)
  if (options.height) parts.push(`height=${options.height}`)
  if (options.fit) parts.push(`fit=${options.fit}`)
  if (options.quality) parts.push(`quality=${options.quality}`)
  if (options.format) parts.push(`format=${options.format}`)

  if (parts.length === 0) return src

  return `${origin}/cdn-cgi/image/${parts.join(',')}${sourcePath}`
}
