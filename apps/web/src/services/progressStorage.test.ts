import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearProgress,
  loadProgress,
  saveProgress,
} from './progressStorage'
import type { PuzzleProgress } from '@casegrid/puzzle-engine'

describe('progressStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads valid puzzle progress', () => {
    const progress: PuzzleProgress = {
      puzzleId: 'case-001',
      status: 'in-progress',
      placements: { evelyn: { row: 0, column: 0 } },
      exclusions: { evelyn: [{ row: 1, column: 1 }] },
      solvedClueIds: ['clue-1'],
      elapsedSeconds: 42,
      mistakes: 1,
      bestTime: 95,
    }

    saveProgress(progress)
    const loaded = loadProgress('case-001')
    expect(loaded).toEqual(progress)
  })

  it('safely recovers from corrupted localStorage data without crashing', () => {
    localStorage.setItem('casegrid_progress_v1_case-001', 'NOT_VALID_JSON{:::')
    const loaded = loadProgress('case-001')
    expect(loaded).toBeNull()
  })

  it('safely recovers from schema-violating localStorage data', () => {
    localStorage.setItem(
      'casegrid_progress_v1_case-001',
      JSON.stringify({ puzzleId: 'case-001', elapsedSeconds: -100 }), // missing fields and negative time
    )
    const loaded = loadProgress('case-001')
    expect(loaded).toBeNull()
  })

  it('loads older saves that predate nudges and timestamps', () => {
    const legacy = {
      puzzleId: 'case-001',
      status: 'in-progress',
      placements: {},
      exclusions: {},
      solvedClueIds: [],
      elapsedSeconds: 12,
      mistakes: 0,
    }
    localStorage.setItem('casegrid_progress_v1_case-001', JSON.stringify(legacy))
    const loaded = loadProgress('case-001')
    expect(loaded).toEqual(legacy)
    expect(loaded?.revealedHelpIds).toBeUndefined()
  })

  it('round-trips revealed nudges and the last-updated time', () => {
    const progress: PuzzleProgress = {
      puzzleId: 'case-001',
      status: 'completed',
      placements: {},
      exclusions: {},
      solvedClueIds: [],
      elapsedSeconds: 12,
      mistakes: 0,
      revealedHelpIds: ['nudge-1', 'nudge-2'],
      updatedAt: 1_700_000_000_000,
    }
    saveProgress(progress)
    expect(loadProgress('case-001')).toEqual(progress)
  })

  it('clears progress correctly', () => {
    const progress: PuzzleProgress = {
      puzzleId: 'case-001',
      status: 'in-progress',
      placements: {},
      exclusions: {},
      solvedClueIds: [],
      elapsedSeconds: 10,
      mistakes: 0,
    }
    saveProgress(progress)
    clearProgress('case-001')
    expect(loadProgress('case-001')).toBeNull()
  })
})
