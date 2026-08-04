'use client'

import type { ComponentType } from 'react'
import type { Config, PuckContext } from '@puckeditor/core'
import { PuckHero } from './components/Hero'
import { PuckText } from './components/Text'
import { PuckImage } from './components/Image'
import { PuckAnimatedSection } from './components/AnimatedSection'

type PuckRenderProps = {
  id: string
  puck: PuckContext
  editMode?: boolean
  [key: string]: unknown
}

function RenderSlot({ content }: { content?: unknown }) {
  if (!content) return null
  const Slot = content as ComponentType
  return <Slot />
}

function cleanRenderProps(props: PuckRenderProps): Record<string, unknown> {
  const rest = { ...props }
  delete (rest as Record<string, unknown>).id
  delete (rest as Record<string, unknown>).puck
  delete (rest as Record<string, unknown>).editMode
  return rest
}


export const puckConfig = {
  root: {
    render: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
  categories: {
    content: {
      title: 'Content',
      components: ['Hero', 'Text', 'Image', 'AnimatedSection'],
      defaultExpanded: true,
    },
  },
  components: {
    Hero: {
      label: 'Hero',
      fields: {
        title: { type: 'text', label: 'Title' },
        subtitle: { type: 'textarea', label: 'Subtitle' },
        backgroundImage: { type: 'text', label: 'Background Image URL' },
        primaryCtaLabel: { type: 'text', label: 'Primary CTA Label' },
        primaryCtaHref: { type: 'text', label: 'Primary CTA Link' },
        secondaryCtaLabel: { type: 'text', label: 'Secondary CTA Label' },
        secondaryCtaHref: { type: 'text', label: 'Secondary CTA Link' },
        align: {
          type: 'radio',
          label: 'Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        overlayOpacity: { type: 'number', label: 'Overlay Opacity', min: 0, max: 1, step: 0.05 },
        minHeight: { type: 'text', label: 'Minimum Height' },
      },
      defaultProps: {
        title: 'Hero Title',
        align: 'center',
        overlayOpacity: 0.55,
        minHeight: '80vh',
      },
      render: (props: PuckRenderProps) => {
        const rest = cleanRenderProps(props)
        return <PuckHero {...rest} />
      },
    },
    Text: {
      label: 'Text Block',
      fields: {
        text: { type: 'textarea', label: 'Text' },
        label: { type: 'text', label: 'Section Label' },
        align: {
          type: 'radio',
          label: 'Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        maxWidth: {
          type: 'radio',
          label: 'Max Width',
          options: [
            { label: 'Narrow', value: 'narrow' },
            { label: 'Medium', value: 'medium' },
            { label: 'Wide', value: 'wide' },
            { label: 'Full', value: 'full' },
          ],
        },
        background: {
          type: 'radio',
          label: 'Background',
          options: [
            { label: 'Base', value: 'base' },
            { label: 'Surface', value: 'surface' },
            { label: 'Primary', value: 'primary' },
            { label: 'Dark', value: 'dark' },
          ],
        },
      },
      defaultProps: {
        text: 'Add your text here...',
        align: 'left',
        maxWidth: 'medium',
        background: 'base',
      },
      render: (props: PuckRenderProps) => {
        const rest = cleanRenderProps(props)
        return <PuckText {...rest} />
      },
    },
    Image: {
      label: 'Image',
      fields: {
        src: { type: 'text', label: 'Image URL' },
        alt: { type: 'text', label: 'Alt Text' },
        caption: { type: 'text', label: 'Caption' },
        aspectRatio: {
          type: 'radio',
          label: 'Aspect Ratio',
          options: [
            { label: 'Auto', value: 'auto' },
            { label: 'Square', value: 'square' },
            { label: 'Video', value: 'video' },
            { label: 'Wide', value: 'wide' },
            { label: 'Portrait', value: 'portrait' },
          ],
        },
        rounded: {
          type: 'radio',
          label: 'Rounded',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
            { label: 'Extra Large', value: 'xl' },
          ],
        },
        shadow: {
          type: 'radio',
          label: 'Shadow',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
        },
        maxWidth: {
          type: 'radio',
          label: 'Max Width',
          options: [
            { label: 'Narrow', value: 'narrow' },
            { label: 'Medium', value: 'medium' },
            { label: 'Wide', value: 'wide' },
            { label: 'Full', value: 'full' },
          ],
        },
      },
      defaultProps: {
        src: '/gallery/mountain/01_48.jpg',
        aspectRatio: 'auto',
        rounded: 'xl',
        shadow: true,
        maxWidth: 'wide',
      },
      render: (props: PuckRenderProps) => {
        const rest = cleanRenderProps(props)
        return <PuckImage {...rest} />
      },
    },
    AnimatedSection: {
      label: 'Animated Section',
      fields: {
        effect: {
          type: 'radio',
          label: 'Scroll Effect',
          options: [
            { label: 'Fade Up', value: 'fade-up' },
            { label: 'Parallax', value: 'parallax' },
            { label: 'Scale In', value: 'scale-in' },
          ],
        },
        speed: { type: 'number', label: 'Parallax Speed', min: 0, max: 2, step: 0.1 },
        backgroundColor: { type: 'text', label: 'Background Color' },
        verticalPadding: {
          type: 'radio',
          label: 'Vertical Padding',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
            { label: 'Extra Large', value: 'xl' },
          ],
        },
        content: { type: 'slot' },
      },
      defaultProps: {
        effect: 'fade-up',
        speed: 0.5,
        backgroundColor: 'var(--color-bg-base)',
        verticalPadding: 'xl',
      },
      render: (props: PuckRenderProps) => {
        const rest = cleanRenderProps(props)
        const content = rest.content as unknown
        delete rest.content
        return (
          <PuckAnimatedSection {...rest}>
            <RenderSlot content={content} />
          </PuckAnimatedSection>
        )
      },
    },
  },
} as Config

export default puckConfig
