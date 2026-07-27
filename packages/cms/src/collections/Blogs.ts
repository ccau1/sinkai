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
  labels: {
    singular: {
      en: 'Blog',
      'zh-CN': '博客',
      'zh-TW': '網誌',
    },
    plural: {
      en: 'Blogs',
      'zh-CN': '博客',
      'zh-TW': '網誌',
    },
  },
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
      label: {
        en: 'Slug',
        'zh-CN': 'URL 别名',
        'zh-TW': 'URL 別名',
      },
      localized: true,
      required: true,
      // Prevent duplicate posts for the same slug (seed idempotency relies on
      // this natural key). Uniqueness is enforced per locale.
      unique: true,
      admin: {
        description: {
          en: 'URL-safe slug, e.g. "mountain-area-reality". Must be unique across all blogs. Can be translated per locale (optional).',
          'zh-CN': 'URL 安全别名，例如 "mountain-area-reality"。必须在所有博客中保持唯一。可按语系翻译（可选）。',
          'zh-TW': 'URL 安全別名，例如 "mountain-area-reality"。必須在所有網誌中保持唯一。可按語系翻譯（可選）。',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        'zh-CN': '标题',
        'zh-TW': '標題',
      },
      localized: true,
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: {
        en: 'Excerpt',
        'zh-CN': '摘要',
        'zh-TW': '摘要',
      },
      localized: true,
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: {
        en: 'Content',
        'zh-CN': '内容',
        'zh-TW': '內容',
      },
      localized: true,
    },
    {
      name: 'legacyContent',
      type: 'textarea',
      label: {
        en: 'Legacy Content',
        'zh-CN': '旧版内容',
        'zh-TW': '舊版內容',
      },
      localized: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'shortId',
      type: 'text',
      label: {
        en: 'Short Id',
        'zh-CN': '短 ID',
        'zh-TW': '短 ID',
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: {
          en: 'Short URL token shared across all locales. Auto-generated from the slug; managed by the system, not editable.',
          'zh-CN': '跨所有语系共享的短 URL 标识。根据别名自动生成；由系统管理，不可编辑。',
          'zh-TW': '跨所有語系共享的短 URL 識別碼。根據別名自動生成；由系統管理，不可編輯。',
        },
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Cover Image',
        'zh-CN': '封面图片',
        'zh-TW': '封面圖片',
      },
      required: true,
      displayPreview: true,
    },
    {
      name: 'date',
      type: 'date',
      label: {
        en: 'Date',
        'zh-CN': '日期',
        'zh-TW': '日期',
      },
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: {
          en: 'Display date shown on the site. Auto-set to the publish time when a post is published; edit to backdate.',
          'zh-CN': '网站上显示的日期。发布文章时自动设为发布时间；可手动修改以回溯日期。',
          'zh-TW': '網站上顯示的日期。發布文章時自動設為發布時間；可手動修改以回溯日期。',
        },
      },
    },
    {
      name: 'installations',
      type: 'relationship',
      relationTo: 'installations',
      hasMany: true,
      label: {
        en: 'Installations',
        'zh-CN': '援助项目',
        'zh-TW': '援助項目',
      },
      admin: {
        description: {
          en: 'Installations mentioned in this blog post',
          'zh-CN': '此博客文章中提及的援助项目',
          'zh-TW': '此網誌文章中提及的援助項目',
        },
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      label: {
        en: 'Published',
        'zh-CN': '已发布',
        'zh-TW': '已發布',
      },
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
