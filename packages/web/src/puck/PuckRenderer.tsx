'use client'

import { Render } from '@puckeditor/core'
import type { Data } from '@puckeditor/core'
import '@puckeditor/core/dist/index.css'
import { puckConfig } from './config'

export interface PuckRendererProps {
  data: Data
}

export function PuckRenderer({ data }: PuckRendererProps) {
  return <Render config={puckConfig} data={data} />
}

export default PuckRenderer
