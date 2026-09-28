import { describe, expect, it } from 'vitest'
import {
  validatePuzzle,
  type Puzzle,
} from '../src/index.ts'

describe('puzzle validator', () => {
  const validPuzzle: Puzzle = {
    id: 'case-val',
    title: 'Valid Mystery',
    description: 'A well formed mystery',
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
        id: 'hall',
        name: 'Hall',
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
        text: 'Sam was at (0, 1)',
        constraint: {
          type: 'character_at_position',
          characterId: 'sam',
          position: { row: 0, column: 1 },
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

  it('validates a correct, unique puzzle successfully', () => {
    const result = validatePuzzle(validPuzzle)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.solveResult?.solutionCount).toBe(1)
  })

  it('rejects duplicate character, object, and area IDs', () => {
    const duplicateIds = {
      ...validPuzzle,
      characters: [
        { id: 'sam', name: 'Victor', role: 'victim' },
        { id: 'sam', name: 'Sam', role: 'suspect' },
      ],
      victimId: 'sam',
    }
    const result = validatePuzzle(duplicateIds)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'DUPLICATE_CHARACTER_ID')).toBe(true)
  })

  it('rejects when murderer is declared as the victim', () => {
    const murdererIsVictim = {
      ...validPuzzle,
      solution: {
        ...validPuzzle.solution,
        murdererId: 'victor',
      },
    }
    const result = validatePuzzle(murdererIsVictim)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'MURDERER_IS_VICTIM' || e.code === 'MURDERER_NOT_SUSPECT')).toBe(true)
  })

  it('rejects overlapping placements in declared solution', () => {
    const overlapping = {
      ...validPuzzle,
      solution: {
        placements: {
          victor: { row: 0, column: 0 },
          sam: { row: 0, column: 0 }, // overlaps with victor
          tina: { row: 1, column: 0 },
        },
        murdererId: 'sam',
      },
    }
    const result = validatePuzzle(overlapping)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'OVERLAPPING_SOLUTION_PLACEMENT')).toBe(true)
  })

  it('rejects placements on blocked object cells', () => {
    const blocked = {
      ...validPuzzle,
      solution: {
        placements: {
          victor: { row: 0, column: 0 },
          sam: { row: 0, column: 1 },
          tina: { row: 2, column: 2 }, // cell of safe object
        },
        murdererId: 'sam',
      },
    }
    const result = validatePuzzle(blocked)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'BLOCKED_SOLUTION_PLACEMENT')).toBe(true)
  })

  it('rejects declared solution that violates clues', () => {
    const violatesClue = {
      ...validPuzzle,
      solution: {
        placements: {
          victor: { row: 0, column: 0 },
          sam: { row: 0, column: 1 },
          tina: { row: 1, column: 1 }, // violates c3 which requires (1, 0)
        },
        murdererId: 'sam',
      },
    }
    const result = validatePuzzle(violatesClue)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'DECLARED_SOLUTION_VIOLATES_CLUE')).toBe(true)
  })

  it('rejects ambiguous puzzles with multiple solutions', () => {
    const ambiguous = {
      ...validPuzzle,
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
          text: 'Sam was at (0, 1)',
          constraint: {
            type: 'character_at_position',
            characterId: 'sam',
            position: { row: 0, column: 1 },
          },
        },
        // Missing Tina constraint: Tina can be in multiple places
      ],
    }
    const result = validatePuzzle(ambiguous)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'AMBIGUOUS_PUZZLE')).toBe(true)
  })

  it('accepts authored resolution, deductions, help prompts, and tutorial steps', () => {
    const result = validatePuzzle({
      ...validPuzzle,
      resolution: 'Sam was the only one who shared the office with Victor.',
      deductions: [{ text: 'Victor and Sam are both fixed in the office.', clueIds: ['c1', 'c2'] }],
      helpPrompts: [{ id: 'h1', text: 'Who else could be in the office?', clueIds: ['c3'] }],
      tutorial: [{ id: 't1', title: 'Pick someone', text: 'Select a character.', advanceOn: 'select' }],
    })
    expect(result.valid).toBe(true)
  })

  it('rejects authored content that references unknown clues', () => {
    const result = validatePuzzle({
      ...validPuzzle,
      deductions: [{ text: 'Uses a missing clue.', clueIds: ['c9'] }],
      helpPrompts: [{ id: 'h1', text: 'Also missing.', clueIds: ['c8'] }],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.filter((e) => e.code === 'UNKNOWN_CLUE_REFERENCE')).toHaveLength(2)
  })

  it('rejects duplicate help prompt and tutorial step IDs', () => {
    const result = validatePuzzle({
      ...validPuzzle,
      helpPrompts: [
        { id: 'h1', text: 'First', clueIds: [] },
        { id: 'h1', text: 'Second', clueIds: [] },
      ],
      tutorial: [
        { id: 't1', title: 'A', text: 'A', advanceOn: 'manual' },
        { id: 't1', title: 'B', text: 'B', advanceOn: 'manual' },
      ],
    })
    expect(result.errors.some((e) => e.code === 'DUPLICATE_HELP_PROMPT_ID')).toBe(true)
    expect(result.errors.some((e) => e.code === 'DUPLICATE_TUTORIAL_STEP_ID')).toBe(true)
  })

  it('rejects tutorial steps with an unknown trigger', () => {
    const result = validatePuzzle({
      ...validPuzzle,
      tutorial: [{ id: 't1', title: 'A', text: 'A', advanceOn: 'drag' }],
    })
    expect(result.valid).toBe(false)
    expect(result.errors[0]?.code).toBe('SCHEMA_ERROR')
  })
})
