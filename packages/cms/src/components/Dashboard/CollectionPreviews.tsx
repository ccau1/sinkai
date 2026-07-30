'use client'

import { useTranslation } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import { t } from '../../uiTranslations'
import './CollectionPreviews.scss'

interface CollectionDocPreview {
  id: number | string
  title: string
}

interface CollectionPreview {
  slug: string
  label: string
  href: string
  createHref: string
  hasCreatePermission: boolean
  docs: CollectionDocPreview[]
}

export default function CollectionPreviews() {
  const { i18n } = useTranslation()
  const language = i18n.language

  const [previews, setPreviews] = useState<CollectionPreview[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const res = await fetch('/api/dashboard/collection-previews')
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const data = (await res.json()) as { previews: CollectionPreview[] }
        if (!cancelled) {
          setPreviews(data.previews ?? [])
        }
      } catch (err) {
        console.error('[CollectionPreviews] failed to load previews:', err)
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'unknown error')
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="collection-previews">
        <p style={{ color: 'var(--theme-error-500, #c00)' }}>{t('collectionPreviews.error', language, { message: error })}</p>
      </div>
    )
  }

  if (!previews) {
    return (
      <div className="collection-previews">
        <h2 className="collection-previews__heading">{t('collectionPreviews.heading', language)}</h2>
        <p>{t('collectionPreviews.checking', language)}</p>
      </div>
    )
  }

  if (previews.length === 0) {
    return null
  }

  return (
    <div className="collection-previews">
      <h2 className="collection-previews__heading">{t('collectionPreviews.heading', language)}</h2>
      <div className="collection-previews__grid">
        {previews.map((preview) => (
          <div className="collection-previews__card" key={preview.slug}>
            <div className="collection-previews__card-header">
              <h3 className="collection-previews__card-title">
                <a href={preview.href}>{preview.label}</a>
              </h3>
              {preview.hasCreatePermission && (
                <a
                  aria-label={t('collectionPreviews.createNewAria', language, {
                    label: preview.label,
                  })}
                  className="collection-previews__card-create"
                  href={preview.createHref}
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line x1="12" x2="12" y1="5" y2="19" />
                    <line x1="5" x2="19" y1="12" y2="12" />
                  </svg>
                </a>
              )}
            </div>

            {preview.docs.length === 0 ? (
              <p className="collection-previews__empty">{t('collectionPreviews.noItems', language)}</p>
            ) : (
              <ul className="collection-previews__list">
                {preview.docs.map((doc) => (
                  <li className="collection-previews__item" key={String(doc.id)}>
                    <a
                      className="collection-previews__item-link"
                      href={`${preview.href}/${doc.id}`}
                      title={doc.title}
                    >
                      {doc.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <a className="collection-previews__view-all" href={preview.href}>
              {t('collectionPreviews.viewAll', language)}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
