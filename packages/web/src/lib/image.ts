export const IMAGE_SIZE_WIDTHS = {
  thumb: 320,
  sm: 400,
  md: 600,
  lg: 800,
  xl: 1200,
  full: 1600,
} as const

export type ImageSize = keyof typeof IMAGE_SIZE_WIDTHS

export interface ImageTransformOptions {
  /** Preset size. When provided, it maps to a standard width for the proxy/CDN. */
  size?: ImageSize
  width?: number
  height?: number
  fit?: 'scale-down' | 'cover' | 'contain' | 'crop' | 'pad'
  quality?: number
  format?: 'auto' | 'avif' | 'webp' | 'jpeg' | 'png' | 'gif'
  /**
   * Optional source filename. When supplied and `size` is `thumb`, the URL is
   * rewritten to the pre-generated R2 thumbnail (`public/thumbnails/<basename>.webp`).
   */
  filename?: string
}

function getSizeWidth(size?: ImageSize): number | undefined {
  return size ? IMAGE_SIZE_WIDTHS[size] : undefined
}

function getTransformOrigin(): string | undefined {
  const explicit = getExplicitTransformOrigin()
  if (explicit) return explicit

  const cms =
    typeof process !== 'undefined'
      ? process.env.CMS_API_URL || process.env.NEXT_PUBLIC_CMS_API_URL
      : undefined
  return cms ? cms.replace(/\/$/, '') : undefined
}

/**
 * Returns the explicitly configured public media host, if any.
 * Pre-generated thumbnails live on this host; when it is not configured
 * (typical local dev), we fall back to the original image instead of guessing
 * a thumbnail URL that does not exist.
 */
function getExplicitTransformOrigin(): string | undefined {
  const explicit =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_CMS_IMAGE_TRANSFORM_ORIGIN
      : undefined
  return explicit ? explicit.replace(/\/$/, '') : undefined
}

function getProxyOrigin(): string | undefined {
  const explicit =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_IMAGE_PROXY_ORIGIN
      : undefined
  return explicit ? explicit.replace(/\/$/, '') : undefined
}

function getCmsOrigin(): string | undefined {
  const cms =
    typeof process !== 'undefined'
      ? process.env.CMS_API_URL || process.env.NEXT_PUBLIC_CMS_API_URL
      : undefined
  return cms ? cms.replace(/\/$/, '') : undefined
}

/**
 * Extract a filename from a media URL/path when an explicit filename is not
 * available. Returns undefined for non-file URLs.
 */
function extractFilenameFromSrc(src: string): string | undefined {
  try {
    const url = new URL(src)
    const last = url.pathname.split('/').pop()
    if (last && last.includes('.') && last.length > 2) {
      return last
    }
  } catch {
    // Not a full URL: treat it as a filename if it has an extension and no path.
    if (!src.includes('/') && src.includes('.')) {
      return src
    }
  }
  return undefined
}

/**
 * Rewrite a CMS media URL to request an optimized image.
 *
 * For `size: 'thumb'` the URL points to the pre-generated R2 thumbnail
 * (`public/thumbnails/<basename>.webp`) when the source filename can be
 * determined. This is served as a static file and does not require Cloudflare
 * Image Transformations to be enabled.
 *
 * For other sizes:
 * - If `NEXT_PUBLIC_IMAGE_PROXY_ORIGIN` is configured, the URL is rewritten to
 *   the proxy worker path (`/img/<size>/<source-path>`).
 * - Otherwise the URL falls back to Cloudflare Images
 *   (`/cdn-cgi/image/<options>/<source-path>`) when transforms are enabled.
 *
 * If image transforms are disabled, the origin is unknown, or the source is an
 * external/non-CMS URL, the original URL is returned unchanged.
 *
 * @see https://developers.cloudflare.com/images/transform-images/
 */
export function transformMediaUrl(
  src: string | undefined,
  options: ImageTransformOptions,
): string | undefined {
  if (!src) return src

  const proxyOrigin = getProxyOrigin()
  const transformOrigin = getTransformOrigin()
  const origin = proxyOrigin ?? transformOrigin

  // Pre-generated thumbnails: static R2 webp files produced by the
  // sinkai-cms-thumbnails workflow. Only use them when the public media host is
  // explicitly configured; in local dev the CMS API origin is not the media
  // host and thumbnails are not generated, so fall through to the original URL.
  if (options.size === 'thumb') {
    const thumbBase = getExplicitTransformOrigin()
    const filename = options.filename || extractFilenameFromSrc(src)
    if (thumbBase && filename) {
      const basename = filename.replace(/\.[^.]+$/, '')
      return `${thumbBase}/public/thumbnails/${basename}.webp`
    }
  }

  if (!origin) return src

  const cmsOrigin = getCmsOrigin() || transformOrigin

  // Only transform URLs that belong to our CMS/origin. Leave external images
  // (e.g. legacy local images, third-party URLs) untouched.
  if (src.startsWith('http') && !src.startsWith(cmsOrigin ?? '') && !src.startsWith(origin)) {
    return src
  }

  let sourcePath = src
  if (src.startsWith(origin)) {
    sourcePath = src.slice(origin.length)
  } else if (cmsOrigin && src.startsWith(cmsOrigin)) {
    sourcePath = src.slice(cmsOrigin.length)
  }

  if (!sourcePath.startsWith('/')) {
    sourcePath = `/${sourcePath}`
  }

  const width = options.width ?? getSizeWidth(options.size)

  // Proxy-worker mode: use the size-based path when a proxy origin is set.
  // The worker can read width/fit/quality/format from the query string.
  if (proxyOrigin && options.size) {
    const params = new URLSearchParams()
    if (width) params.set('width', String(width))
    if (options.height) params.set('height', String(options.height))
    if (options.fit) params.set('fit', options.fit)
    if (options.quality) params.set('quality', String(options.quality))
    if (options.format) params.set('format', options.format)

    const query = params.toString()
    return `${proxyOrigin}/img/${options.size}${sourcePath}${query ? `?${query}` : ''}`
  }

  // Fallback to Cloudflare Images URL interface.
  if (process.env.NEXT_PUBLIC_ENABLE_IMAGE_TRANSFORMS !== 'true') {
    return src
  }

  const cdnOrigin = transformOrigin || origin
  if (!cdnOrigin) return src

  const parts: string[] = []
  if (width) parts.push(`width=${width}`)
  if (options.height) parts.push(`height=${options.height}`)
  if (options.fit) parts.push(`fit=${options.fit}`)
  if (options.quality) parts.push(`quality=${options.quality}`)
  if (options.format) parts.push(`format=${options.format}`)

  if (parts.length === 0) return src

  return `${cdnOrigin}/cdn-cgi/image/${parts.join(',')}${sourcePath}`
}
