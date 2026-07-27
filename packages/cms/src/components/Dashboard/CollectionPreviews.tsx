import type { CollectionConfig, WidgetServerProps } from 'payload'
import { getTranslation } from '@payloadcms/translations'
import { formatAdminURL } from 'payload/shared'
import React from 'react'

import { t } from '../../uiTranslations'
import './CollectionPreviews.scss'

type CollectionDocPreview = {
  id: number | string
  title: string
}

type CollectionPreview = {
  slug: string
  label: string
  href: string
  createHref: string
  hasCreatePermission: boolean
  docs: CollectionDocPreview[]
}

function getDocTitle(doc: Record<string, unknown>, collection: CollectionConfig): string {
  const useAsTitle = collection.admin?.useAsTitle

  if (useAsTitle && typeof doc[useAsTitle] === 'string' && doc[useAsTitle]) {
    return doc[useAsTitle] as string
  }

  if (typeof doc.filename === 'string' && doc.filename) {
    return doc.filename
  }

  return String(doc.id)
}

export default async function CollectionPreviews({ req, permissions }: WidgetServerProps) {
  const { i18n, payload } = req
  const { admin: adminRoute } = payload.config.routes
  const language = i18n.language

  const collections = payload.config.collections.filter((collection) => {
    // Skip hidden/internal collections (e.g. Payload migrations, preferences, locked docs).
    if (collection.admin?.hidden) {
      return false
    }

    // Only show collections the current user is allowed to read in the admin panel.
    const collectionPerms = permissions?.collections?.[collection.slug]
    return Boolean(collectionPerms?.read)
  })

  const previews = await Promise.all(
    collections.map(async (collection): Promise<CollectionPreview> => {
      const slug = collection.slug
      const label = getTranslation(
        collection.labels?.plural ?? collection.labels?.singular ?? slug,
        i18n,
      )
      const href = formatAdminURL({ adminRoute, path: `/collections/${slug}` })
      const createHref = formatAdminURL({ adminRoute, path: `/collections/${slug}/create` })
      const hasCreatePermission = Boolean(permissions?.collections?.[slug]?.create)

      let docs: CollectionDocPreview[] = []

      try {
        const result = await payload.find({
          collection: slug,
          depth: 0,
          limit: 6,
          sort: '-updatedAt',
          req,
        })

        docs = result.docs.map((doc) => ({
          id: doc.id,
          title: getDocTitle(doc as unknown as Record<string, unknown>, collection),
        }))
      } catch {
        // If the collection cannot be read, leave the list empty.
      }

      return {
        slug,
        label,
        href,
        createHref,
        hasCreatePermission,
        docs,
      }
    }),
  )

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
                      href={formatAdminURL({
                        adminRoute,
                        path: `/collections/${preview.slug}/${doc.id}`,
                      })}
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
