import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor, publishedOrAuthenticated } from '../util/access'
import { CURRENCY_OPTIONS } from '../util/currency'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: '活動',
    plural: '活動',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'endDate', 'targetAmount', 'updatedAt'],
    description: '慈善活動，例如建校行程和籌款活動。活動可以關聯捐款（資金來源）和項目設施（活動成果）。',
    components: {
      beforeListTable: ['./components/EventsCalendar#default'],
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: isContentEditor,
    update: isContentEditor,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '標題',
      localized: true,
      required: true,
    },
    {
      name: 'startDate',
      type: 'date',
      label: '開始日期',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: '結束日期',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: '單日活動請留空。',
      },
      validate: (
        value: Date | null | undefined,
        { siblingData }: { siblingData: { startDate?: string | Date } },
      ) => {
        if (value && siblingData?.startDate && new Date(value) < new Date(siblingData.startDate)) {
          return 'End date must be on or after the start date.'
        }
        return true
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: '描述',
      localized: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: '封面圖片',
      relationTo: 'media',
      displayPreview: true,
    },
    {
      name: 'addresses',
      type: 'array',
      label: '地址',
      labels: {
        singular: '地址',
        plural: '地址',
      },
      fields: [
        {
          name: 'address',
          type: 'text',
          label: '地址',
          localized: true,
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'targetAmount',
          type: 'number',
          label: '目標金額',
          admin: {
            width: '70%',
            description: '資助該活動所需的捐款金額。',
            components: {
              Cell: './components/CurrencyAmountCell#default',
            },
          },
        },
        {
          name: 'targetCurrency',
          type: 'select',
          label: '目標貨幣',
          defaultValue: 'HKD',
          options: CURRENCY_OPTIONS,
          admin: {
            width: '30%',
          },
        },
      ],
    },
    {
      name: 'raisedSummary',
      type: 'ui',
      admin: {
        components: {
          Field: './components/EventsCalendar/RaisedSummary#default',
        },
      },
    },
    {
      name: 'installations',
      type: 'relationship',
      label: '援助項目',
      relationTo: 'installations',
      hasMany: true,
      admin: {
        description: '該活動資助或建成的援助項目。',
      },
    },
    {
      name: 'donations',
      type: 'join',
      label: '捐款',
      collection: 'donations',
      on: 'events',
      admin: {
        description: '分配到該活動的捐款。',
        defaultColumns: ['name', 'amount', 'currency', 'transferDate', 'status'],
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      label: '已發布',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
