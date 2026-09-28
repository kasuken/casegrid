/**
 * CaseGrid Puzzle Engine - Weekly Schedule
 * Pure date logic for the Case of the Week. One global boundary: Monday 00:00 UTC.
 */

import { weeklyScheduleSchema } from './schemas.ts'
import type { PuzzleMetadata, ScheduledWeek, ValidationIssue, WeeklySchedule } from './types.ts'

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/** Parses YYYY-MM-DD as midnight UTC, independent of the local timezone. */
export function parseWeekStart(value: string): number {
  const [year, month, day] = value.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

function isRealMonday(value: string): boolean {
  const time = parseWeekStart(value)
  const date = new Date(time)
  return (
    !Number.isNaN(time) &&
    date.toISOString().slice(0, 10) === value &&
    date.getUTCDay() === 1
  )
}

export type FeaturedCaseResult =
  | { readonly kind: 'featured'; readonly week: ScheduledWeek; readonly startsAt: number; readonly endsAt: number }
  | { readonly kind: 'not-started' }
  | { readonly kind: 'gap' }
  | { readonly kind: 'exhausted' }

export function selectFeaturedCase(schedule: WeeklySchedule, now: number): FeaturedCaseResult {
  const weeks = [...schedule.weeks].sort((a, b) => parseWeekStart(a.weekStart) - parseWeekStart(b.weekStart))
  if (weeks.length === 0) return { kind: 'exhausted' }
  if (now < parseWeekStart(weeks[0].weekStart)) return { kind: 'not-started' }

  for (const week of weeks) {
    const startsAt = parseWeekStart(week.weekStart)
    if (now >= startsAt && now < startsAt + WEEK_MS) {
      return { kind: 'featured', week, startsAt, endsAt: startsAt + WEEK_MS }
    }
  }

  const last = parseWeekStart(weeks[weeks.length - 1].weekStart)
  return now >= last + WEEK_MS ? { kind: 'exhausted' } : { kind: 'gap' }
}

/** Checks shape, Monday alignment, ordering, and that every week features a published case. */
export function validateWeeklySchedule(
  raw: unknown,
  catalog: readonly PuzzleMetadata[],
): ValidationIssue[] {
  const parsed = weeklyScheduleSchema.safeParse(raw)
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => ({
      code: 'SCHEDULE_SCHEMA_ERROR',
      message: `${issue.path.join('.')}: ${issue.message}`,
    }))
  }

  const errors: ValidationIssue[] = []
  let previous = Number.NEGATIVE_INFINITY
  for (const week of parsed.data.weeks) {
    if (!isRealMonday(week.weekStart)) {
      errors.push({ code: 'SCHEDULE_NOT_MONDAY', message: `Week start ${week.weekStart} is not a Monday` })
    }
    const time = parseWeekStart(week.weekStart)
    if (time <= previous) {
      errors.push({ code: 'SCHEDULE_NOT_ASCENDING', message: `Week ${week.weekStart} is out of order or duplicated` })
    }
    previous = time

    const meta = catalog.find((entry) => entry.id === week.caseId)
    if (!meta) {
      errors.push({ code: 'SCHEDULE_UNKNOWN_CASE', message: `Week ${week.weekStart} features unknown case "${week.caseId}"` })
    } else if (meta.availability === 'coming-soon') {
      errors.push({ code: 'SCHEDULE_UNPUBLISHED_CASE', message: `Week ${week.weekStart} features unpublished case "${week.caseId}"` })
    }
  }
  return errors
}
