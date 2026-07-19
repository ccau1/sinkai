'use client'

import Image from 'next/image'
import { useState } from 'react'
import { transformMediaUrl, type ImageTransformOptions } from '@/lib/image'

type NextImageProps = React.ComponentProps<typeof Image>

interface CmsImageProps extends Omit<NextImageProps, 'src'> {
  src?: string
  transformWidth?: number
  transformHeight?: number
  transformFit?: ImageTransformOptions['fit']
  transformQuality?: number
  transformFormat?: ImageTransformOptions['format']
}

/**
 * Drop-in replacement for `next/image` that automatically serves CMS media
 * through Cloudflare Images transformations when enabled.
 *
 * Pass `transformWidth` (and optionally `transformHeight`, `transformFit`,
 * `transformQuality`, `transformFormat`) to request a resized/optimised
 * variant. External or local images are left untouched.
 *
 * If the transformed URL fails to load (for example because Cloudflare Image
 * Transformations is not yet enabled for the zone), the component falls back
 * to the original source URL.
 */
export default function CmsImage({
  src,
  transformWidth,
  transformHeight,
  transformFit,
  transformQuality,
  transformFormat,
  onError,
  ...rest
}: CmsImageProps) {
  const transformedSrc = transformMediaUrl(src, {
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
