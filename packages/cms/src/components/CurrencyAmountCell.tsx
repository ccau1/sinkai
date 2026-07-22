'use client'

import React from 'react'
import { formatCurrency } from '../util/currency'

type CurrencyAmountCellProps = {
  cellData?: number | null
  rowData?: {
    targetCurrency?: string | null
  }
}

/** List-view cell that renders a numeric amount as a formatted currency value. */
export default function CurrencyAmountCell({ cellData, rowData }: CurrencyAmountCellProps) {
  if (typeof cellData !== 'number') return null
  return <span>{formatCurrency(cellData, rowData?.targetCurrency || 'HKD')}</span>
}
