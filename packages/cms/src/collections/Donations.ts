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
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Donor Message',
      admin: {
        description: 'Optional note or dedication from the donor.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal Notes',
      admin: {
        description: 'Staff-only notes about this donation (not shown to the donor).',
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
