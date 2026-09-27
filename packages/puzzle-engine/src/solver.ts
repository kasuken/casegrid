/**
 * CaseGrid Puzzle Engine - Backtracking Constraint Solver
 * Deterministic solving, solution counting, and uniqueness proof.
 */

import {
  createConstraintContext,
  evaluateConstraint,
  isConstraintViolatedPartially,
} from './constraints.ts'
import {
  arePositionsAdjacent,
  getAreaForPosition,
  getValidPlacementCells,
  isCellInArea,
  isPositionEqual,
} from './grid.ts'
import type {
  Character,
  Position,
  Puzzle,
  PuzzleSolution,
  SolveResult,
} from './types.ts'

/**
 * Derives the murderer ID from character placements.
 * In CaseGrid, the murderer is the suspect who was alone with the victim in the victim's area.
 */
export function determineMurdererId(
  puzzle: Pick<Puzzle, 'victimId' | 'characters' | 'areas'>,
  placements: Readonly<Record<string, Position>>,
): string | undefined {
  const victimPos = placements[puzzle.victimId]
  if (!victimPos) return undefined

  const victimArea = getAreaForPosition(victimPos, puzzle.areas)
  if (!victimArea) return undefined

  const suspectsInArea: Character[] = []
  for (const char of puzzle.characters) {
    if (char.role === 'suspect') {
      const charPos = placements[char.id]
      if (charPos && isCellInArea(charPos, victimArea)) {
        suspectsInArea.push(char)
      }
    }
  }

  if (suspectsInArea.length === 1) {
    return suspectsInArea[0].id
  }

  return undefined
}

export interface SolverOptions {
  /** Maximum solutions to find before terminating early. Defaults to 2 (to check uniqueness). */
  readonly maxSolutions?: number
}

/**
 * Computes an initial candidate cell domain for a character based on static unary constraints.
 */
function getInitialDomainForCharacter(
  characterId: string,
  puzzle: Puzzle,
  validCells: readonly Position[],
): Position[] {
  let domain = [...validCells]

  for (const clue of puzzle.clues) {
    const c = clue.constraint
    if (c.type === 'character_at_position' && c.characterId === characterId) {
      domain = domain.filter((p) => isPositionEqual(p, c.position))
    } else if (c.type === 'character_in_row' && c.characterId === characterId) {
      domain = domain.filter((p) => p.row === c.row)
    } else if (c.type === 'character_in_column' && c.characterId === characterId) {
      domain = domain.filter((p) => p.column === c.column)
    } else if (c.type === 'character_in_area' && c.characterId === characterId) {
      const area = puzzle.areas.find((a) => a.id === c.areaId)
      if (area) {
        domain = domain.filter((p) => isCellInArea(p, area))
      }
    } else if (c.type === 'character_not_in_area' && c.characterId === characterId) {
      const area = puzzle.areas.find((a) => a.id === c.areaId)
      if (area) {
        domain = domain.filter((p) => !isCellInArea(p, area))
      }
    } else if (c.type === 'character_adjacent_to_object' && c.characterId === characterId) {
      const obj = puzzle.objects.find((o) => o.id === c.objectId)
      if (obj) {
        domain = domain.filter((p) => arePositionsAdjacent(p, obj.position))
      }
    } else if (c.type === 'character_not_adjacent_to_object' && c.characterId === characterId) {
      const obj = puzzle.objects.find((o) => o.id === c.objectId)
      if (obj) {
        domain = domain.filter((p) => !arePositionsAdjacent(p, obj.position))
      }
    }
  }

  return domain
}

/**
 * Deterministically solves a CaseGrid puzzle using backtracking with MRV and constraint pruning.
 */
export function solvePuzzle(
  puzzle: Puzzle,
  options: SolverOptions = {},
): SolveResult {
  const maxSolutions = options.maxSolutions ?? 2
  const validCells = getValidPlacementCells(puzzle.grid, puzzle.objects)
  const context = createConstraintContext(puzzle)

  // Compute initial domains for each character
  const characterDomains = new Map<string, Position[]>()
  for (const char of puzzle.characters) {
    const domain = getInitialDomainForCharacter(char.id, puzzle, validCells)
    if (domain.length === 0) {
      // Character has no possible valid cell
      return {
        solutionCount: 0,
        isUnique: false,
      }
    }
    characterDomains.set(char.id, domain)
  }

  // Sort characters by domain size ascending (MRV: Most Constrained Variable first)
  const sortedCharacterIds = [...puzzle.characters.map((c) => c.id)].sort((a, b) => {
    const lenA = characterDomains.get(a)?.length ?? 0
    const lenB = characterDomains.get(b)?.length ?? 0
    return lenA - lenB
  })

  const foundSolutions: PuzzleSolution[] = []
  const placements: Record<string, Position> = {}
  const occupiedCells = new Set<string>()

  function backtrack(charIndex: number): void {
    if (foundSolutions.length >= maxSolutions) {
      return
    }

    if (charIndex === sortedCharacterIds.length) {
      // All characters placed. Final check against all clues.
      const satisfiesAll = puzzle.clues.every((clue) =>
        evaluateConstraint(clue.constraint, placements, context),
      )

      if (satisfiesAll) {
        const murdererId =
          determineMurdererId(puzzle, placements) ?? puzzle.solution?.murdererId ?? ''

        foundSolutions.push({
          placements: { ...placements },
          murdererId,
        })
      }
      return
    }

    const currentCharId = sortedCharacterIds[charIndex]
    const candidates = characterDomains.get(currentCharId) ?? []
    const unplacedCount = sortedCharacterIds.length - charIndex - 1

    for (const pos of candidates) {
      const key = `${pos.row},${pos.column}`
      if (occupiedCells.has(key)) {
        continue
      }

      // Tentatively place
      placements[currentCharId] = pos
      occupiedCells.add(key)

      // Prune if any constraint is already violated
      let pruned = false
      for (const clue of puzzle.clues) {
        if (
          isConstraintViolatedPartially(
            clue.constraint,
            placements,
            unplacedCount,
            context,
            puzzle.grid,
            puzzle.objects,
          )
        ) {
          pruned = true
          break
        }
      }

      if (!pruned) {
        backtrack(charIndex + 1)
      }

      // Backtrack
      delete placements[currentCharId]
      occupiedCells.delete(key)

      if (foundSolutions.length >= maxSolutions) {
        return
      }
    }
  }

  backtrack(0)

  return {
    solutionCount: foundSolutions.length,
    solution: foundSolutions[0],
    isUnique: foundSolutions.length === 1,
  }
}
