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
}

function getSizeWidth(size?: ImageSize): number | undefined {
  return size ? IMAGE_SIZE_WIDTHS[size] : undefined
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
 * Rewrite a CMS media URL to request an on-the-fly transformation.
 *
 * If `NEXT_PUBLIC_IMAGE_PROXY_ORIGIN` is configured and a `size` is provided,
 * the URL is rewritten to the proxy worker path
 * (`/img/<size>/<source-path>`), with other transform options passed as query
 * parameters. This is the path the future R2 image proxy worker will handle.
 *
 * Otherwise, the URL falls back to Cloudflare Images
 * (`/cdn-cgi/image/<options>/<source-path>`) when image transforms are enabled.
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
