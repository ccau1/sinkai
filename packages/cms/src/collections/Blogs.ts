import type { CollectionConfig } from 'payload'
import { generateShortId } from '../util/shortId'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'titleEn',
    defaultColumns: ['titleEn', 'slugNameEn', 'shortId', 'date', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'English',
          fields: [
            {
              name: 'slugNameEn',
              type: 'text',
              label: 'Slug',
              required: true,
              admin: {
                description: 'URL-safe English slug, e.g. "mountain-area-reality"',
              },
            },
            {
              name: 'titleEn',
              type: 'text',
              label: 'Title',
              required: true,
            },
            {
              name: 'excerptEn',
              type: 'textarea',
              label: 'Excerpt',
              required: true,
            },
            {
              name: 'contentEn',
              type: 'richText',
              label: 'Content',
            },
            {
              name: 'legacyContentEn',
              type: 'textarea',
              label: 'Legacy Content',
            },
          ],
        },
        {
          label: '简体中文',
          fields: [
            {
              name: 'slugNameZhCN',
              type: 'text',
              label: 'Slug',
              required: true,
              admin: {
                description: '简体中文 URL 标识，例如「山区现实」',
              },
            },
            {
              name: 'titleZhCN',
              type: 'text',
              label: '标题',
              required: true,
            },
            {
              name: 'excerptZhCN',
              type: 'textarea',
              label: '摘要',
              required: true,
            },
            {
              name: 'contentZhCN',
              type: 'richText',
              label: '内容',
            },
            {
              name: 'legacyContentZhCN',
              type: 'textarea',
              label: '旧版内容',
            },
          ],
        },
        {
          label: '繁體中文',
          fields: [
            {
              name: 'slugNameZhTW',
              type: 'text',
              label: 'Slug',
              required: true,
              admin: {
                description: '繁體中文 URL 標識，例如「山區現實」',
              },
            },
            {
              name: 'titleZhTW',
              type: 'text',
              label: '標題',
              required: true,
            },
            {
              name: 'excerptZhTW',
              type: 'textarea',
              label: '摘要',
              required: true,
            },
            {
              name: 'contentZhTW',
              type: 'richText',
              label: '內容',
            },
            {
              name: 'legacyContentZhTW',
              type: 'textarea',
              label: '舊版內容',
            },
          ],
        },
      ],
    },
    {
      name: 'shortId',
      type: 'text',
      admin: {
        description: 'Short URL token shared across all locales. Auto-generated from the English slug if left blank.',
      },
    },
    {
      name: 'coverImage',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'installations',
      type: 'relationship',
      relationTo: 'installations',
      hasMany: true,
      admin: {
        description: 'Installations mentioned in this blog post',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (!data) return data

        const slugFields = ['slugNameEn', 'slugNameZhCN', 'slugNameZhTW'] as const
        for (const field of slugFields) {
          const raw = (data[field] as string) || ''
          data[field] = raw.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fa5\-]/g, '')
        }

        let shortId = ((data.shortId as string) || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')

        if (!shortId && data.slugNameEn) {
          shortId = generateShortId(data.slugNameEn as string)
        }

        if (!data.slugNameEn) throw new Error('English slug is required')
        if (!data.slugNameZhCN) throw new Error('简体中文 slug is required')
        if (!data.slugNameZhTW) throw new Error('繁體中文 slug is required')
        if (!shortId) throw new Error('shortId is required')

        // Enforce uniqueness: no two blogs can share the same shortId
        const existing = await req.payload.find({
          collection: 'blogs',
          where: {
            shortId: { equals: shortId },
          },
          limit: 1,
          depth: 0,
        })
        if (existing.totalDocs > 0) {
          const first = existing.docs[0]
          if (operation === 'create' || String((first as { id?: string | number }).id) !== String(data.id)) {
            // Collision: append a random suffix and recheck would be ideal, but for now
            // generate a new random shortId so the save can succeed.
            shortId = `${shortId}-${Math.random().toString(36).slice(2, 5)}`
          }
        }

        data.shortId = shortId
        return data
      },
    ],
  },
}
