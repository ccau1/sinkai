import React from 'react'
import type { Payload } from 'payload'

interface MediaUsageProps {
  id?: number | string
  payload: Payload
}

interface Reference {
  collection: string
  id: number | string
  label: string
  href: string
}

function findUploadIds(node: unknown, ids: Set<number | string>) {
  if (!node || typeof node !== 'object') return
  const n = node as Record<string, unknown>

  if (n.type === 'upload' && n.value && typeof n.value === 'object') {
    const value = n.value as Record<string, unknown>
    if (value.id !== undefined) {
      ids.add(value.id as number | string)
    }
  }

  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      findUploadIds(child, ids)
    }
  }
}

async function collectReferences(
  payload: Payload,
  mediaId?: number | string,
): Promise<Reference[]> {
  if (!mediaId) return []

  const references: Reference[] = []

  // Blogs: coverImage
  const blogs = await payload.find({
    collection: 'blogs',
    depth: 0,
    limit: 1000,
    where: {
      coverImage: { equals: mediaId },
    },
  })
  for (const doc of blogs.docs) {
    references.push({
      collection: 'blogs',
      id: doc.id,
      label: (doc.title as string) || `Blog ${doc.id}`,
      href: `/admin/collections/blogs/${doc.id}`,
    })
  }

  // Installations: photos (hasMany upload)
  const installations = await payload.find({
    collection: 'installations',
    depth: 0,
    limit: 1000,
    where: {
      photos: { contains: mediaId },
    },
  })
  for (const doc of installations.docs) {
    references.push({
      collection: 'installations',
      id: doc.id,
      label: (doc.title as string) || `Installation ${doc.id}`,
      href: `/admin/collections/installations/${doc.id}`,
    })
  }

  // Testimonies: photos (hasMany upload)
  const testimonies = await payload.find({
    collection: 'testimonies',
    depth: 0,
    limit: 1000,
    where: {
      photos: { contains: mediaId },
    },
  })
  for (const doc of testimonies.docs) {
    references.push({
      collection: 'testimonies',
      id: doc.id,
      label: (doc.name as string) || `Testimony ${doc.id}`,
      href: `/admin/collections/testimonies/${doc.id}`,
    })
  }

  // Pages: coverImage
  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1000,
    where: {
      coverImage: { equals: mediaId },
    },
  })
  for (const doc of pages.docs) {
    references.push({
      collection: 'pages',
      id: doc.id,
      label: (doc.title as string) || `Page ${doc.id}`,
      href: `/admin/collections/pages/${doc.id}`,
    })
  }

  // Scan rich text content in blogs and pages for inline uploads.
  const allBlogs = await payload.find({ collection: 'blogs', depth: 0, limit: 1000 })
  for (const doc of allBlogs.docs) {
    const ids = new Set<number | string>()
    findUploadIds(doc.content, ids)
    if (ids.has(mediaId)) {
      references.push({
        collection: 'blogs',
        id: doc.id,
        label: `${(doc.title as string) || `Blog ${doc.id}`} (inline content)`,
        href: `/admin/collections/blogs/${doc.id}`,
      })
    }
  }

  const allPages = await payload.find({ collection: 'pages', depth: 0, limit: 1000 })
  for (const doc of allPages.docs) {
    const ids = new Set<number | string>()
    findUploadIds(doc.content, ids)
    if (ids.has(mediaId)) {
      references.push({
        collection: 'pages',
        id: doc.id,
        label: `${(doc.title as string) || `Page ${doc.id}`} (inline content)`,
        href: `/admin/collections/pages/${doc.id}`,
      })
    }
  }

  return references
}

export default async function MediaUsage({ id, payload }: MediaUsageProps) {
  const references = await collectReferences(payload, id)

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
        Used in {references.length} document{references.length === 1 ? '' : 's'}
      </h3>

      {references.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--theme-elevation-600, #666)' }}>
          This media is not referenced by any document.
        </p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {references.map((ref) => (
            <li key={`${ref.collection}-${ref.id}`} style={{ marginBottom: '4px' }}>
              <a
                href={ref.href}
                style={{
                  color: 'var(--theme-text, #000)',
                  textDecoration: 'underline',
                }}
              >
                {ref.collection}: {ref.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
