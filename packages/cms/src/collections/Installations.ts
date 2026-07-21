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
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'location', 'completionDate', 'updatedAt'],
    description: {
      en: 'Infrastructure and equipment built or donated by the charity, such as schools, bridges, roads and water tanks. This collection shows the physical contributions made to communities.',
      'zh-CN': '慈善机构建造或捐赠的基础设施与设备，例如学校、桥梁、道路和水塔。此集合展示了为社区提供的实物贡献。',
      'zh-TW': '慈善機構建造或捐贈的基礎設施與設備，例如學校、橋樑、道路和水塔。此集合展示了為社區提供的實物貢獻。',
    },
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
      label: 'Title',
      localized: true,
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-safe identifier, e.g. "hope-primary-school-guizhou"',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'School', value: 'school' },
        { label: 'Bridge', value: 'bridge' },
        { label: 'Water Tank', value: 'water-tank' },
      ],
    },
    {
      name: 'completionDate',
      type: 'date',
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
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
