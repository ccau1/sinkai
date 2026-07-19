import type { GlobalConfig } from 'payload'
import { isContentEditor } from '../util/access'

export const ContactSettings: GlobalConfig = {
  slug: 'contact-settings',
  label: 'Contact Settings',
  access: {
    read: () => true,
    update: isContentEditor,
  },
  fields: [
    {
      name: 'fromEmail',
      type: 'email',
      label: 'From Email',
      defaultValue: 'contact@sinkai.org',
      required: true,
    },
    {
      name: 'notificationEmail',
      type: 'email',
      label: 'Notification Email',
      defaultValue: 'calvin@tribalorigin.com',
      required: true,
    },
  ],
}
