/**
 * CaseGrid Puzzle Engine - Constraint Evaluation
 * Pure functions for checking clues and pruning partial solutions.
 */

import {
  arePositionsAdjacent,
  getAreaForPosition,
  getOrthogonalNeighbors,
  isCellBlockedByObject,
  isCellInArea,
  isPositionEqual,
} from './grid.ts'
import type {
  Area,
  Constraint,
  MapObject,
  Position,
  Puzzle,
} from './types.ts'

export interface ConstraintContext {
  readonly areas: readonly Area[]
  readonly areaMap: ReadonlyMap<string, Area>
  readonly objectMap: ReadonlyMap<string, Position>
  readonly totalCharacterIds: readonly string[]
}

export function createConstraintContext(puzzle: Pick<Puzzle, 'areas' | 'objects' | 'characters'>): ConstraintContext {
  const areaMap = new Map<string, Area>()
  for (const a of puzzle.areas) {
    areaMap.set(a.id, a)
  }

  const objectMap = new Map<string, Position>()
  for (const obj of puzzle.objects) {
    objectMap.set(obj.id, obj.position)
  }

  return {
    areas: puzzle.areas,
    areaMap,
    objectMap,
    totalCharacterIds: puzzle.characters.map((c) => c.id),
  }
}

/**
 * Evaluates whether a full placement satisfies a given constraint.
 * All characters involved in the constraint must be placed.
 */
export function evaluateConstraint(
  constraint: Constraint,
  placements: Readonly<Record<string, Position>>,
  context: ConstraintContext,
): boolean {
  switch (constraint.type) {
    case 'character_in_area': {
      const pos = placements[constraint.characterId]
      if (!pos) return false
      const targetArea = context.areaMap.get(constraint.areaId)
      if (!targetArea) return false
      return isCellInArea(pos, targetArea)
    }

    case 'character_not_in_area': {
      const pos = placements[constraint.characterId]
      if (!pos) return false
      const targetArea = context.areaMap.get(constraint.areaId)
      if (!targetArea) return true
      return !isCellInArea(pos, targetArea)
    }

    case 'character_at_position': {
      const pos = placements[constraint.characterId]
      if (!pos) return false
      return isPositionEqual(pos, constraint.position)
    }

    case 'character_in_row': {
      const pos = placements[constraint.characterId]
      if (!pos) return false
      return pos.row === constraint.row
    }

    case 'character_in_column': {
      const pos = placements[constraint.characterId]
      if (!pos) return false
      return pos.column === constraint.column
    }

    case 'character_adjacent_to_character': {
      const posA = placements[constraint.characterId]
      const posB = placements[constraint.targetCharacterId]
      if (!posA || !posB) return false
      return arePositionsAdjacent(posA, posB)
    }

    case 'character_not_adjacent_to_character': {
      const posA = placements[constraint.characterId]
      const posB = placements[constraint.targetCharacterId]
      if (!posA || !posB) return false
      return !arePositionsAdjacent(posA, posB)
    }

    case 'character_adjacent_to_object': {
      const posA = placements[constraint.characterId]
      const objPos = context.objectMap.get(constraint.objectId)
      if (!posA || !objPos) return false
      return arePositionsAdjacent(posA, objPos)
    }

    case 'character_not_adjacent_to_object': {
      const posA = placements[constraint.characterId]
      const objPos = context.objectMap.get(constraint.objectId)
      if (!posA || !objPos) return false
      return !arePositionsAdjacent(posA, objPos)
    }

    case 'characters_same_area': {
      const posA = placements[constraint.characterId]
      const posB = placements[constraint.targetCharacterId]
      if (!posA || !posB) return false
      const areaA = getAreaForPosition(posA, context.areas)
      const areaB = getAreaForPosition(posB, context.areas)
      if (!areaA || !areaB) return false
      return areaA.id === areaB.id
    }

    case 'characters_different_area': {
      const posA = placements[constraint.characterId]
      const posB = placements[constraint.targetCharacterId]
      if (!posA || !posB) return false
      const areaA = getAreaForPosition(posA, context.areas)
      const areaB = getAreaForPosition(posB, context.areas)
      if (!areaA && !areaB) return false
      return areaA?.id !== areaB?.id
    }

    case 'character_alone_in_area': {
      const posA = placements[constraint.characterId]
      if (!posA) return false
      const area = getAreaForPosition(posA, context.areas)
      if (!area) return false

      for (const [charId, pos] of Object.entries(placements)) {
        if (charId !== constraint.characterId && isCellInArea(pos, area)) {
          return false
        }
      }
      return true
    }

    case 'exactly_n_characters_in_area': {
      const area = context.areaMap.get(constraint.areaId)
      if (!area) return false

      let count = 0
      for (const pos of Object.values(placements)) {
        if (isCellInArea(pos, area)) {
          count++
        }
      }
      return count === constraint.count
    }
  }
}

/**
 * Checks whether a partial placement is ALREADY definitely in violation of the constraint.
 * Returns true if the constraint is definitively broken and cannot be rescued by placing remaining characters.
 */
export function isConstraintViolatedPartially(
  constraint: Constraint,
  placements: Readonly<Record<string, Position>>,
  unplacedCount: number,
  context: ConstraintContext,
  puzzleGrid?: Puzzle['grid'],
  objects?: readonly MapObject[],
): boolean {
  switch (constraint.type) {
    case 'character_in_area': {
      const pos = placements[constraint.characterId]
      if (!pos) return false
      const targetArea = context.areaMap.get(constraint.areaId)
      if (!targetArea) return true
      return !isCellInArea(pos, targetArea)
    }

    case 'character_not_in_area': {
      const pos = placements[constraint.characterId]
      if (!pos) return false
      const targetArea = context.areaMap.get(constraint.areaId)
      if (!targetArea) return false
      return isCellInArea(pos, targetArea)
    }

    case 'character_at_position': {
      const pos = placements[constraint.characterId]
      if (!pos) return false
      return !isPositionEqual(pos, constraint.position)
    }

    case 'character_in_row': {
      const pos = placements[constraint.characterId]
      if (!pos) return false
      return pos.row !== constraint.row
    }

    case 'character_in_column': {
      const pos = placements[constraint.characterId]
      if (!pos) return false
      return pos.column !== constraint.column
    }

    case 'character_adjacent_to_character': {
      const posA = placements[constraint.characterId]
      const posB = placements[constraint.targetCharacterId]
      if (posA && posB) {
        return !arePositionsAdjacent(posA, posB)
      }
      // If one is placed, ensure it has at least one possible cell where the other can be placed
      if (posA && !posB && puzzleGrid && objects) {
        const neighbors = getOrthogonalNeighbors(posA, puzzleGrid)
        const hasOpenNeighbor = neighbors.some((n) => {
          if (isCellBlockedByObject(n, objects)) return false
          // Not occupied by someone other than target
          const occupant = Object.entries(placements).find(([id, p]) =>
            id !== constraint.targetCharacterId && isPositionEqual(p, n),
          )
          return !occupant
        })
        if (!hasOpenNeighbor) return true
      }
      if (!posA && posB && puzzleGrid && objects) {
        const neighbors = getOrthogonalNeighbors(posB, puzzleGrid)
        const hasOpenNeighbor = neighbors.some((n) => {
          if (isCellBlockedByObject(n, objects)) return false
          const occupant = Object.entries(placements).find(([id, p]) =>
            id !== constraint.characterId && isPositionEqual(p, n),
          )
          return !occupant
        })
        if (!hasOpenNeighbor) return true
      }
      return false
    }

    case 'character_not_adjacent_to_character': {
      const posA = placements[constraint.characterId]
      const posB = placements[constraint.targetCharacterId]
      if (posA && posB) {
        return arePositionsAdjacent(posA, posB)
      }
      return false
    }

    case 'character_adjacent_to_object': {
      const posA = placements[constraint.characterId]
      if (!posA) return false
      const objPos = context.objectMap.get(constraint.objectId)
      if (!objPos) return true
      return !arePositionsAdjacent(posA, objPos)
    }

    case 'character_not_adjacent_to_object': {
      const posA = placements[constraint.characterId]
      if (!posA) return false
      const objPos = context.objectMap.get(constraint.objectId)
      if (!objPos) return false
      return arePositionsAdjacent(posA, objPos)
    }

    case 'characters_same_area': {
      const posA = placements[constraint.characterId]
      const posB = placements[constraint.targetCharacterId]
      if (posA && posB) {
        const areaA = getAreaForPosition(posA, context.areas)
        const areaB = getAreaForPosition(posB, context.areas)
        return !areaA || !areaB || areaA.id !== areaB.id
      }
      return false
    }

    case 'characters_different_area': {
      const posA = placements[constraint.characterId]
      const posB = placements[constraint.targetCharacterId]
      if (posA && posB) {
        const areaA = getAreaForPosition(posA, context.areas)
        const areaB = getAreaForPosition(posB, context.areas)
        return areaA?.id === areaB?.id
      }
      return false
    }

    case 'character_alone_in_area': {
      const posA = placements[constraint.characterId]
      if (!posA) return false
      const area = getAreaForPosition(posA, context.areas)
      if (!area) return true

      for (const [charId, pos] of Object.entries(placements)) {
        if (charId !== constraint.characterId && isCellInArea(pos, area)) {
          return true
        }
      }
      return false
    }

    case 'exactly_n_characters_in_area': {
      const area = context.areaMap.get(constraint.areaId)
      if (!area) return true

      let count = 0
      for (const pos of Object.values(placements)) {
        if (isCellInArea(pos, area)) {
          count++
        }
      }

      if (count > constraint.count) {
        return true
      }
      if (count + unplacedCount < constraint.count) {
        return true
      }
      return false
    }
  }
}

/**
 * Counts the number of clues violated by a given set of placements.
 * Used for solution submission feedback.
 */
export function checkClueConflicts(
  placements: Readonly<Record<string, Position>>,
  puzzle: Puzzle,
): { violatedClueIds: string[]; count: number } {
  const context = createConstraintContext(puzzle)
  const violatedClueIds: string[] = []

  for (const clue of puzzle.clues) {
    if (!evaluateConstraint(clue.constraint, placements, context)) {
      violatedClueIds.push(clue.id)
    }
  }

  return {
    violatedClueIds,
    count: violatedClueIds.length,
  }
}
