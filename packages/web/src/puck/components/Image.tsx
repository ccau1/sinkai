'use client'

import Image from 'next/image'

export interface PuckImageProps {
  src?: string
  alt?: string
  caption?: string
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide' | 'portrait'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shadow?: boolean
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full'
}

const aspectRatioClass: Record<string, string> = {
  auto: 'aspect-auto',
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[21/9]',
  portrait: 'aspect-[3/4]',
}

const roundedClass: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full',
}

const maxWidthClass: Record<string, string> = {
  narrow: 'max-w-2xl',
  medium: 'max-w-3xl',
  wide: 'max-w-5xl',
  full: 'max-w-none',
}

export function PuckImage({
  src = '/gallery/mountain/01_48.jpg',
  alt = '',
  caption,
  aspectRatio = 'auto',
  rounded = 'xl',
  shadow = true,
  maxWidth = 'wide',
}: PuckImageProps) {
  return (
    <section className="section" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className={`container-main ${maxWidthClass[maxWidth]}`}>
        <figure
          className={`overflow-hidden ${aspectRatioClass[aspectRatio]} ${roundedClass[rounded]} ${shadow ? 'shadow-xl' : ''}`}
        >
          <Image src={src} alt={alt} fill className="object-cover" />
        </figure>
        {caption && (
          <figcaption className="text-center mt-4 text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            {caption}
          </figcaption>
        )}
      </div>
    </section>
  )
}
