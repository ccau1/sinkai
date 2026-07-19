'use client'

import Image from 'next/image'
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
 */
export default function CmsImage({
  src,
  transformWidth,
  transformHeight,
  transformFit,
  transformQuality,
  transformFormat,
  ...rest
}: CmsImageProps) {
  const transformedSrc = transformMediaUrl(src, {
    width: transformWidth,
    height: transformHeight,
    fit: transformFit,
    quality: transformQuality,
    format: transformFormat,
  })

  return <Image src={transformedSrc || ''} {...rest} />
}
