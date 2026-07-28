import type { CollectionConfig } from 'payload'
import {
  isAdmin,
  isInstallationEditor,
  publishedOrAuthenticated,
} from '../util/access'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

export const Installations: CollectionConfig = {
  slug: 'installations',
  labels: {
    singular: '援助項目',
    plural: '援助項目',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'location', 'completionDate', 'updatedAt'],
    description: '慈善機構建造或捐贈的基礎設施與設備，例如學校、橋樑、道路和水塔。此集合展示了為社區提供的實物貢獻。',
  },
  access: {
    read: publishedOrAuthenticated,
    create: isInstallationEditor,
    update: isInstallationEditor,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [revalidateWebAfterChange],
    afterDelete: [revalidateWebAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '標題',
      localized: true,
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      label: '地點',
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: '描述',
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL 安全識別碼，例如 "hope-primary-school-guizhou"',
      },
    },
    {
      name: 'type',
      type: 'relationship',
      relationTo: 'installation-types',
      required: true,
    },
    {
      name: 'completionDateNote',
      type: 'ui',
      admin: {
        components: {
          Field: './components/InstallationCompletionNote#default',
        },
      },
    },
    {
      name: 'completionDate',
      type: 'date',
      label: '竣工日期',
      admin: {
        components: {
          Cell: './components/InstallationCompletionCell#default',
        },
      },
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      label: '照片',
      hasMany: true,
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
