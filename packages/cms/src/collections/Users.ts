import type { CollectionConfig } from 'payload'

import { isAdmin, userIsAdmin } from '../util/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '使用者',
    plural: '使用者',
  },
  admin: {
    group: '設定',
    // Keep email as the list title even though username login is enabled,
    // so existing users without a username still display properly.
    useAsTitle: 'email',
    description: '可存取內容管理系統的管理用戶及其分配的角色。',
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
    read: ({ req: { user }, id }) => userIsAdmin(user) || user?.id === id,
    create: isAdmin,
    update: ({ req: { user }, id }) => userIsAdmin(user) || user?.id === id,
    delete: isAdmin,
    admin: ({ req: { user } }) => userIsAdmin(user),
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: '管理員', value: 'admin' },
        { label: '網誌編輯', value: 'blog_editor' },
        { label: '援助項目編輯', value: 'installation_editor' },
        { label: '唯讀', value: 'read_only' },
      ],
      defaultValue: ['read_only'],
      required: true,
      saveToJWT: true,
      access: {
        create: ({ req: { user } }) => userIsAdmin(user),
        read: ({ req: { user } }) => userIsAdmin(user),
        update: ({ req: { user } }) => userIsAdmin(user),
      },
    },
    {
      name: 'permissions',
      type: 'group',
      label: '額外權限',
      admin: {
        description: '授予使用者角色之外的額外權限。權限可覆蓋或擴展角色存取範圍。',
      },
      saveToJWT: true,
      access: {
        create: ({ req: { user } }) => userIsAdmin(user),
        read: ({ req: { user } }) => userIsAdmin(user),
        update: ({ req: { user } }) => userIsAdmin(user),
      },
      fields: [
        {
          name: 'manageUsers',
          type: 'checkbox',
          label: '管理使用者',
        },
        {
          name: 'editBlogs',
          type: 'checkbox',
          label: '編輯網誌',
        },
        {
          name: 'editInstallations',
          type: 'checkbox',
          label: '編輯援助項目',
        },
        {
          name: 'uploadMedia',
          type: 'checkbox',
          label: '上傳媒體',
        },
        {
          name: 'deleteMedia',
          type: 'checkbox',
          label: '刪除媒體',
        },
        {
          name: 'viewUnpublished',
          type: 'checkbox',
          label: '查看未發布內容',
        },
      ],
    },
  ],
}
