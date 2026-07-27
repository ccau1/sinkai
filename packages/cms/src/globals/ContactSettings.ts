import type { GlobalConfig } from 'payload'
import { isContentEditor } from '../util/access'

export const ContactSettings: GlobalConfig = {
  slug: 'contact-settings',
  label: {
    en: 'Contact Settings',
    'zh-CN': '联系设置',
    'zh-TW': '聯絡設定',
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
  fields: [
    {
      name: 'fromEmail',
      type: 'email',
      label: {
        en: 'From Email',
        'zh-CN': '发件邮箱',
        'zh-TW': '發件郵箱',
      },
      defaultValue: 'contact@sinkai.org',
      required: true,
    },
    {
      name: 'notificationEmail',
      type: 'email',
      label: {
        en: 'Notification Email',
        'zh-CN': '通知邮箱',
        'zh-TW': '通知郵箱',
      },
      defaultValue: 'calvin@tribalorigin.com',
      required: true,
    },
  ],
}
