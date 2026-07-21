import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor } from '../util/access'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

export const MediaCategories: CollectionConfig = {
  slug: 'media-categories',
  labels: {
    singular: 'Media Category',
    plural: 'Media Categories',
  },
  admin: {
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
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        description: 'Stable identifier used in code, e.g. snow-disaster.',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: 'Label',
      localized: true,
      required: true,
      admin: {
        description: 'Small uppercase eyebrow text above the section title.',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
      admin: {
        description: 'Optional paragraph shown under the section title.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 0,
      admin: {
        description: 'Position of this category on the public gallery page. Lower numbers appear first.',
      },
    },
    {
      name: 'showInGallery',
      type: 'checkbox',
      label: 'Show in Gallery',
      defaultValue: true,
      admin: {
        description: 'Uncheck to hide this category from the public gallery page.',
      },
    },
  ],
}
