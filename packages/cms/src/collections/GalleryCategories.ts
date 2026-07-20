import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor } from '../util/access'

export const GalleryCategories: CollectionConfig = {
  slug: 'gallery-categories',
  labels: {
    singular: 'Gallery Category',
    plural: 'Gallery Categories',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['slug', 'label', 'sortOrder', 'showInGallery'],
    description: {
      en: 'Categories used to group images on the public gallery page.',
      'zh-CN': '用于在公共图库页面对图片进行分组的分类。',
      'zh-TW': '用於在公共圖庫頁面對圖片進行分類。',
    },
  },
  access: {
    read: () => true,
    create: isContentEditor,
    update: isContentEditor,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
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
        description: 'Position of this section on the gallery page. Lower numbers appear first.',
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
