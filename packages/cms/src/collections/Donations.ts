import type { CollectionConfig } from 'payload'
import { isAdmin, isAuthenticatedUser } from '../util/access'
import { CURRENCY_OPTIONS } from '../util/currency'

export const Donations: CollectionConfig = {
  slug: 'donations',
  labels: {
    singular: {
      en: 'Donation',
      'zh-CN': '捐款',
      'zh-TW': '捐款',
    },
    plural: {
      en: 'Donations',
      'zh-CN': '捐款',
      'zh-TW': '捐款',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'amount', 'currency', 'transferDate', 'status', 'updatedAt'],
    listSearchableFields: ['name', 'email'],
    pagination: {
      defaultLimit: 10,
      limits: [10, 25, 50],
    },
    description: {
      en: 'Track donations received by the charity, including donor details, amount, transfer date and the installations they support.',
      'zh-CN': '记录慈善机构收到的捐款，包括捐赠者资料、金额、转账日期及其支持的项目。',
      'zh-TW': '記錄慈善機構收到的捐款，包括捐贈者資料、金額、轉賬日期及其支持的項目。',
    },
  },
  access: {
    read: isAuthenticatedUser,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Donor Name',
        'zh-CN': '捐赠者姓名',
        'zh-TW': '捐贈者姓名',
      },
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: {
        en: 'Donor Email',
        'zh-CN': '捐赠者电子邮箱',
        'zh-TW': '捐贈者電子郵件',
      },
      admin: {
        description: {
          en: 'Email address for donation receipt and follow-up.',
          'zh-CN': '用于发送捐款收据及后续联络的电子邮箱地址。',
          'zh-TW': '用於發送捐款收據及後續聯絡的電子郵件地址。',
        },
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: {
        en: 'Phone Number',
        'zh-CN': '电话号码',
        'zh-TW': '電話號碼',
      },
    },
    {
      name: 'amount',
      type: 'number',
      label: {
        en: 'Amount',
        'zh-CN': '金额',
        'zh-TW': '金額',
      },
      required: true,
      admin: {
        description: {
          en: 'Donation amount in the selected currency.',
          'zh-CN': '所选货币的捐款金额。',
          'zh-TW': '所選貨幣的捐款金額。',
        },
      },
    },
    {
      name: 'currency',
      type: 'select',
      label: {
        en: 'Currency',
        'zh-CN': '货币',
        'zh-TW': '貨幣',
      },
      required: true,
      defaultValue: 'HKD',
      options: CURRENCY_OPTIONS,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'transferDate',
      type: 'date',
      label: {
        en: 'Transfer Date',
        'zh-CN': '转账日期',
        'zh-TW': '轉賬日期',
      },
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: {
        en: 'Payment Method',
        'zh-CN': '支付方式',
        'zh-TW': '支付方式',
      },
      options: [
        { label: { en: 'Bank Transfer', 'zh-CN': '银行转账', 'zh-TW': '銀行轉賬' }, value: 'bank-transfer' },
        { label: { en: 'FPS', 'zh-CN': '转数快', 'zh-TW': '轉數快' }, value: 'fps' },
        { label: { en: 'PayMe', 'zh-CN': 'PayMe', 'zh-TW': 'PayMe' }, value: 'payme' },
        { label: { en: 'Cheque', 'zh-CN': '支票', 'zh-TW': '支票' }, value: 'cheque' },
        { label: { en: 'Cash', 'zh-CN': '现金', 'zh-TW': '現金' }, value: 'cash' },
        { label: { en: 'Other', 'zh-CN': '其他', 'zh-TW': '其他' }, value: 'other' },
      ],
    },
    {
      name: 'installations',
      type: 'relationship',
      label: {
        en: 'For Installations',
        'zh-CN': '用于援助项目',
        'zh-TW': '用於援助項目',
      },
      relationTo: 'installations',
      hasMany: true,
      admin: {
        description: {
          en: 'Installations that this donation supports.',
          'zh-CN': '该捐款支持的援助项目。',
          'zh-TW': '該捐款支持的援助項目。',
        },
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'events',
      type: 'relationship',
      label: {
        en: 'For Events',
        'zh-CN': '用于活动',
        'zh-TW': '用於活動',
      },
      relationTo: 'events',
      hasMany: true,
      admin: {
        description: {
          en: 'Events that this donation is allocated to.',
          'zh-CN': '该捐款分配到的活动。',
          'zh-TW': '該捐款分配到的活動。',
        },
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: {
        en: 'Donor Message',
        'zh-CN': '捐赠者留言',
        'zh-TW': '捐贈者留言',
      },
      admin: {
        description: {
          en: 'Optional note or dedication from the donor.',
          'zh-CN': '捐赠者的可选留言或寄语。',
          'zh-TW': '捐贈者的可選留言或寄語。',
        },
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'receipts',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      maxRows: 2,
      label: {
        en: 'Receipt Images',
        'zh-CN': '收据图片',
        'zh-TW': '收據圖片',
      },
      admin: {
        description: {
          en: 'Receipt images uploaded through the donation form.',
          'zh-CN': '通过捐款表单上传的收据图片。',
          'zh-TW': '透過捐款表單上傳的收據圖片。',
        },
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: {
        en: 'Internal Notes',
        'zh-CN': '内部备注',
        'zh-TW': '內部備註',
      },
      admin: {
        description: {
          en: 'Staff-only notes about this donation (not shown to the donor).',
          'zh-CN': '仅限工作人员查看的捐款备注（不显示给捐赠者）。',
          'zh-TW': '僅限工作人員查看的捐款備註（不顯示給捐贈者）。',
        },
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        'zh-CN': '状态',
        'zh-TW': '狀態',
      },
      required: true,
      defaultValue: 'confirmed',
      options: [
        { label: { en: 'Confirmed', 'zh-CN': '已确认', 'zh-TW': '已確認' }, value: 'confirmed' },
        { label: { en: 'Pending', 'zh-CN': '待处理', 'zh-TW': '待處理' }, value: 'pending' },
        { label: { en: 'Refunded', 'zh-CN': '已退款', 'zh-TW': '已退款' }, value: 'refunded' },
        { label: { en: 'Cancelled', 'zh-CN': '已取消', 'zh-TW': '已取消' }, value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'receiptSent',
      type: 'checkbox',
      label: {
        en: 'Receipt Sent',
        'zh-CN': '收据已发送',
        'zh-TW': '收據已發送',
      },
      defaultValue: false,
      admin: {
        description: {
          en: 'Whether a donation receipt has been sent to the donor.',
          'zh-CN': '是否已向捐赠者发送捐款收据。',
          'zh-TW': '是否已向捐贈者發送捐款收據。',
        },
        position: 'sidebar',
      },
    },
  ],
}
