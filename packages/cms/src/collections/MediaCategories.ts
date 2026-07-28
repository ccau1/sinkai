import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor } from '../util/access'
import {
  revalidateWebAfterChange,
  revalidateWebAfterDelete,
} from '../hooks/triggerWebRevalidate'

export const MediaCategories: CollectionConfig = {
  slug: 'media-categories',
  labels: {
    singular: '媒體分類',
    plural: '媒體分類',
  },
  admin: {
    group: '網站',
    useAsTitle: 'title',
    defaultColumns: ['slug', 'label', 'sortOrder', 'showInGallery'],
    description: '用於整理媒體檔案的分類。分類可以顯示在公共圖庫頁面。',
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
      label: 'URL 別名',
      required: true,
      unique: true,
      admin: {
        description: '程式碼中使用的穩定識別碼，例如 snow-disaster。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '標籤',
      localized: true,
      required: true,
      admin: {
        description: '區塊標題上方的小號大寫眉題文字。',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: '標題',
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
      localized: true,
      admin: {
        description: '顯示在區塊標題下方的可選段落。',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: '排序',
      defaultValue: 0,
      admin: {
        description: '該分類在公共圖庫頁面上的位置。數字越小越靠前。',
      },
    },
    {
      name: 'showInGallery',
      type: 'checkbox',
      label: '在圖庫中顯示',
      defaultValue: true,
      admin: {
        description: '取消勾選以在公共圖庫頁面隱藏此分類。',
      },
    },
  ],
}
