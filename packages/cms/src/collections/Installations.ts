import type { CollectionConfig } from 'payload'

export const Installations: CollectionConfig = {
  slug: 'installations',
  admin: {
    useAsTitle: 'titleEn',
    defaultColumns: ['titleEn', 'type', 'locationEn', 'completionDate', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'English',
          fields: [
            {
              name: 'titleEn',
              type: 'text',
              label: 'Title',
              required: true,
            },
            {
              name: 'locationEn',
              type: 'text',
              label: 'Location',
              required: true,
            },
            {
              name: 'descriptionEn',
              type: 'richText',
              label: 'Description',
            },
          ],
        },
        {
          label: '简体中文',
          fields: [
            {
              name: 'titleZhCN',
              type: 'text',
              label: '标题',
              required: true,
            },
            {
              name: 'locationZhCN',
              type: 'text',
              label: '地点',
              required: true,
            },
            {
              name: 'descriptionZhCN',
              type: 'richText',
              label: '描述',
            },
          ],
        },
        {
          label: '繁體中文',
          fields: [
            {
              name: 'titleZhTW',
              type: 'text',
              label: '標題',
              required: true,
            },
            {
              name: 'locationZhTW',
              type: 'text',
              label: '地點',
              required: true,
            },
            {
              name: 'descriptionZhTW',
              type: 'richText',
              label: '描述',
            },
          ],
        },
      ],
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
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
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
