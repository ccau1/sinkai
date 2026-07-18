import type { CollectionConfig } from 'payload'

import { isAdmin } from '../util/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: isAdmin,
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Blog Editor', value: 'blog_editor' },
        { label: 'Installation Editor', value: 'installation_editor' },
        { label: 'Read Only', value: 'read_only' },
      ],
      defaultValue: ['read_only'],
      required: true,
      saveToJWT: true,
    },
    {
      name: 'permissions',
      type: 'group',
      label: 'Extra Permissions',
      admin: {
        description:
          'Grant additional permissions beyond the user\'s roles. Permissions override or extend role access.',
      },
      saveToJWT: true,
      fields: [
        {
          name: 'manageUsers',
          type: 'checkbox',
          label: 'Manage users',
        },
        {
          name: 'editBlogs',
          type: 'checkbox',
          label: 'Edit blogs',
        },
        {
          name: 'editInstallations',
          type: 'checkbox',
          label: 'Edit installations',
        },
        {
          name: 'uploadMedia',
          type: 'checkbox',
          label: 'Upload media',
        },
        {
          name: 'deleteMedia',
          type: 'checkbox',
          label: 'Delete media',
        },
        {
          name: 'viewUnpublished',
          type: 'checkbox',
          label: 'View unpublished content',
        },
      ],
    },
  ],
}
