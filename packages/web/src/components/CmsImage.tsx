'use client'

import Image from 'next/image'
import { useState } from 'react'
import { transformMediaUrl, type ImageSize, type ImageTransformOptions } from '@/lib/image'

type NextImageProps = React.ComponentProps<typeof Image>

interface CmsImageProps extends Omit<NextImageProps, 'src'> {
  src?: string
  /** Preset transform size. Preferred over manual `transformWidth`. */
  size?: ImageSize
  /**
   * Source filename. Passing this lets `size='thumb'` use the pre-generated
   * R2 thumbnail instead of an on-the-fly transform.
   */
  filename?: string
  transformWidth?: number
  transformHeight?: number
  transformFit?: ImageTransformOptions['fit']
  transformQuality?: number
  transformFormat?: ImageTransformOptions['format']
}

/**
 * Drop-in replacement for `next/image` that automatically serves CMS media
 * through pre-generated thumbnails (`size='thumb'`), our image proxy, or
 * Cloudflare Images transformations when enabled.
 *
 * Pass `size` to request a standard preset width (`thumb`, `sm`, `md`, `lg`,
 * `xl`, `full`). You can still use `transformWidth` for one-off sizes.
 *
 * External or local images are left untouched.
 *
 * If the transformed URL fails to load (for example because the proxy or
 * Cloudflare Image Transformations is not enabled), the component falls back
 * to the original source URL.
 */
export default function CmsImage({
  src,
  size,
  filename,
  transformWidth,
  transformHeight,
  transformFit,
  transformQuality,
  transformFormat,
  onError,
  ...rest
}: CmsImageProps) {
  const transformedSrc = transformMediaUrl(src, {
    size,
    filename,
    width: transformWidth,
    height: transformHeight,
    fit: transformFit,
    quality: transformQuality,
    format: transformFormat,
  })

  const [currentSrc, setCurrentSrc] = useState(transformedSrc || '')

  const handleError: NextImageProps['onError'] = (e) => {
    // Fall back to the original, untransformed URL if we haven't already.
    if (src && currentSrc !== src) {
      setCurrentSrc(src)
    }
    if (onError) {
      onError(e)
    }
  }

  return <Image src={currentSrc} onError={handleError} {...rest} />
}
