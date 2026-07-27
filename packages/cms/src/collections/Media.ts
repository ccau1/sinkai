import type { CollectionConfig } from 'payload'
import {
  isContentEditor,
  PERMISSIONS,
  userIsAdmin,
  hasPermission,
} from '../util/access'
import {
  deleteThumbnailAfterDelete,
  setPrefixFromVisibility,
  syncVisibilityStorage,
  triggerThumbnailAfterUpload,
} from '../hooks/mediaVisibility'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'
import { checkVideoThumb, postVideoThumb } from '../endpoints/videoThumb'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: {
      en: 'Media',
      'zh-CN': '媒体',
      'zh-TW': '媒體',
    },
    plural: {
      en: 'Media',
      'zh-CN': '媒体',
      'zh-TW': '媒體',
    },
  },
  admin: {
    group: {
      en: 'Website',
      'zh-CN': '网站',
      'zh-TW': '網站',
    },
    description: {
      en: 'Images and files uploaded for use across the website.',
      'zh-CN': '上传至网站使用的图片与文件。',
      'zh-TW': '上傳至網站使用的圖片與檔案。',
    },
  },
  access: {
    read: ({ req }) => (req.user ? true : { prefix: { not_equals: 'private' } }),
    // Allow public uploads so the donation form can accept receipt images.
    // The form-builder plugin enforces per-field MIME type and size limits.
    create: () => true,
    update: isContentEditor,
    delete: ({ req: { user } }) =>
      userIsAdmin(user) || hasPermission(user, PERMISSIONS.DELETE_MEDIA),
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [setPrefixFromVisibility],
    afterChange: [syncVisibilityStorage, revalidateWebAfterChange],
    afterDelete: [deleteThumbnailAfterDelete, revalidateWebAfterDelete],
    afterOperation: [triggerThumbnailAfterUpload],
  },
  endpoints: [
    {
      path: '/video-thumb/check',
      method: 'get',
      handler: checkVideoThumb,
    },
    {
      path: '/video-thumb',
      method: 'post',
      handler: postVideoThumb,
    },
  ],
  fields: [
    {
      name: 'prefix',
      type: 'text',
      defaultValue: 'public',
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'alt',
      type: 'text',
      label: {
        en: 'Alt Text',
        'zh-CN': '替代文本',
        'zh-TW': '替代文字',
      },
      localized: true,
      required: false,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'media-categories',
      label: {
        en: 'Media Category',
        'zh-CN': '媒体分类',
        'zh-TW': '媒體分類',
      },
      admin: {
        description: {
          en: 'Used to organize media files. Media in this category can be shown on the gallery page.',
          'zh-CN': '用于整理媒体文件。该分类下的媒体可显示在图库页面。',
          'zh-TW': '用於整理媒體檔案。該分類下的媒體可顯示在圖庫頁面。',
        },
      },
    },
    {
      name: 'tags',
      type: 'text',
      label: {
        en: 'Tags',
        'zh-CN': '标签',
        'zh-TW': '標籤',
      },
      hasMany: true,
      admin: {
        description: {
          en: 'Optional tags for future filtering and grouping.',
          'zh-CN': '可选标签，用于后续筛选与分组。',
          'zh-TW': '可選標籤，用於後續篩選與分組。',
        },
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: {
        en: 'Sort Order',
        'zh-CN': '排序',
        'zh-TW': '排序',
      },
      defaultValue: 0,
      admin: {
        description: {
          en: 'Position within the media category. Lower numbers appear first.',
          'zh-CN': '在该媒体分类中的位置。数字越小越靠前。',
          'zh-TW': '在該媒體分類中的位置。數字越小越靠前。',
        },
      },
    },
    {
      name: 'hidden',
      type: 'checkbox',
      label: {
        en: 'Hidden from Gallery',
        'zh-CN': '在图库中隐藏',
        'zh-TW': '在圖庫中隱藏',
      },
      defaultValue: false,
      admin: {
        description: {
          en: 'Hide this media from the public gallery page without deleting it.',
          'zh-CN': '在不删除的情况下，在公共图库页面隐藏此媒体。',
          'zh-TW': '在不刪除的情況下，在公共圖庫頁面隱藏此媒體。',
        },
      },
    },
    {
      name: 'visibility',
      type: 'select',
      label: {
        en: 'Visibility',
        'zh-CN': '可见性',
        'zh-TW': '可見性',
      },
      defaultValue: 'public',
      required: true,
      options: [
        { label: { en: 'Public', 'zh-CN': '公开', 'zh-TW': '公開' }, value: 'public' },
        { label: { en: 'Private', 'zh-CN': '私密', 'zh-TW': '私密' }, value: 'private' },
      ],
      admin: {
        position: 'sidebar',
        description: {
          en: 'Private files are only served through the CMS to logged-in users.',
          'zh-CN': '私密文件仅通过 CMS 提供给已登录用户。',
          'zh-TW': '私密檔案僅透過 CMS 提供給已登入使用者。',
        },
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
    {
      name: 'videoThumbnail',
      type: 'ui',
      admin: {
        components: {
          Field: './components/VideoThumbnail#default',
        },
      },
    },
  ],
  upload: {
    // Sharp-based transforms are not supported on Cloudflare Workers yet;
    // thumbnails are generated by the sinkai-cms-thumbnails workflow instead.
    // For the admin list we derive the thumbnail from the stored file URL:
    // use an on-the-fly Cloudflare Images resize when the URL is absolute,
    // otherwise fall back to the original file served through the CMS.
    adminThumbnail: ({ doc }) => {
      const filename = doc.filename as string | undefined
      if (!filename) return ''
      const url = (doc.url as string) || ''
      if (!url) return ''

      if (doc.prefix === 'private') {
        return url
      }

      // Derive the thumbnail URL from the stored file URL so we do not depend on
      // process.env.MEDIA_PUBLIC_URL being available at read time (Next.js may
      // inline env vars at build time in the deployed worker). For public files
      // served from the CDN, apply an on-the-fly Cloudflare Images resize. For
      // relative URLs (local dev / legacy / no CDN configured), serve the
      // original through the CMS so the preview still appears.
      if (/^https?:\/\//i.test(url)) {
        try {
          const parsed = new URL(url)
          return `${parsed.origin}/cdn-cgi/image/width=320,quality=80,format=webp${parsed.pathname}`
        } catch {
          return url
        }
      }

      return url
    },
    crop: false,
    focalPoint: false,
  },
}
