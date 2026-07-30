import type { Endpoint, PayloadRequest } from 'payload'

interface Reference {
  collection: string
  id: number | string
  label: string
  href: string
  isInline?: boolean
}

const getSearchParams = (req: PayloadRequest): URLSearchParams => {
  if (req.searchParams && typeof (req.searchParams as URLSearchParams).get === 'function') {
    return req.searchParams as URLSearchParams
  }
  const url = typeof req.url === 'string' ? req.url : '/'
  return new URL(url, 'http://localhost').searchParams
}

function findUploadIds(node: unknown, ids: Set<string>) {
  if (!node || typeof node !== 'object') return
  const n = node as Record<string, unknown>

  if (n.type === 'upload' && n.value && typeof n.value === 'object') {
    const value = n.value as Record<string, unknown>
    if (value.id !== undefined) {
      ids.add(String(value.id))
    }
  }

  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      findUploadIds(child, ids)
    }
  }
}

async function verifyMediaAccess(
  payload: PayloadRequest['payload'],
  mediaId: string,
): Promise<boolean> {
  try {
    await payload.findByID({
      collection: 'media',
      id: mediaId,
      depth: 0,
      overrideAccess: false,
    })
    return true
  } catch {
    return false
  }
}

async function collectDirectReferences(
  payload: PayloadRequest['payload'],
  mediaId: string,
): Promise<Reference[]> {
  const references: Reference[] = []

  const [blogs, installations, testimonies, pages] = await Promise.all([
    payload.find({
      collection: 'blogs',
      depth: 0,
      limit: 1000,
      select: { title: true },
      where: { coverImage: { equals: mediaId } },
    }),
    payload.find({
      collection: 'installations',
      depth: 0,
      limit: 1000,
      select: { title: true },
      where: { photos: { contains: mediaId } },
    }),
    payload.find({
      collection: 'testimonies',
      depth: 0,
      limit: 1000,
      select: { name: true },
      where: { photos: { contains: mediaId } },
    }),
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1000,
      select: { title: true },
      where: { coverImage: { equals: mediaId } },
    }),
  ])

  for (const doc of blogs.docs) {
    references.push({
      collection: 'blogs',
      id: doc.id,
      label: (doc.title as string) || '',
      href: `/admin/collections/blogs/${doc.id}`,
    })
  }

  for (const doc of installations.docs) {
    references.push({
      collection: 'installations',
      id: doc.id,
      label: (doc.title as string) || '',
      href: `/admin/collections/installations/${doc.id}`,
    })
  }

  for (const doc of testimonies.docs) {
    references.push({
      collection: 'testimonies',
      id: doc.id,
      label: (doc.name as string) || '',
      href: `/admin/collections/testimonies/${doc.id}`,
    })
  }

  for (const doc of pages.docs) {
    references.push({
      collection: 'pages',
      id: doc.id,
      label: (doc.title as string) || '',
      href: `/admin/collections/pages/${doc.id}`,
    })
  }

  return references
}

async function collectInlineReferences(
  payload: PayloadRequest['payload'],
  mediaId: string,
): Promise<Reference[]> {
  const references: Reference[] = []

  const [allBlogs, allPages] = await Promise.all([
    payload.find({
      collection: 'blogs',
      depth: 0,
      limit: 1000,
      select: { title: true, content: true },
    }),
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1000,
      select: { title: true, content: true },
    }),
  ])

  for (const doc of allBlogs.docs) {
    const ids = new Set<string>()
    findUploadIds(doc.content, ids)
    if (ids.has(String(mediaId))) {
      references.push({
        collection: 'blogs',
        id: doc.id,
        label: (doc.title as string) || '',
        href: `/admin/collections/blogs/${doc.id}`,
        isInline: true,
      })
    }
  }

  for (const doc of allPages.docs) {
    const ids = new Set<string>()
    findUploadIds(doc.content, ids)
    if (ids.has(String(mediaId))) {
      references.push({
        collection: 'pages',
        id: doc.id,
        label: (doc.title as string) || '',
        href: `/admin/collections/pages/${doc.id}`,
        isInline: true,
      })
    }
  }

  return references
}

async function handleUsageRequest(
  req: PayloadRequest,
  collector: (payload: PayloadRequest['payload'], mediaId: string) => Promise<Reference[]>,
): Promise<Response> {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = getSearchParams(req).get('id')
  if (!id) {
    return Response.json({ references: [] })
  }

  const hasAccess = await verifyMediaAccess(req.payload, id)
  if (!hasAccess) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const references = await collector(req.payload, id)
  return Response.json({ references })
}

export const mediaUsageDirectEndpoint: Endpoint = {
  path: '/media-usage/direct',
  method: 'get',
  handler: async (req) => handleUsageRequest(req, collectDirectReferences),
}

export const mediaUsageInlineEndpoint: Endpoint = {
  path: '/media-usage/inline',
  method: 'get',
  handler: async (req) => handleUsageRequest(req, collectInlineReferences),
}
