import type { CollectionConfig } from 'payload'

import { isAdmin, userIsAdmin } from '../util/access'
import {
  adminLanguageFieldDescription,
  adminLanguageFieldLabel,
  supportedAdminLanguageOptions,
} from '../adminLanguages'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: {
      en: 'User',
      'zh-CN': '用户',
      'zh-TW': '使用者',
    },
    plural: {
      en: 'Users',
      'zh-CN': '用户',
      'zh-TW': '使用者',
    },
  },
  admin: {
    group: {
      en: 'Settings',
      'zh-CN': '设置',
      'zh-TW': '設定',
    },
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
        { label: { en: 'Admin', 'zh-CN': '管理员', 'zh-TW': '管理員' }, value: 'admin' },
        { label: { en: 'Blog Editor', 'zh-CN': '博客编辑', 'zh-TW': '網誌編輯' }, value: 'blog_editor' },
        { label: { en: 'Installation Editor', 'zh-CN': '援助项目编辑', 'zh-TW': '援助項目編輯' }, value: 'installation_editor' },
        { label: { en: 'Read Only', 'zh-CN': '只读', 'zh-TW': '唯讀' }, value: 'read_only' },
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
      name: 'preferences',
      type: 'group',
      label: {
        en: 'User Preferences',
        'zh-CN': '用户偏好设置',
        'zh-TW': '使用者偏好設定',
      },
      saveToJWT: true,
      fields: [
        {
          name: 'language',
          type: 'select',
          label: adminLanguageFieldLabel,
          admin: {
            description: adminLanguageFieldDescription,
            components: {
              Field: './components/LanguagePreferenceField#default',
            },
          },
          options: supportedAdminLanguageOptions,
          defaultValue: 'zh-TW',
        },
      ],
    },
    {
      name: 'permissions',
      type: 'group',
      label: {
        en: 'Extra Permissions',
        'zh-CN': '额外权限',
        'zh-TW': '額外權限',
      },
      admin: {
        description: {
          en: 'Grant additional permissions beyond the user\'s roles. Permissions override or extend role access.',
          'zh-CN': '授予用户角色之外的额外权限。权限可覆盖或扩展角色访问范围。',
          'zh-TW': '授予使用者角色之外的額外權限。權限可覆蓋或擴展角色存取範圍。',
        },
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
          label: {
            en: 'Manage users',
            'zh-CN': '管理用户',
            'zh-TW': '管理使用者',
          },
        },
        {
          name: 'editBlogs',
          type: 'checkbox',
          label: {
            en: 'Edit blogs',
            'zh-CN': '编辑博客',
            'zh-TW': '編輯網誌',
          },
        },
        {
          name: 'editInstallations',
          type: 'checkbox',
          label: {
            en: 'Edit installations',
            'zh-CN': '编辑援助项目',
            'zh-TW': '編輯援助項目',
          },
        },
        {
          name: 'uploadMedia',
          type: 'checkbox',
          label: {
            en: 'Upload media',
            'zh-CN': '上传媒体',
            'zh-TW': '上傳媒體',
          },
        },
        {
          name: 'deleteMedia',
          type: 'checkbox',
          label: {
            en: 'Delete media',
            'zh-CN': '删除媒体',
            'zh-TW': '刪除媒體',
          },
        },
        {
          name: 'viewUnpublished',
          type: 'checkbox',
          label: {
            en: 'View unpublished content',
            'zh-CN': '查看未发布内容',
            'zh-TW': '查看未發布內容',
          },
        },
      ],
    },
  ],
}
