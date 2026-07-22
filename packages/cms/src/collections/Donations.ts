import type { CollectionConfig } from 'payload'
import { isAdmin, isAuthenticatedUser } from '../util/access'

export const Donations: CollectionConfig = {
  slug: 'donations',
  labels: {
    singular: 'Donation',
    plural: 'Donations',
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
      label: 'Donor Name',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Donor Email',
      admin: {
        description: 'Email address for donation receipt and follow-up.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'amount',
      type: 'number',
      label: 'Amount',
      required: true,
      admin: {
        description: 'Donation amount in the selected currency.',
      },
    },
    {
      name: 'currency',
      type: 'select',
      label: 'Currency',
      required: true,
      defaultValue: 'HKD',
      options: [
        { label: 'Hong Kong Dollar (HKD)', value: 'HKD' },
        { label: 'US Dollar (USD)', value: 'USD' },
        { label: 'Chinese Yuan (CNY)', value: 'CNY' },
        { label: 'New Taiwan Dollar (TWD)', value: 'TWD' },
        { label: 'Euro (EUR)', value: 'EUR' },
        { label: 'British Pound (GBP)', value: 'GBP' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'transferDate',
      type: 'date',
      label: 'Transfer Date',
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
      label: 'Payment Method',
      options: [
        { label: 'Bank Transfer', value: 'bank-transfer' },
        { label: 'FPS', value: 'fps' },
        { label: 'PayMe', value: 'payme' },
        { label: 'Cheque', value: 'cheque' },
        { label: 'Cash', value: 'cash' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'installations',
      type: 'relationship',
      label: 'For Installations',
      relationTo: 'installations',
      hasMany: true,
      admin: {
        description: 'Installations that this donation supports.',
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'events',
      type: 'relationship',
      label: 'For Events',
      relationTo: 'events',
      hasMany: true,
      admin: {
        description: 'Events that this donation is allocated to.',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Donor Message',
      admin: {
        description: 'Optional note or dedication from the donor.',
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
      label: 'Receipt Images',
      admin: {
        description: 'Receipt images uploaded through the donation form.',
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal Notes',
      admin: {
        description: 'Staff-only notes about this donation (not shown to the donor).',
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'confirmed',
      options: [
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Pending', value: 'pending' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'receiptSent',
      type: 'checkbox',
      label: 'Receipt Sent',
      defaultValue: false,
      admin: {
        description: 'Whether a donation receipt has been sent to the donor.',
        position: 'sidebar',
      },
    },
  ],
}
