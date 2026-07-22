import type { CollectionConfig } from 'payload'
import { isAdmin, isContentEditor, publishedOrAuthenticated } from '../util/access'
import { CURRENCY_OPTIONS } from '../util/currency'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Event',
    plural: 'Events',
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
      views: {
        calendar: {
          Component: './components/EventsCalendar#default',
          path: '/calendar',
          exact: true,
        },
        list: {
          actions: ['./components/EventsCalendarLink#default'],
        },
      },
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
      label: 'Title',
      localized: true,
      required: true,
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
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
      label: 'End Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: 'Leave empty for single-day events.',
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
      label: 'Description',
      localized: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: 'Cover Image',
      relationTo: 'media',
      displayPreview: true,
    },
    {
      name: 'addresses',
      type: 'array',
      label: 'Addresses',
      labels: {
        singular: 'Address',
        plural: 'Addresses',
      },
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Address',
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
          label: 'Target Amount',
          admin: {
            width: '70%',
            description: 'Donation amount required to fund this event.',
            components: {
              Cell: './components/CurrencyAmountCell#default',
            },
          },
        },
        {
          name: 'targetCurrency',
          type: 'select',
          label: 'Target Currency',
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
      label: 'Installations',
      relationTo: 'installations',
      hasMany: true,
      admin: {
        description: 'Installations funded or created by this event.',
      },
    },
    {
      name: 'donations',
      type: 'join',
      label: 'Donations',
      collection: 'donations',
      on: 'events',
      admin: {
        description: 'Donations allocated to this event.',
        defaultColumns: ['name', 'amount', 'currency', 'transferDate', 'status'],
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
