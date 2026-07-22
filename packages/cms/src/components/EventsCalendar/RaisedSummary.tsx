import React from 'react'
import type { Payload } from 'payload'

import RaisedSummaryClient from './RaisedSummaryClient'
import { getExchangeRates } from '../../util/exchangeRates'

interface RaisedSummaryProps {
  id?: number | string
  payload: Payload
  data?: {
    targetAmount?: number | null
    targetCurrency?: string | null
  }
}

export default async function RaisedSummary({ id, payload, data }: RaisedSummaryProps) {
  // Nothing to sum until the event has been saved.
  if (!id) return null

  const donations = await payload.find({
    collection: 'donations',
    depth: 0,
    limit: 1000,
    pagination: false,
    select: {
      amount: true,
      currency: true,
      status: true,
    },
    where: {
      and: [{ events: { contains: id } }, { status: { not_equals: 'cancelled' } }],
    },
  })

  const totals: Record<string, number> = {}
  for (const donation of donations.docs) {
    const currency = (donation.currency as string) || 'HKD'
    const amount = typeof donation.amount === 'number' ? donation.amount : 0
    totals[currency] = (totals[currency] ?? 0) + amount
  }

  const exchangeRates = await getExchangeRates()

  return (
    <RaisedSummaryClient
      rates={exchangeRates.hkdPerUnit}
      ratesSource={exchangeRates.source}
      ratesUpdatedAt={exchangeRates.updatedAt}
      targetAmount={typeof data?.targetAmount === 'number' ? data.targetAmount : null}
      targetCurrency={data?.targetCurrency || 'HKD'}
      totals={totals}
    />
  )
}
