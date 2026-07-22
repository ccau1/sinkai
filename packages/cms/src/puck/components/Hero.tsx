'use client'

import Image from 'next/image'
import Link from 'next/link'

export interface PuckHeroProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  align?: 'left' | 'center' | 'right'
  overlayOpacity?: number
  minHeight?: string
}

export function PuckHero({
  title,
  subtitle,
  backgroundImage = '/gallery/mountain/01_48.jpg',
  primaryCtaLabel,
  primaryCtaHref = '/',
  secondaryCtaLabel,
  secondaryCtaHref,
  align = 'center',
  overlayOpacity = 0.55,
  minHeight = '80vh',
}: PuckHeroProps) {
  const alignmentClass =
    align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center'

  return (
    <section
      className="relative flex overflow-hidden"
      style={{ minHeight, backgroundColor: '#1c1917' }}
    >
      <div className="absolute inset-0">
        <Image src={backgroundImage} alt="" fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
      </div>

      <div className="container-main relative z-10 flex flex-col justify-center py-24" style={{ color: 'white' }}>
        <div className={`max-w-3xl ${alignmentClass}`}>
          <h1 className="text-headline font-bold mb-6" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-body-lg mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {subtitle}
            </p>
          )}
          {(primaryCtaLabel || secondaryCtaLabel) && (
            <div
              className="flex flex-wrap gap-4"
              style={{ justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}
            >
              {primaryCtaLabel && (
                <Link href={primaryCtaHref || '/'} className="btn-primary inline-block">
                  {primaryCtaLabel}
                </Link>
              )}
              {secondaryCtaLabel && (
                <Link href={secondaryCtaHref || '/'} className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
