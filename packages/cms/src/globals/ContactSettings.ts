import type { GlobalConfig } from 'payload'
import { isContentEditor } from '../util/access'

export const ContactSettings: GlobalConfig = {
  slug: 'contact-settings',
  label: '聯絡設定',
  admin: {
    group: '設定',
  },
  access: {
    read: () => true,
    update: isContentEditor,
  },
  fields: [
    {
      name: 'fromEmail',
      type: 'email',
      label: '發件郵箱',
      defaultValue: 'contact@sinkai.org',
      required: true,
    },
    {
      name: 'notificationEmail',
      type: 'email',
      label: '通知郵箱',
      defaultValue: 'calvin@tribalorigin.com',
      required: true,
    },
  ],
}
