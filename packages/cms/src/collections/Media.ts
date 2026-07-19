import type { CollectionConfig } from 'payload'
import {
  isContentEditor,
  PERMISSIONS,
  userIsAdmin,
  hasPermission,
} from '../util/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    description: {
      en: 'Images and files uploaded for use across the website.',
      'zh-CN': '上传至网站使用的图片与文件。',
      'zh-TW': '上傳至網站使用的圖片與檔案。',
    },
  },
  access: {
    read: () => true,
    create: isContentEditor,
    update: isContentEditor,
    delete: ({ req: { user } }) =>
      userIsAdmin(user) || hasPermission(user, PERMISSIONS.DELETE_MEDIA),
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      localized: true,
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      label: 'Gallery Category',
      admin: {
        description: 'Used to group images on the gallery page.',
      },
      options: [
        { label: 'Snow Disaster', value: 'snow-disaster' },
        { label: 'Old Schools', value: 'old-schools' },
        { label: 'New Schools', value: 'new-schools' },
        { label: 'Field Trip', value: 'field-trip' },
        { label: 'HK Charity', value: 'hk-charity' },
        { label: 'Mountain', value: 'mountain' },
        { label: 'Activities', value: 'activities' },
        { label: 'News', value: 'news' },
        { label: 'Others', value: 'others' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 0,
      admin: {
        description: 'Position within the gallery category. Lower numbers appear first.',
      },
    },
    {
      name: 'hidden',
      type: 'checkbox',
      label: 'Hidden from Gallery',
      defaultValue: false,
      admin: {
        description: 'Hide this media from the public gallery page without deleting it.',
      },
    },
    {
      name: 'usage',
      type: 'ui',
      admin: {
        components: {
          Field: './components/MediaUsage#default',
        },
      },
    },
  ],
  upload: {
    // Sharp-based transforms are not supported on Cloudflare Workers yet
    adminThumbnail: ({ doc }) => (doc.url as string) || '',
    crop: false,
    focalPoint: false,
  },
}
