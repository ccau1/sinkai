import type { CollectionConfig } from 'payload'
import { isAdmin } from '../util/access'

export const InstallationTypes: CollectionConfig = {
  slug: 'installation-types',
  labels: {
    singular: {
      en: 'Installation Type',
      'zh-CN': '援助类型',
      'zh-TW': '援助類型',
    },
    plural: {
      en: 'Installation Types',
      'zh-CN': '援助类型',
      'zh-TW': '援助類型',
    },
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
      label: {
        en: 'Key',
        'zh-CN': '键值',
        'zh-TW': '鍵值',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'Stable identifier used by code and seeds, e.g. "school".',
          'zh-CN': '代码与种子使用的稳定标识符，例如 "school"。',
          'zh-TW': '程式碼與種子使用的穩定識別碼，例如 "school"。',
        },
      },
    },
    {
      name: 'label',
      type: 'text',
      label: {
        en: 'Label',
        'zh-CN': '标签',
        'zh-TW': '標籤',
      },
      localized: true,
      required: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: {
        en: 'Sort Order',
        'zh-CN': '排序',
        'zh-TW': '排序',
      },
      defaultValue: 0,
      admin: {
        description: {
          en: 'Controls the order of groups on the installations page (lower first).',
          'zh-CN': '控制援建项目页面上的分组顺序（数字越小越靠前）。',
          'zh-TW': '控制援建項目頁面上的分組順序（數字越小越靠前）。',
        },
        position: 'sidebar',
      },
    },
  ],
}
