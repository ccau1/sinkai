import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'

import './index.scss'

const DAY_MS = 24 * 60 * 60 * 1000

type CalendarEvent = {
  id: number | string
  title: string
  start: number // UTC timestamp of the day
  end: number // UTC timestamp of the day
}

type Placement = {
  event: CalendarEvent
  startCol: number // 0-6
  span: number
  lane: number
}

function dayUTC(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function toMonthParam(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Assign each event a column span and a non-overlapping lane within one week row. */
function placeEvents(events: CalendarEvent[], weekStart: number): Placement[] {
  const laneEnds: number[] = []
  const placements: Placement[] = []

  for (const event of events) {
    const startIdx = Math.round((event.start - weekStart) / DAY_MS)
    const endIdx = Math.round((event.end - weekStart) / DAY_MS)
    if (endIdx < 0 || startIdx > 6) continue

    const startCol = Math.max(0, startIdx)
    const endCol = Math.min(6, endIdx)

    let lane = laneEnds.findIndex((end) => end < startCol)
    if (lane === -1) {
      laneEnds.push(endCol)
      lane = laneEnds.length - 1
    } else {
      laneEnds[lane] = endCol
    }

    placements.push({ event, startCol, span: endCol - startCol + 1, lane })
  }

  return placements
}

const MAX_LANES = 3

export default async function EventsCalendarView({
  payload,
  searchParams,
  locale,
}: AdminViewServerProps) {
  const adminRoute = payload.config.routes.admin
  const localeTag = locale?.code || 'en'

  // Resolve which month to show (?month=YYYY-MM), defaulting to the current month.
  const monthParam = typeof searchParams?.month === 'string' ? searchParams.month : undefined
  let year: number
  let month: number // 0-based
  const monthMatch = monthParam?.match(/^(\d{4})-(\d{2})$/)
  if (monthMatch) {
    year = Number(monthMatch[1])
    month = Number(monthMatch[2]) - 1
  } else {
    const now = new Date()
    year = now.getUTCFullYear()
    month = now.getUTCMonth()
  }

  const firstOfMonth = Date.UTC(year, month, 1)
  const firstOfNextMonth = Date.UTC(year, month + 1, 1)

  const result = await payload.find({
    collection: 'events',
    depth: 0,
    limit: 200,
    sort: 'startDate',
    locale: localeTag as 'en',
    select: {
      title: true,
      startDate: true,
      endDate: true,
    },
    where: {
      and: [
        { startDate: { less_than: new Date(firstOfNextMonth).toISOString() } },
        {
          or: [
            { endDate: { greater_than_equal: new Date(firstOfMonth).toISOString() } },
            { endDate: { exists: false } },
          ],
        },
      ],
    },
  })

  const events: CalendarEvent[] = result.docs
    .filter((doc) => doc.startDate)
    .map((doc) => {
      const start = dayUTC(new Date(doc.startDate as string))
      const end = doc.endDate ? dayUTC(new Date(doc.endDate as string)) : start
      return {
        id: doc.id,
        title: (doc.title as string) || `Event ${doc.id}`,
        start,
        end: end >= start ? end : start,
      }
    })

  // Build the weeks that cover this month (Sunday-first grid).
  const weeks: number[][] = []
  const gridStart = firstOfMonth - new Date(firstOfMonth).getUTCDay() * DAY_MS
  for (
    let weekStart = gridStart;
    weekStart < firstOfNextMonth || new Date(weekStart).getUTCDay() !== 0;
    weekStart += 7 * DAY_MS
  ) {
    weeks.push(Array.from({ length: 7 }, (_, i) => weekStart + i * DAY_MS))
  }

  const monthLabel = new Intl.DateTimeFormat(localeTag, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(firstOfMonth))

  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    // 2023-01-01 was a Sunday.
    new Intl.DateTimeFormat(localeTag, { weekday: 'short', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2023, 0, 1 + i)),
    ),
  )

  const today = dayUTC(new Date())

  const calendarHref = (date: Date) =>
    formatAdminURL({
      adminRoute,
      path: `/collections/events/calendar?month=${toMonthParam(date)}`,
    })

  const listHref = formatAdminURL({ adminRoute, path: '/collections/events' })

  return (
    <div className="events-calendar">
      <div className="events-calendar__header">
        <h1 className="events-calendar__title">{monthLabel}</h1>
        <nav className="events-calendar__nav">
          <a
            className="events-calendar__nav-link"
            href={calendarHref(new Date(Date.UTC(year, month - 1, 1)))}
          >
            &larr; Prev
          </a>
          <a className="events-calendar__nav-link" href={calendarHref(new Date())}>
            Today
          </a>
          <a
            className="events-calendar__nav-link"
            href={calendarHref(new Date(Date.UTC(year, month + 1, 1)))}
          >
            Next &rarr;
          </a>
          <a
            className="events-calendar__nav-link events-calendar__nav-link--list"
            href={listHref}
          >
            List view
          </a>
        </nav>
      </div>

      <div className="events-calendar__weekdays">
        {weekdayLabels.map((label) => (
          <div className="events-calendar__weekday" key={label}>
            {label}
          </div>
        ))}
      </div>

      {weeks.map((week) => {
        const placements = placeEvents(events, week[0])
        const visible = placements.filter((p) => p.lane < MAX_LANES)
        const hiddenCount = placements.length - visible.length

        return (
          <div className="events-calendar__week" key={week[0]}>
            {week.map((day, i) => (
              <div
                className={[
                  'events-calendar__day',
                  new Date(day).getUTCMonth() !== month ? 'events-calendar__day--outside' : '',
                  day === today ? 'events-calendar__day--today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={day}
                style={{ gridColumn: i + 1, gridRow: 1 }}
              >
                {new Date(day).getUTCDate()}
              </div>
            ))}
            {visible.map((p) => (
              <a
                className="events-calendar__event"
                href={formatAdminURL({ adminRoute, path: `/collections/events/${p.event.id}` })}
                key={String(p.event.id)}
                style={{ gridColumn: `${p.startCol + 1} / span ${p.span}`, gridRow: p.lane + 2 }}
                title={p.event.title}
              >
                {p.event.title}
              </a>
            ))}
            {hiddenCount > 0 && (
              <a
                className="events-calendar__more"
                href={listHref}
                style={{ gridColumn: '1 / -1', gridRow: MAX_LANES + 2 }}
              >
                +{hiddenCount} more
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
