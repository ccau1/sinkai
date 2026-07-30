'use client'

import { useDocumentInfo, useTranslation } from '@payloadcms/ui'
import React, { useEffect, useMemo, useState } from 'react'

import { t } from '../uiTranslations'

interface Reference {
  collection: string
  id: number | string
  label: string
  href: string
  isInline?: boolean
}

const collectionLabels: Record<string, string> = {
  blogs: '網誌',
  installations: '援助項目',
  testimonies: '見證',
  pages: '頁面',
}

function getCollectionLabel(collection: string): string {
  return collectionLabels[collection] ?? collection
}

function renderReference(ref: Reference): React.ReactNode {
  const collectionLabel = getCollectionLabel(ref.collection)
  const inlineSuffix = ref.isInline ? ` ${t('mediaUsage.inlineContent')}` : ''
  const displayLabel = ref.label || `${collectionLabel} ${ref.id}`

  return (
    <a
      href={ref.href}
      style={{
        color: 'var(--theme-text, #000)',
        textDecoration: 'underline',
      }}
    >
      {collectionLabel}: {displayLabel}
      {inlineSuffix}
    </a>
  )
}

async function fetchReferences(
  id: string | number,
  mode: 'direct' | 'inline',
  signal: AbortSignal,
): Promise<Reference[]> {
  const res = await fetch(`/api/media/media-usage/${mode}?id=${encodeURIComponent(String(id))}`, {
    signal,
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const data = (await res.json()) as { references: Reference[] }
  return data.references ?? []
}

export default function MediaUsage() {
  const { id } = useDocumentInfo()
  const { i18n } = useTranslation()
  const language = i18n.language

  const [direct, setDirect] = useState<Reference[] | null>(null)
  const [inline, setInline] = useState<Reference[] | null>(null)
  const [directLoading, setDirectLoading] = useState(false)
  const [inlineLoading, setInlineLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const references = useMemo<Reference[]>(() => {
    const all: Reference[] = []
    if (direct) all.push(...direct)
    if (inline) all.push(...inline)
    return all
  }, [direct, inline])

  useEffect(() => {
    if (!id) return

    const directController = new AbortController()
    const inlineController = new AbortController()

    const run = async () => {
      // Reset UI state from within the async task so React Compiler does not
      // see a synchronous setState during the effect body.
      await Promise.resolve()
      setError(null)
      setDirect(null)
      setInline(null)
      setDirectLoading(true)
      setInlineLoading(true)

      try {
        const [directRefs, inlineRefs] = await Promise.all([
          fetchReferences(id, 'direct', directController.signal),
          fetchReferences(id, 'inline', inlineController.signal),
        ])
        setDirect(directRefs)
        setInline(inlineRefs)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        console.error('[MediaUsage] failed to load references:', err)
        setError(err instanceof Error ? err.message : 'unknown error')
      } finally {
        setDirectLoading(false)
        setInlineLoading(false)
      }
    }

    void run()

    return () => {
      directController.abort()
      inlineController.abort()
    }
  }, [id])

  if (!id) return null

  const isLoading = directLoading || inlineLoading
  const hasInlineOnly = inlineLoading && !directLoading

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--theme-elevation-50, #f7f7f7)',
        borderRadius: '8px',
        border: '1px solid var(--theme-elevation-200, #e5e5e5)',
        marginTop: '8px',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600 }}>
        {t('mediaUsage.heading', language, { count: references.length })}
      </h3>

      {isLoading && references.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--theme-elevation-600, #666)' }}>
          {t('mediaUsage.checking', language)}
        </p>
      ) : error ? (
        <p style={{ margin: 0, color: 'var(--theme-error-500, #c00)' }}>
          {t('mediaUsage.error', language, { message: error })}
        </p>
      ) : references.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--theme-elevation-600, #666)' }}>
          {t('mediaUsage.empty', language)}
        </p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {references.map((ref) => (
            <li key={`${ref.collection}-${ref.id}`} style={{ marginBottom: '4px' }}>
              {renderReference(ref)}
            </li>
          ))}
        </ul>
      )}

      {hasInlineOnly && (
        <p style={{ margin: '8px 0 0', color: 'var(--theme-elevation-600, #666)', fontSize: '12px' }}>
          {t('mediaUsage.inlineChecking', language)}
        </p>
      )}
    </div>
  )
}
