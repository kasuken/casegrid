import { describe, expect, it } from 'vitest'
import {
  puzzleSchema,
  puzzleProgressSchema,
  constraintSchema,
  type Puzzle,
} from '../src/index.ts'

describe('puzzle schemas', () => {
  const samplePuzzle: Puzzle = {
    id: 'case-001',
    title: 'The Stolen Ledger',
    subtitle: 'A quiet study turned crime scene',
    description: 'Find out where everyone was and who was with the victim.',
    difficulty: 'beginner',
    grid: { width: 4, height: 4 },
    areas: [
      {
        id: 'study',
        name: 'Study',
        cells: [
          { row: 0, column: 0 },
          { row: 0, column: 1 },
        ],
      },
      {
        id: 'library',
        name: 'Library',
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
        label: 'Mahogany Desk',
        position: { row: 2, column: 2 },
      },
    ],
    characters: [
      { id: 'arthur', name: 'Arthur', role: 'victim' },
      { id: 'beatrice', name: 'Beatrice', role: 'suspect' },
      { id: 'clara', name: 'Clara', role: 'suspect' },
    ],
    clues: [
      {
        id: 'c1',
        text: 'Beatrice was in the study.',
        constraint: {
          type: 'character_in_area',
          characterId: 'beatrice',
          areaId: 'study',
        },
      },
      {
        id: 'c2',
        text: 'Clara was adjacent to the desk.',
        constraint: {
          type: 'character_adjacent_to_object',
          characterId: 'clara',
          objectId: 'desk',
        },
      },
    ],
    victimId: 'arthur',
    solution: {
      placements: {
        arthur: { row: 0, column: 0 },
        beatrice: { row: 0, column: 1 },
        clara: { row: 2, column: 1 },
      },
      murdererId: 'beatrice',
    },
  }

  it('validates a complete, correctly formed puzzle', () => {
    const result = puzzleSchema.safeParse(samplePuzzle)
    expect(result.success).toBe(true)
  })

  it('rejects puzzle with negative row or column coordinates', () => {
    const invalid = {
      ...samplePuzzle,
      grid: { width: -1, height: 4 },
    }
    const result = puzzleSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects invalid constraint type', () => {
    const invalid = {
      ...samplePuzzle,
      clues: [
        {
          id: 'c1',
          text: 'Bad clue',
          constraint: {
            type: 'invalid_constraint_type',
            characterId: 'beatrice',
          },
        },
      ],
    }
    const result = puzzleSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('validates each of the 13 constraint types', () => {
    const constraints = [
      { type: 'character_in_area', characterId: 'a', areaId: 'r1' },
      { type: 'character_not_in_area', characterId: 'a', areaId: 'r1' },
      { type: 'character_at_position', characterId: 'a', position: { row: 1, column: 2 } },
      { type: 'character_in_row', characterId: 'a', row: 2 },
      { type: 'character_in_column', characterId: 'a', column: 3 },
      { type: 'character_adjacent_to_character', characterId: 'a', targetCharacterId: 'b' },
      { type: 'character_not_adjacent_to_character', characterId: 'a', targetCharacterId: 'b' },
      { type: 'character_adjacent_to_object', characterId: 'a', objectId: 'obj1' },
      { type: 'character_not_adjacent_to_object', characterId: 'a', objectId: 'obj1' },
      { type: 'characters_same_area', characterId: 'a', targetCharacterId: 'b' },
      { type: 'characters_different_area', characterId: 'a', targetCharacterId: 'b' },
      { type: 'character_alone_in_area', characterId: 'a' },
      { type: 'exactly_n_characters_in_area', areaId: 'r1', count: 2 },
    ]

    for (const c of constraints) {
      const res = constraintSchema.safeParse(c)
      expect(res.success).toBe(true)
    }
  })

  it('validates and rejects puzzle progress appropriately', () => {
    const validProgress = {
      puzzleId: 'case-001',
      status: 'in-progress' as const,
      placements: { arthur: { row: 0, column: 0 } },
      exclusions: { arthur: [{ row: 1, column: 1 }] },
      solvedClueIds: ['c1'],
      elapsedSeconds: 45,
      mistakes: 0,
      bestTime: 120,
    }
    expect(puzzleProgressSchema.safeParse(validProgress).success).toBe(true)

    const invalidProgress = {
      ...validProgress,
      elapsedSeconds: -5,
    }
    expect(puzzleProgressSchema.safeParse(invalidProgress).success).toBe(false)
  })
})
