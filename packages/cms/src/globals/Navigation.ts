import type { GlobalConfig } from 'payload'
import { isContentEditor } from '../util/access'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  access: {
    read: () => true,
    update: isContentEditor,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Menu Items',
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          localized: true,
          required: true,
        },
        {
          name: 'linkType',
          type: 'radio',
          label: 'Link Type',
          defaultValue: 'page',
          options: [
            { label: 'CMS Page', value: 'page' },
            { label: 'Fixed Path', value: 'fixed' },
            { label: 'External URL', value: 'external' },
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
          label: 'Fixed Path',
          admin: {
            description: 'e.g. "/" for homepage, "/gallery"',
            condition: (data, siblingData) => siblingData?.linkType === 'fixed',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'External URL',
          admin: {
            condition: (data, siblingData) => siblingData?.linkType === 'external',
          },
        },
        {
          name: 'visible',
          type: 'checkbox',
          label: 'Visible',
          defaultValue: true,
        },
      ],
    },
  ],
}
