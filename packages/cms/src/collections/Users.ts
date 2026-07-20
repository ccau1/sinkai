import type { CollectionConfig } from 'payload'

import { isAdmin, userIsAdmin } from '../util/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    // Keep email as the list title even though username login is enabled,
    // so existing users without a username still display properly.
    useAsTitle: 'email',
    description: {
      en: 'Administrative users who can access the CMS and their assigned roles.',
      'zh-CN': '可访问内容管理系统的管理用户及其分配的角色。',
      'zh-TW': '可存取內容管理系統的管理用戶及其分配的角色。',
    },
  },
  auth: {
    // Allow users to log in with either their username or their email address.
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: false,
      requireUsername: false,
    },
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: ({ req: { user } }) => userIsAdmin(user),
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
