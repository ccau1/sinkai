import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'
import {
  isAdmin,
  isBlogEditor,
  publishedOrAuthenticated,
} from '../util/access'
import { generateShortId } from '../util/shortId'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

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
      // Prevent duplicate posts for the same slug (seed idempotency relies on
      // this natural key). Uniqueness is enforced per locale.
      unique: true,
      admin: {
        description:
          'URL-safe slug, e.g. "mountain-area-reality". Must be unique across all blogs. Can be translated per locale (optional).',
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
        readOnly: true,
        position: 'sidebar',
        description:
          'Short URL token shared across all locales. Auto-generated from the slug; managed by the system, not editable.',
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
      defaultValue: () => new Date().toISOString(),
      admin: {
        description:
          'Display date shown on the site. Auto-set to the publish time when a post is published; edit to backdate.',
      },
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
    afterChange: [revalidateWebAfterChange],
    afterDelete: [revalidateWebAfterDelete],
    beforeChange: [
      ({ data, originalDoc }) => {
        // Stamp the display date when a post transitions to published, so a
        // draft published days later shows the publish date, not the date it
        // was first drafted. Editors can still backdate afterwards.
        if (data?.published === true && originalDoc?.published !== true) {
          data.date = new Date().toISOString()
        }
        return data
      },
    ],
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
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

        // Keep shortId stable: only generate or normalize it when the value is
        // explicitly supplied. On updates, leaving the field untouched preserves
        // the existing shortId instead of re-normalizing it (which previously
        // stripped collision suffixes and caused seed/idempotency issues).
        let shortId: string | undefined

        if (typeof data.shortId === 'string') {
          shortId = data.shortId.trim().toLowerCase()
        }

        if (!shortId && operation === 'create' && normalizedDefaultSlug) {
          shortId = generateShortId(normalizedDefaultSlug)
        }

        const currentId = originalDoc?.id

        // Only enforce uniqueness when we actually have a shortId.
        // Missing required fields are left to Payload's built-in validation so the
        // admin UI can show per-field error messages instead of a generic 500.
        if (shortId) {
          const shortIdUnchanged =
            operation === 'update' &&
            typeof originalDoc?.shortId === 'string' &&
            originalDoc.shortId.toLowerCase().trim() === shortId

          // Only check uniqueness when the shortId has actually changed or we
          // are creating a new doc. This stops the old bug where every save
          // appended another collision suffix and the shortId grew to hundreds
          // of characters.
          if (!shortIdUnchanged) {
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
              if (operation === 'create' || String((first as { id?: string | number }).id) !== String(currentId)) {
                // Collision: append a short random suffix so the save can succeed.
                shortId = `${shortId}-${Math.random().toString(36).slice(2, 5)}`
              }
            }
          }
          data.shortId = shortId
        }

        // App-level slug uniqueness check across ALL locales: a slug value
        // belongs to one blog post — another post must not reuse it in any
        // locale (localizing a post's own slug is fine). The DB unique index
        // is only a within-locale backstop; this enforces the real rule and
        // gives a clear field error instead of a generic toast.
        const slugChecks: [string, string][] = isLocalizedObject
          ? Object.entries(data.slugName as Record<string, string>)
          : [[req.locale || 'en', normalizedDefaultSlug]]

        for (const [slugLocale, slug] of slugChecks) {
          if (!slug) continue
          const duplicate = await req.payload.find({
            collection: 'blogs',
            where: {
              or: [
                { 'slugName.en': { equals: slug } },
                { 'slugName.zh-CN': { equals: slug } },
                { 'slugName.zh-TW': { equals: slug } },
              ],
              ...(currentId ? { id: { not_equals: currentId } } : {}),
            },
            limit: 1,
            depth: 0,
          })
          if (duplicate.totalDocs > 0) {
            throw new ValidationError({
              collection: 'blogs',
              errors: [
                {
                  message: `Slug "${slug}" (${slugLocale}) is already used by another blog post. Slugs must be unique across all blogs.`,
                  path: 'slugName',
                },
              ],
              req,
            })
          }
        }

        return data
      },
    ],
  },
}
