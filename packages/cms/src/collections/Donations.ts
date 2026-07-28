import type { CollectionConfig } from 'payload'
import { isAdmin, isAuthenticatedUser } from '../util/access'
import { CURRENCY_OPTIONS } from '../util/currency'

export const Donations: CollectionConfig = {
  slug: 'donations',
  labels: {
    singular: '捐款',
    plural: '捐款',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'amount', 'currency', 'transferDate', 'status', 'updatedAt'],
    listSearchableFields: ['name', 'email'],
    pagination: {
      defaultLimit: 10,
      limits: [10, 25, 50],
    },
    description: '記錄慈善機構收到的捐款，包括捐贈者資料、金額、轉賬日期及其支持的項目。',
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
      label: '捐贈者姓名',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: '捐贈者電子郵件',
      admin: {
        description: '用於發送捐款收據及後續聯絡的電子郵件地址。',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: '電話號碼',
    },
    {
      name: 'amount',
      type: 'number',
      label: '金額',
      required: true,
      admin: {
        description: '所選貨幣的捐款金額。',
      },
    },
    {
      name: 'currency',
      type: 'select',
      label: '貨幣',
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
      label: '轉賬日期',
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
      label: '支付方式',
      options: [
        { label: '銀行轉賬', value: 'bank-transfer' },
        { label: '轉數快', value: 'fps' },
        { label: 'PayMe', value: 'payme' },
        { label: '支票', value: 'cheque' },
        { label: '現金', value: 'cash' },
        { label: '其他', value: 'other' },
      ],
    },
    {
      name: 'installations',
      type: 'relationship',
      label: '用於援助項目',
      relationTo: 'installations',
      hasMany: true,
      admin: {
        description: '該捐款支持的援助項目。',
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'events',
      type: 'relationship',
      label: '用於活動',
      relationTo: 'events',
      hasMany: true,
      admin: {
        description: '該捐款分配到的活動。',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: '捐贈者留言',
      admin: {
        description: '捐贈者的可選留言或寄語。',
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
      label: '收據圖片',
      admin: {
        description: '透過捐款表單上傳的收據圖片。',
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: '內部備註',
      admin: {
        description: '僅限工作人員查看的捐款備註（不顯示給捐贈者）。',
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: '狀態',
      required: true,
      defaultValue: 'confirmed',
      options: [
        { label: '已確認', value: 'confirmed' },
        { label: '待處理', value: 'pending' },
        { label: '已退款', value: 'refunded' },
        { label: '已取消', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'receiptSent',
      type: 'checkbox',
      label: '收據已發送',
      defaultValue: false,
      admin: {
        description: '是否已向捐贈者發送捐款收據。',
        position: 'sidebar',
      },
    },
  ],
}
