'use client'

export interface PuckTextProps {
  text?: string
  label?: string
  align?: 'left' | 'center' | 'right'
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full'
  background?: 'base' | 'surface' | 'primary' | 'dark'
}

const maxWidthClass: Record<string, string> = {
  narrow: 'max-w-2xl',
  medium: 'max-w-3xl',
  wide: 'max-w-5xl',
  full: 'max-w-none',
}

const backgroundStyle: Record<string, React.CSSProperties> = {
  base: { backgroundColor: 'var(--color-bg-base)' },
  surface: { backgroundColor: 'var(--color-bg-surface)' },
  primary: { backgroundColor: 'var(--color-primary-900)', color: 'white' },
  dark: { backgroundColor: 'var(--color-bg-inverted)', color: 'white' },
}

export function PuckText({
  text,
  label,
  align = 'left',
  maxWidth = 'medium',
  background = 'base',
}: PuckTextProps) {
  const textAlign = align === 'center' ? 'text-center mx-auto' : align === 'right' ? 'text-right ml-auto' : ''
  const isLight = background === 'base' || background === 'surface'

  return (
    <section className="section" style={backgroundStyle[background]}>
      <div className={`container-main ${maxWidthClass[maxWidth]} ${textAlign}`}>
        {label && (
          <p className="text-label mb-3 tracking-widest" style={{ color: isLight ? 'var(--color-primary-600)' : 'var(--color-primary-300)' }}>
            {label}
          </p>
        )}
        {text && (
          <div
            className="text-body-lg leading-relaxed whitespace-pre-wrap"
            style={{ color: isLight ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.85)' }}
          >
            {text}
          </div>
        )}
      </div>
    </section>
  )
}
