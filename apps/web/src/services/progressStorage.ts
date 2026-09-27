/**
 * CaseGrid Progress Persistence Service
 * Resilient localStorage persistence with safe schema fallback.
 */

import {
  puzzleProgressSchema,
  type PuzzleProgress,
} from '@casegrid/puzzle-engine'

const STORAGE_PREFIX = 'casegrid_progress_v1_'

export function getStorageKey(puzzleId: string): string {
  return `${STORAGE_PREFIX}${puzzleId}`
}

export function loadProgress(puzzleId: string): PuzzleProgress | null {
  try {
    const raw = localStorage.getItem(getStorageKey(puzzleId))
    if (!raw) return null

    const parsed = JSON.parse(raw)
    const result = puzzleProgressSchema.safeParse(parsed)
    if (!result.success) {
      console.warn(`Corrupt or outdated progress for ${puzzleId}, resetting:`, result.error)
      return null
    }
    return result.data
  } catch (err) {
    console.warn(`Error reading localStorage for ${puzzleId}:`, err)
    return null
  }
}

export function saveProgress(progress: PuzzleProgress): void {
  try {
    const valid = puzzleProgressSchema.safeParse(progress)
    if (valid.success) {
      localStorage.setItem(getStorageKey(progress.puzzleId), JSON.stringify(valid.data))
    }
  } catch (err) {
    console.warn(`Error writing progress to localStorage:`, err)
  }
}

export function clearProgress(puzzleId: string): void {
  try {
    localStorage.removeItem(getStorageKey(puzzleId))
  } catch (err) {
    console.warn(`Error clearing progress from localStorage:`, err)
  }
}
