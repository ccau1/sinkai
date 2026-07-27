import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor } from '../util/access'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

export const MediaCategories: CollectionConfig = {
  slug: 'media-categories',
  labels: {
    singular: {
      en: 'Media Category',
      'zh-CN': '媒体分类',
      'zh-TW': '媒體分類',
    },
    plural: {
      en: 'Media Categories',
      'zh-CN': '媒体分类',
      'zh-TW': '媒體分類',
    },
  },
  admin: {
    group: {
      en: 'Website',
      'zh-CN': '网站',
      'zh-TW': '網站',
    },
    useAsTitle: 'title',
    defaultColumns: ['slug', 'label', 'sortOrder', 'showInGallery'],
    description: {
      en: 'Categories used to organize media files. Categories can be shown on the public gallery page.',
      'zh-CN': '用于整理媒体文件的分类。分类可以显示在公共图库页面。',
      'zh-TW': '用於整理媒體檔案的分類。分類可以顯示在公共圖庫頁面。',
    },
  },
  access: {
    read: () => true,
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
      name: 'slug',
      type: 'text',
      label: {
        en: 'Slug',
        'zh-CN': 'URL 别名',
        'zh-TW': 'URL 別名',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'Stable identifier used in code, e.g. snow-disaster.',
          'zh-CN': '代码中使用的稳定标识符，例如 snow-disaster。',
          'zh-TW': '程式碼中使用的穩定識別碼，例如 snow-disaster。',
        },
      },
    },
    {
      name: 'label',
      type: 'text',
      label: {
        en: 'Label',
        'zh-CN': '标签',
        'zh-TW': '標籤',
      },
      localized: true,
      required: true,
      admin: {
        description: {
          en: 'Small uppercase eyebrow text above the section title.',
          'zh-CN': '区块标题上方的小号大写眉题文字。',
          'zh-TW': '區塊標題上方的小號大寫眉題文字。',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        'zh-CN': '标题',
        'zh-TW': '標題',
      },
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        'zh-CN': '描述',
        'zh-TW': '描述',
      },
      localized: true,
      admin: {
        description: {
          en: 'Optional paragraph shown under the section title.',
          'zh-CN': '显示在区块标题下方的可选段落。',
          'zh-TW': '顯示在區塊標題下方的可選段落。',
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
          en: 'Position of this category on the public gallery page. Lower numbers appear first.',
          'zh-CN': '该分类在公共图库页面上的位置。数字越小越靠前。',
          'zh-TW': '該分類在公共圖庫頁面上的位置。數字越小越靠前。',
        },
      },
    },
    {
      name: 'showInGallery',
      type: 'checkbox',
      label: {
        en: 'Show in Gallery',
        'zh-CN': '在图库中显示',
        'zh-TW': '在圖庫中顯示',
      },
      defaultValue: true,
      admin: {
        description: {
          en: 'Uncheck to hide this category from the public gallery page.',
          'zh-CN': '取消勾选以在公共图库页面隐藏此分类。',
          'zh-TW': '取消勾選以在公共圖庫頁面隱藏此分類。',
        },
      },
    },
  ],
}
