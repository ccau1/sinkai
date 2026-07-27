import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor, publishedOrAuthenticated } from '../util/access'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: {
      en: 'Page',
      'zh-CN': '页面',
      'zh-TW': '頁面',
    },
    plural: {
      en: 'Pages',
      'zh-CN': '页面',
      'zh-TW': '頁面',
    },
  },
  admin: {
    group: {
      en: 'Website',
      'zh-CN': '网站',
      'zh-TW': '網站',
    },
    useAsTitle: 'title',
    defaultColumns: ['slug', 'title', 'updatedAt'],
    description: {
      en: 'Static content pages such as About, Contact and Donate.',
      'zh-CN': '静态内容页面，例如关于我们、联络我们与捐助页面。',
      'zh-TW': '靜態內容頁面，例如關於我們、聯絡我們與捐助頁面。',
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: isContentEditor,
    update: isContentEditor,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [revalidateWebAfterChange],
    afterDelete: [revalidateWebAfterDelete],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      label: {
        en: 'Slug',
        'zh-CN': 'URL 别名',
        'zh-TW': 'URL 別名',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'URL-safe identifier, e.g. "about", "contact", "donate".',
          'zh-CN': 'URL 安全标识符，例如 "about"、"contact"、"donate"。',
          'zh-TW': 'URL 安全識別碼，例如 "about"、"contact"、"donate"。',
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
      name: 'coverImage',
      type: 'upload',
      label: {
        en: 'Cover Image',
        'zh-CN': '封面图片',
        'zh-TW': '封面圖片',
      },
      relationTo: 'media',
      displayPreview: true,
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
}
