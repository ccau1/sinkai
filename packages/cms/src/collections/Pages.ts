import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor, publishedOrAuthenticated } from '../util/access'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
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
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        description: 'URL-safe identifier, e.g. "about", "contact", "donate".',
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
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      localized: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      displayPreview: true,
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
}
