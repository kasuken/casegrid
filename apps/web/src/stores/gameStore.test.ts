import { beforeEach, describe, expect, it } from 'vitest'
import { canUndo, MAX_UNDO_HISTORY, useGameStore } from './gameStore'
import type { Puzzle } from '@casegrid/puzzle-engine'

describe('gameStore', () => {
  const mockPuzzle: Puzzle = {
    id: 'case-test',
    title: 'Test Case',
    description: 'Test case description',
    difficulty: 'beginner',
    grid: { width: 3, height: 3 },
    areas: [
      {
        id: 'room1',
        name: 'Room 1',
        cells: [
          { row: 0, column: 0 },
          { row: 0, column: 1 },
        ],
      },
      {
        id: 'room2',
        name: 'Room 2',
        cells: [
          { row: 1, column: 0 },
          { row: 1, column: 1 },
        ],
      },
    ],
    objects: [
      {
        id: 'desk',
        type: 'desk',
        position: { row: 2, column: 2 },
      },
    ],
    characters: [
      { id: 'vic', name: 'Victim Vic', role: 'victim' },
      { id: 'sus1', name: 'Suspect One', role: 'suspect' },
      { id: 'sus2', name: 'Suspect Two', role: 'suspect' },
    ],
    clues: [
      {
        id: 'c1',
        text: 'Vic was at (0, 0)',
        constraint: {
          type: 'character_at_position',
          characterId: 'vic',
          position: { row: 0, column: 0 },
        },
      },
      {
        id: 'c2',
        text: 'Sus1 was at (0, 1)',
        constraint: {
          type: 'character_at_position',
          characterId: 'sus1',
          position: { row: 0, column: 1 },
        },
      },
      {
        id: 'c3',
        text: 'Sus2 was at (1, 0)',
        constraint: {
          type: 'character_at_position',
          characterId: 'sus2',
          position: { row: 1, column: 0 },
        },
      },
    ],
    victimId: 'vic',
    solution: {
      placements: {
        vic: { row: 0, column: 0 },
        sus1: { row: 0, column: 1 },
        sus2: { row: 1, column: 0 },
      },
      murdererId: 'sus1',
    },
  }

  beforeEach(() => {
    localStorage.clear()
    useGameStore.setState({
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
      history: [],
      revealedHelpIds: [],
    })
  })

  it('initializes in intro stage and starts investigation when commanded', () => {
    const store = useGameStore.getState()
    store.loadCase(mockPuzzle)

    expect(useGameStore.getState().stage).toBe('intro')
    expect(useGameStore.getState().isTimerRunning).toBe(false)

    useGameStore.getState().startInvestigation()
    expect(useGameStore.getState().stage).toBe('investigating')
    expect(useGameStore.getState().isTimerRunning).toBe(true)
  })

  it('restores in-progress state from saved progress', () => {
    const store = useGameStore.getState()
    store.loadCase(mockPuzzle, {
      puzzleId: 'case-test',
      status: 'in-progress',
      placements: { sus1: { row: 0, column: 1 } },
      exclusions: { sus1: [{ row: 1, column: 1 }] },
      solvedClueIds: ['c1'],
      elapsedSeconds: 45,
      mistakes: 1,
      bestTime: 120,
    })

    const state = useGameStore.getState()
    expect(state.stage).toBe('investigating')
    expect(state.placements.sus1).toEqual({ row: 0, column: 1 })
    expect(state.elapsedSeconds).toBe(45)
    expect(state.mistakes).toBe(1)
    expect(state.bestTime).toBe(120)
  })

  it('prevents placing characters on blocked object cells', () => {
    const store = useGameStore.getState()
    store.loadCase(mockPuzzle)
    store.startInvestigation()

    // Object is at (2, 2)
    store.placeCharacter('sus1', { row: 2, column: 2 })
    expect(useGameStore.getState().placements.sus1).toBeUndefined()
    expect(useGameStore.getState().feedback?.type).toBe('error')
  })

  it('toggles exclusions correctly without affecting placements', () => {
    const store = useGameStore.getState()
    store.loadCase(mockPuzzle)
    store.startInvestigation()

    store.toggleExclusion('sus1', { row: 1, column: 1 })
    expect(useGameStore.getState().exclusions.sus1).toEqual([{ row: 1, column: 1 }])

    // Toggle off
    store.toggleExclusion('sus1', { row: 1, column: 1 })
    expect(useGameStore.getState().exclusions.sus1).toEqual([])
  })

  it('handles solution checking and transitions to accusing when correct', () => {
    const store = useGameStore.getState()
    store.loadCase(mockPuzzle)
    store.startInvestigation()

    // Partially placed
    store.placeCharacter('vic', { row: 0, column: 0 })
    const check1 = store.checkSolution()
    expect(check1.success).toBe(false)
    expect(useGameStore.getState().stage).toBe('investigating')

    // Placed with conflict
    store.placeCharacter('sus1', { row: 1, column: 1 }) // wrong cell
    store.placeCharacter('sus2', { row: 1, column: 0 })
    const check2 = store.checkSolution()
    expect(check2.success).toBe(false)
    expect(useGameStore.getState().mistakes).toBe(1)

    // Placed correctly
    store.placeCharacter('sus1', { row: 0, column: 1 }) // correct cell
    const check3 = store.checkSolution()
    expect(check3.success).toBe(true)
    expect(useGameStore.getState().stage).toBe('accusing')
  })

  it('handles murderer accusation: increments mistakes if wrong, closes case if correct', () => {
    const store = useGameStore.getState()
    store.loadCase(mockPuzzle)
    store.startInvestigation()
    store.placeCharacter('vic', { row: 0, column: 0 })
    store.placeCharacter('sus1', { row: 0, column: 1 })
    store.placeCharacter('sus2', { row: 1, column: 0 })
    store.checkSolution()

    // Wrong accusation
    const accuseWrong = store.accuse('sus2')
    expect(accuseWrong.success).toBe(false)
    expect(useGameStore.getState().mistakes).toBe(1)
    expect(useGameStore.getState().stage).toBe('accusing')

    // Correct accusation
    const accuseRight = store.accuse('sus1')
    expect(accuseRight.success).toBe(true)
    expect(useGameStore.getState().stage).toBe('closed')
    expect(useGameStore.getState().isTimerRunning).toBe(false)
  })

  it('preserves faster existing bestTime on replay', () => {
    const store = useGameStore.getState()
    store.loadCase(mockPuzzle, {
      puzzleId: 'case-test',
      status: 'completed',
      placements: mockPuzzle.solution.placements,
      exclusions: {},
      solvedClueIds: [],
      elapsedSeconds: 50,
      mistakes: 0,
      bestTime: 40, // previous best was 40s
    })

    store.replayCase()
    expect(useGameStore.getState().elapsedSeconds).toBe(0)
    expect(useGameStore.getState().bestTime).toBe(40)

    // Solve again in 60s
    useGameStore.setState({ elapsedSeconds: 60 })
    store.placeCharacter('vic', { row: 0, column: 0 })
    store.placeCharacter('sus1', { row: 0, column: 1 })
    store.placeCharacter('sus2', { row: 1, column: 0 })
    store.checkSolution()
    store.accuse('sus1')

    // Best time remains 40, not replaced by 60
    expect(useGameStore.getState().bestTime).toBe(40)
  })

  describe('nudges', () => {
    const helpPuzzle: Puzzle = {
      ...mockPuzzle,
      helpPrompts: [
        { id: 'h1', text: 'Start with the exact cell.', clueIds: ['c1'] },
        { id: 'h2', text: 'Who else fits room 1?', clueIds: ['c2'] },
      ],
    }
    const s = () => useGameStore.getState()

    it('reveals authored nudges in order, one distinct prompt at a time', () => {
      s().loadCase(helpPuzzle)
      s().startInvestigation()
      s().revealNextHelp()
      expect(s().revealedHelpIds).toEqual(['h1'])
      s().revealNextHelp()
      s().revealNextHelp()
      s().revealNextHelp()
      expect(s().revealedHelpIds).toEqual(['h1', 'h2'])
    })

    it('never alters placements, notes, clue marks, mistakes, or history', () => {
      s().loadCase(helpPuzzle)
      s().startInvestigation()
      s().placeCharacter('sus1', { row: 1, column: 1 })
      s().toggleExclusion('sus2', { row: 0, column: 0 })
      s().toggleClueSolved('c3')
      const before = s()

      s().revealNextHelp()
      const after = s()
      expect(after.placements).toBe(before.placements)
      expect(after.exclusions).toBe(before.exclusions)
      expect(after.solvedClueIds).toBe(before.solvedClueIds)
      expect(after.mistakes).toBe(before.mistakes)
      expect(after.history).toBe(before.history)
    })

    it('persists the reveals and restores them, defaulting older saves to none', () => {
      s().loadCase(helpPuzzle)
      s().startInvestigation()
      s().revealNextHelp()
      const saved = JSON.parse(localStorage.getItem('casegrid_progress_v1_case-test') ?? '{}')
      expect(saved.revealedHelpIds).toEqual(['h1'])

      s().loadCase(helpPuzzle, saved)
      expect(s().revealedHelpIds).toEqual(['h1'])

      const { revealedHelpIds: _dropped, ...legacy } = saved
      s().loadCase(helpPuzzle, legacy)
      expect(s().revealedHelpIds).toEqual([])
    })

    it('keeps the count through completion and clears it on reset and replay', () => {
      s().loadCase(helpPuzzle)
      s().startInvestigation()
      s().revealNextHelp()
      s().placeCharacter('vic', { row: 0, column: 0 })
      s().placeCharacter('sus1', { row: 0, column: 1 })
      s().placeCharacter('sus2', { row: 1, column: 0 })
      s().checkSolution()
      s().accuse('sus1')
      expect(s().stage).toBe('closed')
      expect(s().revealedHelpIds).toEqual(['h1'])
      s().revealNextHelp()
      expect(s().revealedHelpIds).toEqual(['h1'])

      s().replayCase()
      expect(s().revealedHelpIds).toEqual([])
      s().revealNextHelp()
      s().resetCase()
      expect(s().revealedHelpIds).toEqual([])
    })

    it('does nothing for cases without authored nudges', () => {
      s().loadCase(mockPuzzle)
      s().startInvestigation()
      s().revealNextHelp()
      expect(s().revealedHelpIds).toEqual([])
    })
  })

  describe('undo', () => {
    const start = () => {
      useGameStore.getState().loadCase(mockPuzzle)
      useGameStore.getState().startInvestigation()
    }
    const s = () => useGameStore.getState()

    it('starts with nothing to undo', () => {
      start()
      expect(canUndo(s())).toBe(false)
      s().undo()
      expect(s().placements).toEqual({})
      expect(s().feedback).toBeNull()
    })

    it('restores the exact board before a placement, a move, and a removal', () => {
      start()
      s().placeCharacter('sus1', { row: 0, column: 0 })
      s().placeCharacter('sus1', { row: 1, column: 1 })
      s().unplaceCharacter('sus1')
      expect(s().placements.sus1).toBeUndefined()

      s().undo()
      expect(s().placements.sus1).toEqual({ row: 1, column: 1 })
      s().undo()
      expect(s().placements.sus1).toEqual({ row: 0, column: 0 })
      s().undo()
      expect(s().placements).toEqual({})
      expect(canUndo(s())).toBe(false)
    })

    it('brings back a character displaced by placing someone on their cell', () => {
      start()
      s().placeCharacter('sus1', { row: 0, column: 0 })
      s().placeCharacter('sus2', { row: 0, column: 0 })
      expect(s().placements).toEqual({ sus2: { row: 0, column: 0 } })

      s().undo()
      expect(s().placements).toEqual({ sus1: { row: 0, column: 0 } })
    })

    it('undoes exclusion notes and clue marks separately from placements', () => {
      start()
      s().placeCharacter('vic', { row: 0, column: 0 })
      s().toggleExclusion('sus1', { row: 1, column: 1 })
      s().toggleClueSolved('c1')

      s().undo()
      expect(s().solvedClueIds).toEqual([])
      expect(s().exclusions.sus1).toEqual([{ row: 1, column: 1 }])

      s().undo()
      expect(s().exclusions.sus1).toBeUndefined()
      expect(s().placements.vic).toEqual({ row: 0, column: 0 })
    })

    it('ignores rejected and unchanged actions', () => {
      start()
      s().placeCharacter('sus1', { row: 2, column: 2 }) // object cell
      s().unplaceCharacter('sus2') // not placed
      expect(s().history).toHaveLength(0)

      s().placeCharacter('sus1', { row: 0, column: 1 })
      s().placeCharacter('sus1', { row: 0, column: 1 }) // same cell
      expect(s().history).toHaveLength(1)
    })

    it('never changes mistakes, time, stage, or best time', () => {
      useGameStore.getState().loadCase(mockPuzzle, {
        puzzleId: 'case-test',
        status: 'in-progress',
        placements: {},
        exclusions: {},
        solvedClueIds: [],
        elapsedSeconds: 30,
        mistakes: 2,
        bestTime: 90,
      })
      s().placeCharacter('vic', { row: 0, column: 0 })
      s().placeCharacter('sus1', { row: 1, column: 1 })
      s().placeCharacter('sus2', { row: 1, column: 0 })
      s().checkSolution()
      expect(s().mistakes).toBe(3)

      useGameStore.setState({ elapsedSeconds: 55 })
      s().undo()
      expect(s().placements.sus2).toBeUndefined()
      expect(s().mistakes).toBe(3)
      expect(s().elapsedSeconds).toBe(55)
      expect(s().stage).toBe('investigating')
      expect(s().bestTime).toBe(90)
    })

    it('cannot undo a successful submission', () => {
      start()
      s().placeCharacter('vic', { row: 0, column: 0 })
      s().placeCharacter('sus1', { row: 0, column: 1 })
      s().placeCharacter('sus2', { row: 1, column: 0 })
      s().checkSolution()
      expect(s().stage).toBe('accusing')
      expect(canUndo(s())).toBe(false)

      s().undo()
      expect(s().placements.sus2).toEqual({ row: 1, column: 0 })
    })

    it('clears history on reset, replay, and loading a case', () => {
      start()
      s().placeCharacter('sus1', { row: 0, column: 1 })
      s().resetCase()
      expect(s().history).toHaveLength(0)

      s().placeCharacter('sus1', { row: 0, column: 1 })
      s().replayCase()
      expect(s().history).toHaveLength(0)

      s().placeCharacter('sus1', { row: 0, column: 1 })
      s().loadCase(mockPuzzle)
      expect(s().history).toHaveLength(0)
    })

    it('persists the restored board, not the history', () => {
      start()
      s().placeCharacter('sus1', { row: 0, column: 1 })
      s().placeCharacter('sus2', { row: 1, column: 0 })
      s().undo()

      const saved = JSON.parse(localStorage.getItem('casegrid_progress_v1_case-test') ?? '{}')
      expect(saved.placements).toEqual({ sus1: { row: 0, column: 1 } })
      expect(saved.history).toBeUndefined()
    })

    it('keeps a bounded history', () => {
      start()
      for (let i = 0; i < MAX_UNDO_HISTORY + 20; i++) {
        s().toggleClueSolved('c1')
      }
      expect(s().history).toHaveLength(MAX_UNDO_HISTORY)
    })
  })
})
