import type { CollectionConfig, Field } from 'payload'
import {
  isAdmin,
  isInstallationEditor,
  publishedOrAuthenticated,
} from '../util/access'
import { createLocaleTabs, type LocaleSuffix } from '../util/localeTabs'

function buildInstallationLocaleFields(suffix: LocaleSuffix, label: string): Field[] {
  const isEnglish = suffix === 'En'

  return [
    {
      name: `title${suffix}`,
      type: 'text',
      label: isEnglish ? 'Title' : label === '简体中文' ? '标题' : '標題',
      required: true,
    },
    {
      name: `location${suffix}`,
      type: 'text',
      label: isEnglish ? 'Location' : label === '简体中文' ? '地点' : '地點',
      required: true,
    },
    {
      name: `description${suffix}`,
      type: 'richText',
      label: isEnglish ? 'Description' : '描述',
    },
  ]
}

export const Installations: CollectionConfig = {
  slug: 'installations',
  admin: {
    useAsTitle: 'titleEn',
    defaultColumns: ['titleEn', 'type', 'locationEn', 'completionDate', 'updatedAt'],
  },
  access: {
    read: publishedOrAuthenticated,
    create: isInstallationEditor,
    update: isInstallationEditor,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    createLocaleTabs(buildInstallationLocaleFields, {
      copyFromEnglish: ['title', 'location', 'description'],
    }),
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
