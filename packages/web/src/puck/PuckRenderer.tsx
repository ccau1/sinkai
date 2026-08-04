'use client'

import type { Data } from '@puckeditor/core'
import { PuckHero } from './components/Hero'
import { PuckText } from './components/Text'
import { PuckImage } from './components/Image'
import { PuckAnimatedSection } from './components/AnimatedSection'

type PuckItemData = {
  type: string
  props: Record<string, unknown>
  id: string
}

type PuckRenderData = {
  root?: { props?: Record<string, unknown> }
  content: PuckItemData[]
  zones?: Record<string, PuckItemData[]>
}

export interface PuckRendererProps {
  data: Data
}

const components: Record<string, React.ComponentType<Record<string, unknown>>> = {
  Hero: PuckHero,
  Text: PuckText,
  Image: PuckImage,
  AnimatedSection: PuckAnimatedSection,
}

function SlotContent({
  zoneId,
  zones,
}: {
  zoneId: string
  zones?: Record<string, PuckItemData[]>
}) {
  const items = zones?.[zoneId] ?? []
  return (
    <>
      {items.map((item) => (
        <PuckItem key={item.id} item={item} zones={zones} />
      ))}
    </>
  )
}

function PuckItem({
  item,
  zones,
}: {
  item: PuckItemData
  zones?: Record<string, PuckItemData[]>
}) {
  const Component = components[item.type]
  if (!Component) return null

  const props = { ...item.props }

  // The AnimatedSection component exposes a Puck slot field named `content`.
  // Render the slot's children into the component's children prop.
  if (item.type === 'AnimatedSection') {
    const rest = { ...props }
    delete rest.content
    return (
      <Component {...rest}>
        <SlotContent zoneId={`${item.id}:content`} zones={zones} />
      </Component>
    )
  }

  return <Component {...props} />
}

export function PuckRenderer({ data }: PuckRendererProps) {
  const renderData = data as unknown as PuckRenderData
  const items = renderData.content ?? []

  return (
    <>
      {items.map((item) => (
        <PuckItem key={item.id} item={item} zones={renderData.zones} />
      ))}
    </>
  )
}

export default PuckRenderer
