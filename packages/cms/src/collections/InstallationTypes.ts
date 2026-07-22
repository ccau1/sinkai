import type { CollectionConfig } from 'payload'
import { isAdmin } from '../util/access'

export const InstallationTypes: CollectionConfig = {
  slug: 'installation-types',
  labels: {
    singular: 'Installation Type',
    plural: 'Installation Types',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'key', 'sortOrder', 'updatedAt'],
    description: {
      en: 'Types of installations (e.g. schools, bridges, water tanks). Types drive the groups shown on the public installations page.',
      'zh-CN': '项目设施类型（例如学校、桥梁、水窖）。类型决定网站援建项目页面的分组。',
      'zh-TW': '項目設施類型（例如學校、橋樑、水窖）。類型決定網站援建項目頁面的分組。',
    },
  },
  access: {
    // Public read: the website fetches types to group and label installations.
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      label: 'Key',
      required: true,
      unique: true,
      admin: {
        description: 'Stable identifier used by code and seeds, e.g. "school".',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: 'Label',
      localized: true,
      required: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 0,
      admin: {
        description: 'Controls the order of groups on the installations page (lower first).',
        position: 'sidebar',
      },
    },
  ],
}
