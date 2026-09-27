/**
 * CaseGrid Game Store
 * Zustand state management for active investigation, interactions, and persistence sync.
 */

import { create } from 'zustand'
import {
  checkClueConflicts,
  determineMurdererId,
  isCellBlockedByObject,
  isPositionEqual,
  type Position,
  type Puzzle,
  type PuzzleProgress,
} from '@casegrid/puzzle-engine'
import { clearProgress, saveProgress } from '../services/progressStorage'

export type GameStage = 'intro' | 'investigating' | 'accusing' | 'closed'
export type InteractionMode = 'place' | 'exclude'

export interface GameFeedback {
  readonly message: string
  readonly type: 'info' | 'error' | 'success'
}

interface GameState {
  readonly puzzle: Puzzle | null
  readonly stage: GameStage
  readonly placements: Record<string, Position>
  readonly exclusions: Record<string, readonly Position[]>
  readonly solvedClueIds: string[]
  readonly selectedCharacterId: string | null
  readonly interactionMode: InteractionMode
  readonly elapsedSeconds: number
  readonly isTimerRunning: boolean
  readonly mistakes: number
  readonly bestTime?: number
  readonly feedback: GameFeedback | null

  // Actions
  loadCase: (puzzle: Puzzle, savedProgress?: PuzzleProgress | null) => void
  startInvestigation: () => void
  selectCharacter: (id: string | null) => void
  setInteractionMode: (mode: InteractionMode) => void
  placeCharacter: (characterId: string, position: Position) => void
  unplaceCharacter: (characterId: string) => void
  toggleExclusion: (characterId: string, position: Position) => void
  toggleClueSolved: (clueId: string) => void
  tickTimer: () => void
  setTimerRunning: (running: boolean) => void
  checkSolution: () => { success: boolean; conflicts: number }
  accuse: (suspectId: string) => { success: boolean; explanation?: string }
  resetCase: () => void
  replayCase: () => void
  clearFeedback: () => void
}

function syncProgress(state: GameState): void {
  if (!state.puzzle) return

  const status =
    state.stage === 'closed'
      ? 'completed'
      : state.stage === 'intro'
        ? 'not-started'
        : 'in-progress'

  saveProgress({
    puzzleId: state.puzzle.id,
    status,
    placements: state.placements,
    exclusions: state.exclusions,
    solvedClueIds: state.solvedClueIds,
    elapsedSeconds: state.elapsedSeconds,
    mistakes: state.mistakes,
    bestTime: state.bestTime,
  })
}

export const useGameStore = create<GameState>((set, get) => ({
  puzzle: null,
  stage: 'intro',
  placements: {},
  exclusions: {},
  solvedClueIds: [],
  selectedCharacterId: null,
  interactionMode: 'place',
  elapsedSeconds: 0,
  isTimerRunning: false,
  mistakes: 0,
  bestTime: undefined,
  feedback: null,

  loadCase: (puzzle, savedProgress) => {
    if (savedProgress && savedProgress.status === 'in-progress') {
      set({
        puzzle,
        stage: 'investigating',
        placements: { ...savedProgress.placements },
        exclusions: { ...savedProgress.exclusions },
        solvedClueIds: [...savedProgress.solvedClueIds],
        selectedCharacterId: null,
        interactionMode: 'place',
        elapsedSeconds: savedProgress.elapsedSeconds,
        isTimerRunning: true,
        mistakes: savedProgress.mistakes,
        bestTime: savedProgress.bestTime,
        feedback: null,
      })
    } else if (savedProgress && savedProgress.status === 'completed') {
      set({
        puzzle,
        stage: 'closed',
        placements: { ...savedProgress.placements },
        exclusions: { ...savedProgress.exclusions },
        solvedClueIds: [...savedProgress.solvedClueIds],
        selectedCharacterId: null,
        interactionMode: 'place',
        elapsedSeconds: savedProgress.elapsedSeconds,
        isTimerRunning: false,
        mistakes: savedProgress.mistakes,
        bestTime: savedProgress.bestTime,
        feedback: null,
      })
    } else {
      set({
        puzzle,
        stage: 'intro',
        placements: {},
        exclusions: {},
        solvedClueIds: [],
        selectedCharacterId: null,
        interactionMode: 'place',
        elapsedSeconds: 0,
        isTimerRunning: false,
        mistakes: 0,
        bestTime: savedProgress?.bestTime,
        feedback: null,
      })
    }
  },

  startInvestigation: () => {
    set({
      stage: 'investigating',
      isTimerRunning: true,
      feedback: null,
    })
    syncProgress(get())
  },

  selectCharacter: (id) => {
    set({ selectedCharacterId: id, feedback: null })
  },

  setInteractionMode: (mode) => {
    set({ interactionMode: mode })
  },

  placeCharacter: (characterId, position) => {
    const { puzzle, placements } = get()
    if (!puzzle) return

    // Cannot place on an object cell
    if (isCellBlockedByObject(position, puzzle.objects)) {
      set({
        feedback: {
          message: 'That cell is blocked by an environmental object.',
          type: 'error',
        },
      })
      return
    }

    const nextPlacements = { ...placements }

    // If another character is already in this cell, remove or swap them
    for (const [existingCharId, pos] of Object.entries(nextPlacements)) {
      if (existingCharId !== characterId && isPositionEqual(pos, position)) {
        delete nextPlacements[existingCharId]
      }
    }

    nextPlacements[characterId] = position

    set({
      placements: nextPlacements,
      feedback: null,
    })
    syncProgress(get())
  },

  unplaceCharacter: (characterId) => {
    const { placements } = get()
    if (!placements[characterId]) return

    const next = { ...placements }
    delete next[characterId]

    set({ placements: next, feedback: null })
    syncProgress(get())
  },

  toggleExclusion: (characterId, position) => {
    const { exclusions } = get()
    const charExclusions = exclusions[characterId] ? [...exclusions[characterId]] : []
    const existingIndex = charExclusions.findIndex((p) => isPositionEqual(p, position))

    if (existingIndex >= 0) {
      charExclusions.splice(existingIndex, 1)
    } else {
      charExclusions.push(position)
    }

    set({
      exclusions: {
        ...exclusions,
        [characterId]: charExclusions,
      },
    })
    syncProgress(get())
  },

  toggleClueSolved: (clueId) => {
    const { solvedClueIds } = get()
    const next = solvedClueIds.includes(clueId)
      ? solvedClueIds.filter((id) => id !== clueId)
      : [...solvedClueIds, clueId]

    set({ solvedClueIds: next })
    syncProgress(get())
  },

  tickTimer: () => {
    const { isTimerRunning, stage, elapsedSeconds } = get()
    if (!isTimerRunning || stage !== 'investigating') return

    const nextTime = elapsedSeconds + 1
    set({ elapsedSeconds: nextTime })

    // Auto-sync progress every 5 seconds to reduce localStorage writes
    if (nextTime % 5 === 0) {
      syncProgress(get())
    }
  },

  setTimerRunning: (running) => {
    set({ isTimerRunning: running })
  },

  checkSolution: () => {
    const { puzzle, placements, mistakes } = get()
    if (!puzzle) return { success: false, conflicts: 0 }

    // Check if all characters are placed
    const placedCount = Object.keys(placements).length
    const totalCount = puzzle.characters.length

    if (placedCount < totalCount) {
      const remaining = totalCount - placedCount
      set({
        feedback: {
          message: `Place all characters before checking. (${remaining} remaining)`,
          type: 'info',
        },
      })
      return { success: false, conflicts: remaining }
    }

    const { count: conflicts } = checkClueConflicts(placements, puzzle)

    if (conflicts === 0) {
      set({
        stage: 'accusing',
        feedback: {
          message: 'All characters are placed correctly! Now, identify the murderer.',
          type: 'success',
        },
      })
      syncProgress(get())
      return { success: true, conflicts: 0 }
    }

    const newMistakes = mistakes + 1
    set({
      mistakes: newMistakes,
      feedback: {
        message: `Something is not quite right. ${conflicts} placement${conflicts === 1 ? '' : 's'} still conflict with the clues.`,
        type: 'error',
      },
    })
    syncProgress(get())
    return { success: false, conflicts }
  },

  accuse: (suspectId) => {
    const { puzzle, placements, elapsedSeconds, bestTime, mistakes } = get()
    if (!puzzle) return { success: false }

    const suspect = puzzle.characters.find((c) => c.id === suspectId)
    if (!suspect || suspect.role !== 'suspect') {
      return { success: false, explanation: 'Invalid suspect' }
    }

    const correctMurdererId =
      determineMurdererId(puzzle, placements) ?? puzzle.solution.murdererId

    if (suspectId === correctMurdererId) {
      const newBest = bestTime !== undefined ? Math.min(bestTime, elapsedSeconds) : elapsedSeconds
      const victim = puzzle.characters.find((c) => c.id === puzzle.victimId)
      const victimName = victim?.name ?? 'the victim'
      const suspectName = suspect.name

      set({
        stage: 'closed',
        isTimerRunning: false,
        bestTime: newBest,
        feedback: {
          message: `CASE CLOSED. ${suspectName} was alone with ${victimName}.`,
          type: 'success',
        },
      })
      syncProgress(get())
      return {
        success: true,
        explanation: `${suspectName} was alone with ${victimName}.`,
      }
    }

    const newMistakes = mistakes + 1
    set({
      mistakes: newMistakes,
      feedback: {
        message: 'That does not fit the evidence. Review the scene and try again.',
        type: 'error',
      },
    })
    syncProgress(get())
    return {
      success: false,
      explanation: 'That does not fit the evidence. Review the scene and try again.',
    }
  },

  resetCase: () => {
    const { puzzle, bestTime } = get()
    if (!puzzle) return

    clearProgress(puzzle.id)
    set({
      stage: 'investigating',
      placements: {},
      exclusions: {},
      solvedClueIds: [],
      selectedCharacterId: null,
      interactionMode: 'place',
      elapsedSeconds: 0,
      isTimerRunning: true,
      mistakes: 0,
      bestTime,
      feedback: null,
    })
    syncProgress(get())
  },

  replayCase: () => {
    const { puzzle, bestTime } = get()
    if (!puzzle) return

    set({
      stage: 'investigating',
      placements: {},
      exclusions: {},
      solvedClueIds: [],
      selectedCharacterId: null,
      interactionMode: 'place',
      elapsedSeconds: 0,
      isTimerRunning: true,
      mistakes: 0,
      bestTime,
      feedback: null,
    })
    syncProgress(get())
  },

  clearFeedback: () => set({ feedback: null }),
}))
