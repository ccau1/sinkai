import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor, publishedOrAuthenticated } from '../util/access'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

export const Testimonies: CollectionConfig = {
  slug: 'testimonies',
  labels: {
    singular: 'Testimony',
    plural: 'Testimonies',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'highlighted', 'published', 'updatedAt'],
    description: {
      en: 'Stories and testimonials from beneficiaries, volunteers, donors and supporters.',
      'zh-CN': '受益者、志愿者、捐赠者与支持者的故事和见证。',
      'zh-TW': '受益者、義工、捐贈者與支持者的故事和見證。',
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: isContentEditor,
    update: isContentEditor,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [revalidateWebAfterChange],
    afterDelete: [revalidateWebAfterDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      localized: true,
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      label: 'Role / Title',
      localized: true,
      admin: {
        description: 'E.g. "Actor", "Singer", "Beneficiary", "Volunteer".',
      },
    },
    {
      name: 'highlighted',
      type: 'checkbox',
      label: 'Highlighted',
      defaultValue: false,
      admin: {
        description: 'Mark as a highlighted testimony (e.g. celebrity or VIP).',
        position: 'sidebar',
      },
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      label: 'Photos',
      hasMany: true,
      required: true,
      displayPreview: true,
    },
    {
      name: 'synopsis',
      type: 'textarea',
      label: 'Synopsis',
      localized: true,
      required: true,
      admin: {
        description: 'A short quote or summary shown in listings.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Full Content',
      localized: true,
      admin: {
        description: 'The full testimony or story.',
      },
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
