import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  parseWeekStart,
  puzzleIndexSchema,
  selectFeaturedCase,
  validatePuzzle,
  validateWeeklySchedule,
  WEEK_MS,
  type PuzzleMetadata,
  type WeeklySchedule,
} from '../src/index.ts'

const puzzlesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../apps/web/public/puzzles')

const catalog: PuzzleMetadata[] = [
  { id: 'a', title: 'A', difficulty: 'easy', suspectCount: 5, availability: 'available' },
  { id: 'b', title: 'B', difficulty: 'easy', suspectCount: 5, availability: 'available' },
  { id: 'soon', title: 'Soon', difficulty: 'hard', suspectCount: 6, availability: 'coming-soon' },
]

const schedule: WeeklySchedule = {
  weeks: [
    { weekStart: '2026-09-21', caseId: 'a' },
    { weekStart: '2026-09-28', caseId: 'b' },
  ],
}

const utc = (iso: string) => Date.parse(iso)

describe('weekly schedule selection', () => {
  it('parses week starts as midnight UTC regardless of local timezone', () => {
    expect(parseWeekStart('2026-09-21')).toBe(utc('2026-09-21T00:00:00Z'))
  })

  it('switches exactly at Monday 00:00 UTC', () => {
    const before = selectFeaturedCase(schedule, utc('2026-09-27T23:59:59.999Z'))
    const after = selectFeaturedCase(schedule, utc('2026-09-28T00:00:00.000Z'))
    expect(before.kind === 'featured' && before.week.caseId).toBe('a')
    expect(after.kind === 'featured' && after.week.caseId).toBe('b')
  })

  it('gives every visitor the same case for the whole week, whatever their offset', () => {
    // Sunday evening in Los Angeles is already Monday in UTC
    const la = selectFeaturedCase(schedule, utc('2026-09-27T17:30:00-07:00'))
    const tokyo = selectFeaturedCase(schedule, utc('2026-09-28T09:30:00+09:00'))
    expect(la.kind === 'featured' && la.week.caseId).toBe('b')
    expect(tokyo.kind === 'featured' && tokyo.week.caseId).toBe('b')
  })

  it('reports the week window', () => {
    const result = selectFeaturedCase(schedule, utc('2026-09-23T12:00:00Z'))
    expect(result).toMatchObject({ kind: 'featured', startsAt: utc('2026-09-21T00:00:00Z'), endsAt: utc('2026-09-21T00:00:00Z') + WEEK_MS })
  })

  it('falls back before the first week, in gaps, and once the schedule runs out', () => {
    expect(selectFeaturedCase(schedule, utc('2026-09-20T23:59:59Z')).kind).toBe('not-started')
    expect(selectFeaturedCase(schedule, utc('2026-10-05T00:00:00Z')).kind).toBe('exhausted')
    expect(selectFeaturedCase({ weeks: [] }, utc('2026-10-05T00:00:00Z')).kind).toBe('exhausted')
    const gappy: WeeklySchedule = {
      weeks: [
        { weekStart: '2026-09-21', caseId: 'a' },
        { weekStart: '2026-10-05', caseId: 'b' },
      ],
    }
    expect(selectFeaturedCase(gappy, utc('2026-09-30T00:00:00Z')).kind).toBe('gap')
  })
})

describe('weekly schedule validation', () => {
  it('accepts Monday-aligned, ascending weeks of published cases', () => {
    expect(validateWeeklySchedule(schedule, catalog)).toEqual([])
  })

  it('rejects malformed data, non-Mondays, impossible dates, and bad ordering', () => {
    expect(validateWeeklySchedule({ weeks: [{ weekStart: 'next week', caseId: 'a' }] }, catalog)[0].code).toBe('SCHEDULE_SCHEMA_ERROR')
    const codes = validateWeeklySchedule(
      {
        weeks: [
          { weekStart: '2026-09-28', caseId: 'a' },
          { weekStart: '2026-09-22', caseId: 'b' },
          { weekStart: '2026-02-30', caseId: 'b' },
        ],
      },
      catalog,
    ).map((issue) => issue.code)
    expect(codes).toContain('SCHEDULE_NOT_MONDAY')
    expect(codes).toContain('SCHEDULE_NOT_ASCENDING')
  })

  it('rejects unknown and unpublished cases', () => {
    const codes = validateWeeklySchedule(
      {
        weeks: [
          { weekStart: '2026-09-21', caseId: 'missing' },
          { weekStart: '2026-09-28', caseId: 'soon' },
        ],
      },
      catalog,
    ).map((issue) => issue.code)
    expect(codes).toEqual(['SCHEDULE_UNKNOWN_CASE', 'SCHEDULE_UNPUBLISHED_CASE'])
  })
})

describe('bundled schedule', () => {
  const bundledCatalog = puzzleIndexSchema.parse(JSON.parse(fs.readFileSync(path.join(puzzlesDir, 'index.json'), 'utf-8')))
  const bundled = JSON.parse(fs.readFileSync(path.join(puzzlesDir, 'schedule.json'), 'utf-8')) as WeeklySchedule

  it('is valid and prepares at least four weeks', () => {
    expect(validateWeeklySchedule(bundled, bundledCatalog)).toEqual([])
    expect(bundled.weeks.length).toBeGreaterThanOrEqual(4)
  })

  it('only features cases that pass full uniqueness validation', () => {
    for (const week of bundled.weeks) {
      const raw = JSON.parse(fs.readFileSync(path.join(puzzlesDir, `${week.caseId}.json`), 'utf-8'))
      expect(validatePuzzle(raw).valid, week.caseId).toBe(true)
    }
  })
})
