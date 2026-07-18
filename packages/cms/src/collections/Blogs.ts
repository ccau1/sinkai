import type { CollectionConfig, Field } from 'payload'
import {
  isAdmin,
  isBlogEditor,
  publishedOrAuthenticated,
} from '../util/access'
import { createLocaleTabs, type LocaleSuffix } from '../util/localeTabs'
import { generateShortId } from '../util/shortId'

function buildBlogLocaleFields(suffix: LocaleSuffix, label: string): Field[] {
  const isEnglish = suffix === 'En'

  return [
    {
      name: `slugName${suffix}`,
      type: 'text',
      label: 'Slug',
      required: true,
      admin: {
        description: isEnglish
          ? 'URL-safe English slug, e.g. "mountain-area-reality"'
          : label === '简体中文'
            ? '简体中文 URL 标识，例如「山区现实」'
            : '繁體中文 URL 標識，例如「山區現實」',
      },
    },
    {
      name: `title${suffix}`,
      type: 'text',
      label: isEnglish ? 'Title' : label === '简体中文' ? '标题' : '標題',
      required: true,
    },
    {
      name: `excerpt${suffix}`,
      type: 'textarea',
      label: isEnglish ? 'Excerpt' : '摘要',
      required: true,
    },
    {
      name: `content${suffix}`,
      type: 'richText',
      label: isEnglish ? 'Content' : label === '简体中文' ? '内容' : '內容',
    },
    {
      name: `legacyContent${suffix}`,
      type: 'textarea',
      label: isEnglish ? 'Legacy Content' : label === '简体中文' ? '旧版内容' : '舊版內容',
      admin: {
        hidden: true,
      },
    },
  ]
}

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'titleEn',
    defaultColumns: ['titleEn', 'slugNameEn', 'shortId', 'date', 'updatedAt'],
  },
  access: {
    read: publishedOrAuthenticated,
    create: isBlogEditor,
    update: isBlogEditor,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    createLocaleTabs(buildBlogLocaleFields, {
      copyFromEnglish: ['slugName', 'title', 'excerpt', 'content', 'legacyContent'],
    }),
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

        // Only enforce uniqueness when we actually have a shortId.
        // Missing required fields are left to Payload's built-in validation so the
        // admin UI can show per-field error messages instead of a generic 500.
        if (shortId) {
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
              // Collision: append a random suffix so the save can succeed.
              shortId = `${shortId}-${Math.random().toString(36).slice(2, 5)}`
            }
          }
        }

        data.shortId = shortId
        return data
      },
    ],
  },
}
