import type { GlobalConfig } from 'payload'
import { isContentEditor } from '../util/access'
import { revalidateWebGlobalAfterChange } from '../hooks/triggerWebRevalidate'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: '導覽',
  admin: {
    group: '設定',
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
      label: '選單項目',
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          label: '標籤',
          localized: true,
          required: true,
        },
        {
          name: 'linkType',
          type: 'radio',
          label: '連結類型',
          defaultValue: 'page',
          options: [
            { label: 'CMS 頁面', value: 'page' },
            { label: '固定路徑', value: 'fixed' },
            { label: '外部連結', value: 'external' },
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
          label: '固定路徑',
          admin: {
            description: '例如 "/" 代表首頁，"/gallery" 代表圖庫',
            condition: (data, siblingData) => siblingData?.linkType === 'fixed',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: '外部連結',
          admin: {
            condition: (data, siblingData) => siblingData?.linkType === 'external',
          },
        },
        {
          name: 'visible',
          type: 'checkbox',
          label: '可見',
          defaultValue: true,
        },
      ],
    },
  ],
}
