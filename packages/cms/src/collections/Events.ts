import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor, publishedOrAuthenticated } from '../util/access'
import { CURRENCY_OPTIONS } from '../util/currency'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: {
      en: 'Event',
      'zh-CN': '活动',
      'zh-TW': '活動',
    },
    plural: {
      en: 'Events',
      'zh-CN': '活动',
      'zh-TW': '活動',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'endDate', 'targetAmount', 'updatedAt'],
    description: {
      en: 'Charity events such as school building trips and fundraising campaigns. Events can be linked to donations (funding sources) and installations (what the event built).',
      'zh-CN': '慈善活动，例如建校行程和筹款活动。活动可以关联捐款（资金来源）和项目设施（活动成果）。',
      'zh-TW': '慈善活動，例如建校行程和籌款活動。活動可以關聯捐款（資金來源）和項目設施（活動成果）。',
    },
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
      label: {
        en: 'Title',
        'zh-CN': '标题',
        'zh-TW': '標題',
      },
      localized: true,
      required: true,
    },
    {
      name: 'startDate',
      type: 'date',
      label: {
        en: 'Start Date',
        'zh-CN': '开始日期',
        'zh-TW': '開始日期',
      },
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
      label: {
        en: 'End Date',
        'zh-CN': '结束日期',
        'zh-TW': '結束日期',
      },
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: {
          en: 'Leave empty for single-day events.',
          'zh-CN': '单日活动请留空。',
          'zh-TW': '單日活動請留空。',
        },
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
      label: {
        en: 'Description',
        'zh-CN': '描述',
        'zh-TW': '描述',
      },
      localized: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: {
        en: 'Cover Image',
        'zh-CN': '封面图片',
        'zh-TW': '封面圖片',
      },
      relationTo: 'media',
      displayPreview: true,
    },
    {
      name: 'addresses',
      type: 'array',
      label: {
        en: 'Addresses',
        'zh-CN': '地址',
        'zh-TW': '地址',
      },
      labels: {
        singular: {
          en: 'Address',
          'zh-CN': '地址',
          'zh-TW': '地址',
        },
        plural: {
          en: 'Addresses',
          'zh-CN': '地址',
          'zh-TW': '地址',
        },
      },
      fields: [
        {
          name: 'address',
          type: 'text',
          label: {
            en: 'Address',
            'zh-CN': '地址',
            'zh-TW': '地址',
          },
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
          label: {
            en: 'Target Amount',
            'zh-CN': '目标金额',
            'zh-TW': '目標金額',
          },
          admin: {
            width: '70%',
            description: {
              en: 'Donation amount required to fund this event.',
              'zh-CN': '资助该活动所需的捐款金额。',
              'zh-TW': '資助該活動所需的捐款金額。',
            },
            components: {
              Cell: './components/CurrencyAmountCell#default',
            },
          },
        },
        {
          name: 'targetCurrency',
          type: 'select',
          label: {
            en: 'Target Currency',
            'zh-CN': '目标货币',
            'zh-TW': '目標貨幣',
          },
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
      label: {
        en: 'Installations',
        'zh-CN': '援助项目',
        'zh-TW': '援助項目',
      },
      relationTo: 'installations',
      hasMany: true,
      admin: {
        description: {
          en: 'Installations funded or created by this event.',
          'zh-CN': '该活动资助或建成的援助项目。',
          'zh-TW': '該活動資助或建成的援助項目。',
        },
      },
    },
    {
      name: 'donations',
      type: 'join',
      label: {
        en: 'Donations',
        'zh-CN': '捐款',
        'zh-TW': '捐款',
      },
      collection: 'donations',
      on: 'events',
      admin: {
        description: {
          en: 'Donations allocated to this event.',
          'zh-CN': '分配到该活动的捐款。',
          'zh-TW': '分配到該活動的捐款。',
        },
        defaultColumns: ['name', 'amount', 'currency', 'transferDate', 'status'],
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
