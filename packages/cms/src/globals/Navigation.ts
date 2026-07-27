import type { GlobalConfig } from 'payload'
import { isContentEditor } from '../util/access'
import { revalidateWebGlobalAfterChange } from '../hooks/triggerWebRevalidate'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: {
    en: 'Navigation',
    'zh-CN': '导航',
    'zh-TW': '導覽',
  },
  admin: {
    group: {
      en: 'Settings',
      'zh-CN': '设置',
      'zh-TW': '設定',
    },
  },
  access: {
    read: () => true,
    update: isContentEditor,
  },
  hooks: {
    afterChange: [revalidateWebGlobalAfterChange],
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: {
        en: 'Menu Items',
        'zh-CN': '菜单项',
        'zh-TW': '選單項目',
      },
      minRows: 1,
      fields: [
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
          name: 'linkType',
          type: 'radio',
          label: {
            en: 'Link Type',
            'zh-CN': '链接类型',
            'zh-TW': '連結類型',
          },
          defaultValue: 'page',
          options: [
            { label: { en: 'CMS Page', 'zh-CN': 'CMS 页面', 'zh-TW': 'CMS 頁面' }, value: 'page' },
            { label: { en: 'Fixed Path', 'zh-CN': '固定路径', 'zh-TW': '固定路徑' }, value: 'fixed' },
            { label: { en: 'External URL', 'zh-CN': '外部链接', 'zh-TW': '外部連結' }, value: 'external' },
          ],
          required: true,
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            condition: (data, siblingData) => siblingData?.linkType === 'page',
          },
        },
        {
          name: 'path',
          type: 'text',
          label: {
            en: 'Fixed Path',
            'zh-CN': '固定路径',
            'zh-TW': '固定路徑',
          },
          admin: {
            description: {
              en: 'e.g. "/" for homepage, "/gallery"',
              'zh-CN': '例如 "/" 代表首页，"/gallery" 代表图库',
              'zh-TW': '例如 "/" 代表首頁，"/gallery" 代表圖庫',
            },
            condition: (data, siblingData) => siblingData?.linkType === 'fixed',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: {
            en: 'External URL',
            'zh-CN': '外部链接',
            'zh-TW': '外部連結',
          },
          admin: {
            condition: (data, siblingData) => siblingData?.linkType === 'external',
          },
        },
        {
          name: 'visible',
          type: 'checkbox',
          label: {
            en: 'Visible',
            'zh-CN': '可见',
            'zh-TW': '可見',
          },
          defaultValue: true,
        },
      ],
    },
  ],
}
