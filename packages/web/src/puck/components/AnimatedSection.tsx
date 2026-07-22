'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface PuckAnimatedSectionProps {
  effect?: 'fade-up' | 'parallax' | 'scale-in'
  speed?: number
  backgroundColor?: string
  verticalPadding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  children?: React.ReactNode
}

const paddingClass: Record<string, string> = {
  none: 'py-0',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-24',
  xl: 'py-20 md:py-28',
}

export function PuckAnimatedSection({
  effect = 'fade-up',
  speed = 0.5,
  backgroundColor = 'var(--color-bg-base)',
  verticalPadding = 'xl',
  children,
}: PuckAnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      const el = ref.current
      if (!el) return

      if (effect === 'fade-up') {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        )
      } else if (effect === 'scale-in') {
        gsap.fromTo(
          el,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        )
      } else if (effect === 'parallax') {
        gsap.to(el, {
          yPercent: -10 * (speed ?? 0.5),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    })

    return () => ctx.revert()
  }, [effect, speed])

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden ${paddingClass[verticalPadding]}`}
      style={{ backgroundColor }}
    >
      <div className="container-main relative z-10">{children}</div>
    </section>
  )
}
