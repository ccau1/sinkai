import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor, publishedOrAuthenticated } from '../util/access'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

export const Testimonies: CollectionConfig = {
  slug: 'testimonies',
  labels: {
    singular: '見證',
    plural: '見證',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'highlighted', 'published', 'updatedAt'],
    description: '受益者、義工、捐贈者與支持者的故事和見證。',
  },
  access: {
    read: publishedOrAuthenticated,
    create: isContentEditor,
    update: isContentEditor,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [revalidateWebAfterChange],
    afterDelete: [revalidateWebAfterDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '名稱',
      localized: true,
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      label: '角色 / 頭銜',
      localized: true,
      admin: {
        description: '例如「演員」、「歌手」、「受益者」、「義工」。',
      },
    },
    {
      name: 'highlighted',
      type: 'checkbox',
      label: '重點推薦',
      defaultValue: false,
      admin: {
        description: '標記為重點推薦見證（例如名人或貴賓）。',
        position: 'sidebar',
      },
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      label: '照片',
      hasMany: true,
      required: true,
      displayPreview: true,
    },
    {
      name: 'synopsis',
      type: 'textarea',
      label: '簡介',
      localized: true,
      required: true,
      admin: {
        description: '在列表中顯示的短句或摘要。',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: '完整內容',
      localized: true,
      admin: {
        description: '完整的見證或故事。',
      },
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
