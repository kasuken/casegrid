import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'
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
})
