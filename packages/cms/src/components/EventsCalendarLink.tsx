'use client'

import React from 'react'
import { Button, useConfig } from '@payloadcms/ui'

export default function EventsCalendarLink() {
  const { config } = useConfig()

  return (
    <Button
      buttonStyle="secondary"
      el="link"
      to={`${config.routes.admin}/collections/events/calendar`}
    >
      Calendar view
    </Button>
  )
}
