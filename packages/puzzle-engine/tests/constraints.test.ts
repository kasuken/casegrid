import { describe, expect, it } from 'vitest'
import {
  checkClueConflicts,
  createConstraintContext,
  evaluateConstraint,
  isConstraintViolatedPartially,
  type Constraint,
  type Position,
  type Puzzle,
} from '../src/index.ts'

describe('constraint evaluation', () => {
  const dummyPuzzle: Puzzle = {
    id: 'test-case',
    title: 'Test',
    description: 'Test case',
    difficulty: 'beginner',
    grid: { width: 4, height: 4 },
    areas: [
      {
        id: 'kitchen',
        name: 'Kitchen',
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
      {
        id: 'garden',
        name: 'Garden',
        cells: [
          { row: 2, column: 0 },
          { row: 2, column: 1 },
        ],
      },
    ],
    objects: [
      {
        id: 'fountain',
        type: 'fountain',
        position: { row: 3, column: 0 },
      },
    ],
    characters: [
      { id: 'alice', name: 'Alice', role: 'victim' },
      { id: 'bob', name: 'Bob', role: 'suspect' },
      { id: 'charlie', name: 'Charlie', role: 'suspect' },
    ],
    clues: [],
    victimId: 'alice',
    solution: {
      placements: {},
      murdererId: 'bob',
    },
  }

  const context = createConstraintContext(dummyPuzzle)

  it('evaluates character_in_area and character_not_in_area', () => {
    const inArea: Constraint = {
      type: 'character_in_area',
      characterId: 'alice',
      areaId: 'kitchen',
    }
    const notInArea: Constraint = {
      type: 'character_not_in_area',
      characterId: 'alice',
      areaId: 'kitchen',
    }

    const placementsKitchen: Record<string, Position> = {
      alice: { row: 0, column: 0 },
    }
    const placementsHall: Record<string, Position> = {
      alice: { row: 1, column: 0 },
    }

    expect(evaluateConstraint(inArea, placementsKitchen, context)).toBe(true)
    expect(evaluateConstraint(inArea, placementsHall, context)).toBe(false)
    expect(evaluateConstraint(notInArea, placementsKitchen, context)).toBe(false)
    expect(evaluateConstraint(notInArea, placementsHall, context)).toBe(true)
  })

  it('evaluates character_at_position, row, and column', () => {
    const atPos: Constraint = {
      type: 'character_at_position',
      characterId: 'alice',
      position: { row: 0, column: 1 },
    }
    const inRow: Constraint = {
      type: 'character_in_row',
      characterId: 'alice',
      row: 0,
    }
    const inCol: Constraint = {
      type: 'character_in_column',
      characterId: 'alice',
      column: 1,
    }

    const matching: Record<string, Position> = {
      alice: { row: 0, column: 1 },
    }
    const nonMatching: Record<string, Position> = {
      alice: { row: 1, column: 0 },
    }

    expect(evaluateConstraint(atPos, matching, context)).toBe(true)
    expect(evaluateConstraint(atPos, nonMatching, context)).toBe(false)

    expect(evaluateConstraint(inRow, matching, context)).toBe(true)
    expect(evaluateConstraint(inRow, nonMatching, context)).toBe(false)

    expect(evaluateConstraint(inCol, matching, context)).toBe(true)
    expect(evaluateConstraint(inCol, nonMatching, context)).toBe(false)
  })

  it('evaluates character adjacency constraints (orthogonal only)', () => {
    const adjacent: Constraint = {
      type: 'character_adjacent_to_character',
      characterId: 'alice',
      targetCharacterId: 'bob',
    }
    const notAdjacent: Constraint = {
      type: 'character_not_adjacent_to_character',
      characterId: 'alice',
      targetCharacterId: 'bob',
    }

    const orthoPlacements: Record<string, Position> = {
      alice: { row: 0, column: 0 },
      bob: { row: 0, column: 1 },
    }
    const diagPlacements: Record<string, Position> = {
      alice: { row: 0, column: 0 },
      bob: { row: 1, column: 1 },
    }

    expect(evaluateConstraint(adjacent, orthoPlacements, context)).toBe(true)
    expect(evaluateConstraint(adjacent, diagPlacements, context)).toBe(false)

    expect(evaluateConstraint(notAdjacent, orthoPlacements, context)).toBe(false)
    expect(evaluateConstraint(notAdjacent, diagPlacements, context)).toBe(true)
  })

  it('evaluates character adjacent/not-adjacent to object', () => {
    // fountain is at { row: 3, column: 0 }
    const adjObj: Constraint = {
      type: 'character_adjacent_to_object',
      characterId: 'alice',
      objectId: 'fountain',
    }
    const notAdjObj: Constraint = {
      type: 'character_not_adjacent_to_object',
      characterId: 'alice',
      objectId: 'fountain',
    }

    const nextToObj: Record<string, Position> = {
      alice: { row: 2, column: 0 }, // adjacent to (3, 0)
    }
    const farFromObj: Record<string, Position> = {
      alice: { row: 0, column: 0 },
    }

    expect(evaluateConstraint(adjObj, nextToObj, context)).toBe(true)
    expect(evaluateConstraint(adjObj, farFromObj, context)).toBe(false)

    expect(evaluateConstraint(notAdjObj, nextToObj, context)).toBe(false)
    expect(evaluateConstraint(notAdjObj, farFromObj, context)).toBe(true)
  })

  it('evaluates characters_same_area and characters_different_area', () => {
    const sameArea: Constraint = {
      type: 'characters_same_area',
      characterId: 'alice',
      targetCharacterId: 'bob',
    }
    const diffArea: Constraint = {
      type: 'characters_different_area',
      characterId: 'alice',
      targetCharacterId: 'bob',
    }

    const bothKitchen: Record<string, Position> = {
      alice: { row: 0, column: 0 },
      bob: { row: 0, column: 1 },
    }
    const splitAreas: Record<string, Position> = {
      alice: { row: 0, column: 0 }, // kitchen
      bob: { row: 1, column: 0 },   // hall
    }

    expect(evaluateConstraint(sameArea, bothKitchen, context)).toBe(true)
    expect(evaluateConstraint(sameArea, splitAreas, context)).toBe(false)

    expect(evaluateConstraint(diffArea, bothKitchen, context)).toBe(false)
    expect(evaluateConstraint(diffArea, splitAreas, context)).toBe(true)
  })

  it('evaluates character_alone_in_area', () => {
    const alone: Constraint = {
      type: 'character_alone_in_area',
      characterId: 'alice',
    }

    const aliceAlone: Record<string, Position> = {
      alice: { row: 0, column: 0 }, // kitchen
      bob: { row: 1, column: 0 },   // hall
      charlie: { row: 1, column: 1 }, // hall
    }
    const aliceNotAlone: Record<string, Position> = {
      alice: { row: 0, column: 0 }, // kitchen
      bob: { row: 0, column: 1 },   // kitchen
      charlie: { row: 1, column: 0 },
    }

    expect(evaluateConstraint(alone, aliceAlone, context)).toBe(true)
    expect(evaluateConstraint(alone, aliceNotAlone, context)).toBe(false)
  })

  it('evaluates exactly_n_characters_in_area', () => {
    const twoInHall: Constraint = {
      type: 'exactly_n_characters_in_area',
      areaId: 'hall',
      count: 2,
    }

    const twoPlaced: Record<string, Position> = {
      alice: { row: 1, column: 0 },
      bob: { row: 1, column: 1 },
      charlie: { row: 0, column: 0 },
    }
    const onePlaced: Record<string, Position> = {
      alice: { row: 1, column: 0 },
      bob: { row: 0, column: 0 },
      charlie: { row: 0, column: 1 },
    }

    expect(evaluateConstraint(twoInHall, twoPlaced, context)).toBe(true)
    expect(evaluateConstraint(twoInHall, onePlaced, context)).toBe(false)
  })

  it('correctly handles partial evaluation for solver pruning', () => {
    const inArea: Constraint = {
      type: 'character_in_area',
      characterId: 'alice',
      areaId: 'kitchen',
    }

    // Alice placed in Hall -> immediately violates
    expect(
      isConstraintViolatedPartially(
        inArea,
        { alice: { row: 1, column: 0 } },
        2,
        context,
      ),
    ).toBe(true)

    // Alice not placed yet -> not violated
    expect(
      isConstraintViolatedPartially(
        inArea,
        { bob: { row: 1, column: 0 } },
        2,
        context,
      ),
    ).toBe(false)

    // Count in area
    const maxOne: Constraint = {
      type: 'exactly_n_characters_in_area',
      areaId: 'kitchen',
      count: 1,
    }
    // Already 2 in kitchen -> violated
    expect(
      isConstraintViolatedPartially(
        maxOne,
        {
          alice: { row: 0, column: 0 },
          bob: { row: 0, column: 1 },
        },
        1,
        context,
      ),
    ).toBe(true)
  })

  it('reports clue conflict count on submitted placements', () => {
    const puzzleWithClues: Puzzle = {
      ...dummyPuzzle,
      clues: [
        {
          id: 'clue-1',
          text: 'Alice was in the kitchen.',
          constraint: {
            type: 'character_in_area',
            characterId: 'alice',
            areaId: 'kitchen',
          },
        },
        {
          id: 'clue-2',
          text: 'Bob was in the hall.',
          constraint: {
            type: 'character_in_area',
            characterId: 'bob',
            areaId: 'hall',
          },
        },
      ],
    }

    const perfectPlacements: Record<string, Position> = {
      alice: { row: 0, column: 0 },
      bob: { row: 1, column: 0 },
    }
    expect(checkClueConflicts(perfectPlacements, puzzleWithClues).count).toBe(0)

    const oneWrongPlacements: Record<string, Position> = {
      alice: { row: 2, column: 0 }, // garden instead of kitchen
      bob: { row: 1, column: 0 },
    }
    const result = checkClueConflicts(oneWrongPlacements, puzzleWithClues)
    expect(result.count).toBe(1)
    expect(result.violatedClueIds).toEqual(['clue-1'])
  })
})
