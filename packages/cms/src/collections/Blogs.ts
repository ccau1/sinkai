import type { CollectionConfig } from 'payload'
import {
  isAdmin,
  isBlogEditor,
  publishedOrAuthenticated,
} from '../util/access'
import { generateShortId } from '../util/shortId'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slugName', 'shortId', 'date', 'updatedAt'],
    description: {
      en: 'News, stories and articles about the charity\'s work and impact.',
      'zh-CN': '关于慈善机构工作与影响的新闻、故事和文章。',
      'zh-TW': '關於慈善機構工作與影響的新聞、故事和文章。',
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: isBlogEditor,
    update: isBlogEditor,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'slugName',
      type: 'text',
      label: 'Slug',
      localized: true,
      required: true,
      admin: {
        description:
          'URL-safe slug, e.g. "mountain-area-reality". Can be translated per locale.',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      localized: true,
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt',
      localized: true,
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      localized: true,
    },
    {
      name: 'legacyContent',
      type: 'textarea',
      label: 'Legacy Content',
      localized: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'shortId',
      type: 'text',
      admin: {
        description:
          'Short URL token shared across all locales. Auto-generated from the English slug if left blank.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      displayPreview: true,
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

        // Normalize localized slugs: trim, lowercase, replace spaces with dashes,
        // and remove characters that are not alphanumeric, CJK, or dashes.
        // In the admin UI the value arrives as a localized object; when a single
        // locale is targeted via the API it arrives as a string. Preserve the
        // input shape so Payload stores scalar values for API calls.
        const normalize = (value: string) =>
          String(value || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\u4e00-\u9fa5\-]/g, '')

        const isLocalizedObject =
          data.slugName && typeof data.slugName === 'object' && !Array.isArray(data.slugName)

        let normalizedDefaultSlug = ''

        if (isLocalizedObject) {
          const slugInput = data.slugName as Record<string, string>
          const normalizedSlugs: Record<string, string> = {}
          for (const [locale, raw] of Object.entries(slugInput)) {
            normalizedSlugs[locale] = normalize(raw)
          }
          data.slugName = normalizedSlugs
          normalizedDefaultSlug = normalizedSlugs.en || Object.values(normalizedSlugs)[0] || ''
        } else {
          normalizedDefaultSlug = normalize(String(data.slugName || ''))
          data.slugName = normalizedDefaultSlug
        }

        let shortId = ((data.shortId as string) || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')

        if (!shortId && normalizedDefaultSlug) {
          shortId = generateShortId(normalizedDefaultSlug)
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
