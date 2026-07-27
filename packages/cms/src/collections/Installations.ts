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
    singular: {
      en: 'Installation',
      'zh-CN': '援助项目',
      'zh-TW': '援助項目',
    },
    plural: {
      en: 'Installations',
      'zh-CN': '援助项目',
      'zh-TW': '援助項目',
    },
  },
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
      label: {
        en: 'Title',
        'zh-CN': '标题',
        'zh-TW': '標題',
      },
      localized: true,
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      label: {
        en: 'Location',
        'zh-CN': '地点',
        'zh-TW': '地點',
      },
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: {
        en: 'Description',
        'zh-CN': '描述',
        'zh-TW': '描述',
      },
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'URL-safe identifier, e.g. "hope-primary-school-guizhou"',
          'zh-CN': 'URL 安全标识符，例如 "hope-primary-school-guizhou"',
          'zh-TW': 'URL 安全識別碼，例如 "hope-primary-school-guizhou"',
        },
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
      label: {
        en: 'Completion Date',
        'zh-CN': '竣工日期',
        'zh-TW': '竣工日期',
      },
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
      label: {
        en: 'Photos',
        'zh-CN': '照片',
        'zh-TW': '照片',
      },
      hasMany: true,
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
