/**
 * CaseGrid Puzzle Loader Service
 * Asynchronously loads case metadata and full puzzles with in-memory caching.
 */

import {
  puzzleIndexSchema,
  puzzleSchema,
  validateWeeklySchedule,
  weeklyScheduleSchema,
  type Puzzle,
  type PuzzleMetadata,
  type WeeklySchedule,
} from '@casegrid/puzzle-engine'

const puzzleCache = new Map<string, Puzzle>()
let indexCache: PuzzleMetadata[] | null = null

export class CaseComingSoonError extends Error {
  readonly metadata: PuzzleMetadata

  constructor(metadata: PuzzleMetadata) {
    super(`${metadata.title} is coming soon.`)
    this.name = 'CaseComingSoonError'
    this.metadata = metadata
  }
}

export async function fetchPuzzleIndex(): Promise<PuzzleMetadata[]> {
  if (indexCache) {
    return indexCache
  }

  const response = await fetch('/puzzles/index.json')
  if (!response.ok) {
    throw new Error(`Failed to load puzzle catalog: HTTP ${response.status}`)
  }

  const data = await response.json()
  const parsed = puzzleIndexSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Puzzle catalog failed schema validation')
  }

  indexCache = parsed.data
  return parsed.data
}

/** Returns null when the schedule is missing, malformed, or references unpublished cases. */
export async function fetchWeeklySchedule(catalog: readonly PuzzleMetadata[]): Promise<WeeklySchedule | null> {
  try {
    const response = await fetch('/puzzles/schedule.json')
    if (!response.ok) return null
    const data: unknown = await response.json()
    if (validateWeeklySchedule(data, catalog).length > 0) return null
    return weeklyScheduleSchema.parse(data)
  } catch {
    return null
  }
}

export async function fetchPuzzle(caseId: string): Promise<Puzzle> {
  const metadata = (await fetchPuzzleIndex()).find((item) => item.id === caseId)
  if (!metadata) throw new Error(`Case "${caseId}" was not found`)
  if (metadata.availability === 'coming-soon') throw new CaseComingSoonError(metadata)

  const cached = puzzleCache.get(caseId)
  if (cached) {
    return cached
  }

  const response = await fetch(`/puzzles/${caseId}.json`)
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Case "${caseId}" was not found`)
    }
    throw new Error(`Failed to load case "${caseId}": HTTP ${response.status}`)
  }

  const data = await response.json()
  const parsed = puzzleSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Case "${caseId}" failed schema validation`)
  }

  const puzzle = parsed.data as Puzzle
  puzzleCache.set(caseId, puzzle)
  return puzzle
}
