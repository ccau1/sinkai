import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor, publishedOrAuthenticated } from '../util/access'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: '頁面',
    plural: '頁面',
  },
  admin: {
    group: '網站',
    hidden: true,
    useAsTitle: 'title',
    defaultColumns: ['slug', 'title', 'updatedAt'],
    description: '靜態內容頁面，例如關於我們、聯絡我們與捐助頁面。',
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
      label: 'URL 別名',
      required: true,
      unique: true,
      admin: {
        description: 'URL 安全識別碼，例如 "about"、"contact"、"donate"。',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: '標題',
      localized: true,
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: '摘要',
      localized: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: '內容',
      localized: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: '封面圖片',
      relationTo: 'media',
      displayPreview: true,
    },
    {
      name: 'published',
      type: 'checkbox',
      label: '已發布',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
