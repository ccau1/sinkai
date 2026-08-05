import { MinimalTemplate } from '@payloadcms/next/templates'
import Link from 'next/link'
import React from 'react'
import type { AdminViewServerProps } from 'payload'

import { docs } from './manifest'
import { parseMarkdown } from './parseMarkdown'
import './AdminDocs.scss'

export default function AdminDocsView(props: AdminViewServerProps) {
  const { searchParams } = props
  const currentSlug = (searchParams?.doc as string | undefined) || docs[0]?.slug
  const currentDoc = docs.find((doc) => doc.slug === currentSlug) || docs[0]

  return (
    <MinimalTemplate className="admin-docs-template" width="wide">
      <div className="admin-docs">
        <header className="admin-docs__header">
          <div className="admin-docs__brand">
            <span className="admin-docs__site-title">善啓慈善基金會</span>
            <span className="admin-docs__separator">/</span>
            <span className="admin-docs__subtitle">管理員說明文件</span>
          </div>
          <Link className="admin-docs__back" href="/admin">
            返回後台
          </Link>
        </header>

        <div className="admin-docs__layout">
          <nav className="admin-docs__sidebar" aria-label="說明文件選單">
            <ul className="admin-docs__nav">
              {docs.map((doc) => {
                const isActive = doc.slug === currentDoc?.slug
                return (
                  <li key={doc.slug}>
                    <a
                      className={[
                        'admin-docs__nav-link',
                        isActive && 'admin-docs__nav-link--active',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      href={`/admin/docs?doc=${doc.slug}`}
                    >
                      {doc.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <main className="admin-docs__content">
            {currentDoc ? (
              <article
                className="admin-docs__article"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(currentDoc.content) }}
              />
            ) : (
              <p>目前沒有說明文件。</p>
            )}
          </main>
        </div>
      </div>
    </MinimalTemplate>
  )
}
