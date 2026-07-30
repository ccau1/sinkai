import type { CollectionConfig, Endpoint, PayloadRequest } from 'payload'
import { getTranslation } from '@payloadcms/translations'
import { formatAdminURL } from 'payload/shared'

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

async function canCreateCollection(collection: CollectionConfig, req: PayloadRequest): Promise<boolean> {
  const access = collection.access?.create
  if (typeof access !== 'function') {
    return true
  }
  try {
    const result = await access({ req })
    return Boolean(result)
  } catch {
    return false
  }
}

export const collectionPreviewsEndpoint: Endpoint = {
  path: '/dashboard/collection-previews',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { i18n, payload } = req
    const { admin: adminRoute } = payload.config.routes

    const collections = payload.config.collections.filter((collection) => !collection.admin?.hidden)

    const previews = await Promise.all(
      collections.map(async (collection): Promise<CollectionPreview> => {
        const slug = collection.slug
        const label = getTranslation(
          (collection.labels?.plural ?? collection.labels?.singular ?? slug) as string,
          i18n,
        )
        const href = formatAdminURL({ adminRoute, path: `/collections/${slug}` })
        const createHref = formatAdminURL({ adminRoute, path: `/collections/${slug}/create` })

        let docs: CollectionDocPreview[] = []
        let hasCreatePermission = false

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

          hasCreatePermission = await canCreateCollection(collection, req)
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

    return Response.json({ previews })
  },
}
