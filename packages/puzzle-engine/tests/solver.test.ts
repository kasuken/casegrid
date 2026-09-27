import { describe, expect, it } from 'vitest'
import {
  solvePuzzle,
  type Puzzle,
} from '../src/index.ts'

describe('backtracking solver', () => {
  const basePuzzle: Puzzle = {
    id: 'case-test',
    title: 'Test Mystery',
    description: 'A test puzzle',
    difficulty: 'beginner',
    grid: { width: 3, height: 3 },
    areas: [
      {
        id: 'office',
        name: 'Office',
        cells: [
          { row: 0, column: 0 },
          { row: 0, column: 1 },
        ],
      },
      {
        id: 'vault',
        name: 'Vault',
        cells: [
          { row: 1, column: 0 },
          { row: 1, column: 1 },
        ],
      },
    ],
    objects: [
      {
        id: 'safe',
        type: 'safe',
        position: { row: 2, column: 2 },
      },
    ],
    characters: [
      { id: 'victor', name: 'Victor', role: 'victim' },
      { id: 'sam', name: 'Sam', role: 'suspect' },
      { id: 'tina', name: 'Tina', role: 'suspect' },
    ],
    clues: [],
    victimId: 'victor',
    solution: {
      placements: {
        victor: { row: 0, column: 0 },
        sam: { row: 0, column: 1 },
        tina: { row: 1, column: 0 },
      },
      murdererId: 'sam',
    },
  }

  it('solves a uniquely constrained puzzle in well under 500 ms', () => {
    const uniquePuzzle: Puzzle = {
      ...basePuzzle,
      clues: [
        {
          id: 'c1',
          text: 'Victor was at (0, 0)',
          constraint: {
            type: 'character_at_position',
            characterId: 'victor',
            position: { row: 0, column: 0 },
          },
        },
        {
          id: 'c2',
          text: 'Sam was in the office',
          constraint: {
            type: 'character_in_area',
            characterId: 'sam',
            areaId: 'office',
          },
        },
        {
          id: 'c3',
          text: 'Tina was at (1, 0)',
          constraint: {
            type: 'character_at_position',
            characterId: 'tina',
            position: { row: 1, column: 0 },
          },
        },
      ],
    }

    const start = performance.now()
    const result = solvePuzzle(uniquePuzzle)
    const elapsed = performance.now() - start

    expect(result.solutionCount).toBe(1)
    expect(result.isUnique).toBe(true)
    expect(result.solution?.placements).toEqual({
      victor: { row: 0, column: 0 },
      sam: { row: 0, column: 1 },
      tina: { row: 1, column: 0 },
    })
    expect(result.solution?.murdererId).toBe('sam')
    expect(elapsed).toBeLessThan(100) // target < 500ms
  })

  it('detects multiple solutions and stops at 2', () => {
    // Underconstrained: Tina can be placed on multiple cells
    const underconstrainedPuzzle: Puzzle = {
      ...basePuzzle,
      clues: [
        {
          id: 'c1',
          text: 'Victor is at (0, 0)',
          constraint: {
            type: 'character_at_position',
            characterId: 'victor',
            position: { row: 0, column: 0 },
          },
        },
        {
          id: 'c2',
          text: 'Sam is in the office',
          constraint: {
            type: 'character_in_area',
            characterId: 'sam',
            areaId: 'office',
          },
        },
      ],
    }

    const result = solvePuzzle(underconstrainedPuzzle)
    expect(result.solutionCount).toBe(2)
    expect(result.isUnique).toBe(false)
  })

  it('detects impossible puzzles with 0 solutions', () => {
    // Contradictory clues
    const impossiblePuzzle: Puzzle = {
      ...basePuzzle,
      clues: [
        {
          id: 'c1',
          text: 'Victor is at (0, 0)',
          constraint: {
            type: 'character_at_position',
            characterId: 'victor',
            position: { row: 0, column: 0 },
          },
        },
        {
          id: 'c2',
          text: 'Victor is in vault',
          constraint: {
            type: 'character_in_area',
            characterId: 'victor',
            areaId: 'vault',
          },
        },
      ],
    }

    const result = solvePuzzle(impossiblePuzzle)
    expect(result.solutionCount).toBe(0)
    expect(result.isUnique).toBe(false)
    expect(result.solution).toBeUndefined()
  })
})
