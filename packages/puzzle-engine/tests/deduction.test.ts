import { describe, expect, it } from 'vitest'
import { analyzeDeductionPath, DISTINCT_CELLS_RULE, type Clue, type Puzzle } from '../src/index.ts'

const row = (r: number) => [0, 1, 2].map((column) => ({ row: r, column }))

function makePuzzle(clues: Clue[]): Puzzle {
  return {
    id: 'deduction-test',
    title: 'Deduction Test',
    description: 'Three rooms stacked as rows.',
    difficulty: 'beginner',
    grid: { width: 3, height: 3 },
    areas: [
      { id: 'attic', name: 'Attic', cells: row(0) },
      { id: 'hall', name: 'Hall', cells: row(1) },
      { id: 'cellar', name: 'Cellar', cells: row(2) },
    ],
    objects: [{ id: 'lamp', type: 'lamp', position: { row: 1, column: 1 } }],
    characters: [
      { id: 'vic', name: 'Vic', role: 'victim' },
      { id: 'ann', name: 'Ann', role: 'suspect' },
      { id: 'bob', name: 'Bob', role: 'suspect' },
    ],
    clues,
    victimId: 'vic',
    solution: { placements: {}, murdererId: 'ann' },
  }
}

const clue = (id: string, constraint: Clue['constraint']): Clue => ({ id, text: id, constraint })

describe('deduction path analysis', () => {
  it('solves a case through unary clues and records which clue narrowed whom', () => {
    const analysis = analyzeDeductionPath(
      makePuzzle([
        clue('c1', { type: 'character_at_position', characterId: 'vic', position: { row: 0, column: 0 } }),
        clue('c2', { type: 'character_in_area', characterId: 'ann', areaId: 'attic' }),
        clue('c3', { type: 'character_in_column', characterId: 'ann', column: 1 }),
        clue('c4', { type: 'character_adjacent_to_object', characterId: 'bob', objectId: 'lamp' }),
        clue('c5', { type: 'character_in_row', characterId: 'bob', row: 2 }),
      ]),
    )

    expect(analysis.solvedByPropagation).toBe(true)
    expect(analysis.domains.ann).toEqual([{ row: 0, column: 1 }])
    expect(analysis.domains.bob).toEqual([{ row: 2, column: 1 }])
    expect(analysis.pinnedOrder).toEqual(['vic', 'ann', 'bob'])
    expect(analysis.trace.some((t) => t.source === 'c3' && t.characterId === 'ann' && t.remaining === 1)).toBe(true)
  })

  it('narrows both sides of a relationship clue using the other person’s candidates', () => {
    const analysis = analyzeDeductionPath(
      makePuzzle([
        clue('c1', { type: 'character_at_position', characterId: 'vic', position: { row: 0, column: 0 } }),
        clue('c2', { type: 'character_adjacent_to_character', characterId: 'ann', targetCharacterId: 'vic' }),
        clue('c3', { type: 'character_in_area', characterId: 'ann', areaId: 'hall' }),
      ]),
    )

    expect(analysis.domains.ann).toEqual([{ row: 1, column: 0 }])
  })

  it('removes a lone character’s room from everyone else', () => {
    const analysis = analyzeDeductionPath(
      makePuzzle([
        clue('c1', { type: 'character_in_area', characterId: 'ann', areaId: 'cellar' }),
        clue('c2', { type: 'character_alone_in_area', characterId: 'ann' }),
      ]),
    )

    expect(analysis.domains.bob.every((p) => p.row !== 2)).toBe(true)
    expect(analysis.domains.vic.every((p) => p.row !== 2)).toBe(true)
  })

  it('applies exactly-n counts when the room is already full or must be filled', () => {
    const empty = analyzeDeductionPath(
      makePuzzle([clue('c1', { type: 'exactly_n_characters_in_area', areaId: 'cellar', count: 0 })]),
    )
    expect(Object.values(empty.domains).every((d) => d.every((p) => p.row !== 2))).toBe(true)

    const filled = analyzeDeductionPath(
      makePuzzle([
        clue('c1', { type: 'character_in_area', characterId: 'vic', areaId: 'attic' }),
        clue('c2', { type: 'exactly_n_characters_in_area', areaId: 'cellar', count: 2 }),
      ]),
    )
    expect(filled.domains.ann.every((p) => p.row === 2)).toBe(true)
    expect(filled.domains.bob.every((p) => p.row === 2)).toBe(true)
  })

  it('frees a pinned cell for everyone else', () => {
    const analysis = analyzeDeductionPath(
      makePuzzle([
        clue('c1', { type: 'character_at_position', characterId: 'vic', position: { row: 2, column: 2 } }),
        clue('c2', { type: 'character_in_row', characterId: 'ann', row: 2 }),
        clue('c3', { type: 'character_in_column', characterId: 'ann', column: 2 }),
      ]),
    )

    expect(analysis.trace.some((t) => t.source === DISTINCT_CELLS_RULE)).toBe(true)
    expect(analysis.domains.ann).toEqual([])
    expect(analysis.solvedByPropagation).toBe(false)
  })

  it('reports a stall when the clues leave several candidates open', () => {
    const analysis = analyzeDeductionPath(
      makePuzzle([
        clue('c1', { type: 'character_at_position', characterId: 'vic', position: { row: 0, column: 0 } }),
        clue('c2', { type: 'character_in_area', characterId: 'ann', areaId: 'hall' }),
      ]),
    )

    expect(analysis.solvedByPropagation).toBe(false)
    expect(analysis.domains.ann).toHaveLength(2)
  })
})
