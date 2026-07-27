import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor, publishedOrAuthenticated } from '../util/access'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

export const Testimonies: CollectionConfig = {
  slug: 'testimonies',
  labels: {
    singular: {
      en: 'Testimony',
      'zh-CN': '见证',
      'zh-TW': '見證',
    },
    plural: {
      en: 'Testimonies',
      'zh-CN': '见证',
      'zh-TW': '見證',
    },
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
      label: {
        en: 'Name',
        'zh-CN': '名称',
        'zh-TW': '名稱',
      },
      localized: true,
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      label: {
        en: 'Role / Title',
        'zh-CN': '角色 / 头衔',
        'zh-TW': '角色 / 頭銜',
      },
      localized: true,
      admin: {
        description: {
          en: 'E.g. "Actor", "Singer", "Beneficiary", "Volunteer".',
          'zh-CN': '例如「演员」、「歌手」、「受益者」、「志愿者」。',
          'zh-TW': '例如「演員」、「歌手」、「受益者」、「義工」。',
        },
      },
    },
    {
      name: 'highlighted',
      type: 'checkbox',
      label: {
        en: 'Highlighted',
        'zh-CN': '重点推荐',
        'zh-TW': '重點推薦',
      },
      defaultValue: false,
      admin: {
        description: {
          en: 'Mark as a highlighted testimony (e.g. celebrity or VIP).',
          'zh-CN': '标记为重点推荐见证（例如名人或贵宾）。',
          'zh-TW': '標記為重點推薦見證（例如名人或貴賓）。',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Photos',
        'zh-CN': '照片',
        'zh-TW': '照片',
      },
      hasMany: true,
      required: true,
      displayPreview: true,
    },
    {
      name: 'synopsis',
      type: 'textarea',
      label: {
        en: 'Synopsis',
        'zh-CN': '简介',
        'zh-TW': '簡介',
      },
      localized: true,
      required: true,
      admin: {
        description: {
          en: 'A short quote or summary shown in listings.',
          'zh-CN': '在列表中显示的短句或摘要。',
          'zh-TW': '在列表中顯示的短句或摘要。',
        },
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: {
        en: 'Full Content',
        'zh-CN': '完整内容',
        'zh-TW': '完整內容',
      },
      localized: true,
      admin: {
        description: {
          en: 'The full testimony or story.',
          'zh-CN': '完整的见证或故事。',
          'zh-TW': '完整的見證或故事。',
        },
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      label: {
        en: 'Published',
        'zh-CN': '已发布',
        'zh-TW': '已發布',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
