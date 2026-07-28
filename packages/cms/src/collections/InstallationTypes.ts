import type { CollectionConfig } from 'payload'
import { isAdmin } from '../util/access'

export const InstallationTypes: CollectionConfig = {
  slug: 'installation-types',
  labels: {
    singular: '援助類型',
    plural: '援助類型',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'key', 'sortOrder', 'updatedAt'],
    description: '項目設施類型（例如學校、橋樑、水窖）。類型決定網站援建項目頁面的分組。',
  },
  access: {
    // Public read: the website fetches types to group and label installations.
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      label: '鍵值',
      required: true,
      unique: true,
      admin: {
        description: '程式碼與種子使用的穩定識別碼，例如 "school"。',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: '標籤',
      localized: true,
      required: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: '排序',
      defaultValue: 0,
      admin: {
        description: '控制援建項目頁面上的分組順序（數字越小越靠前）。',
        position: 'sidebar',
      },
    },
  ],
}
