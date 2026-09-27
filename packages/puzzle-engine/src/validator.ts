/**
 * CaseGrid Puzzle Engine - Puzzle Validator
 * Rigorous validation of schemas, invariants, and unique solvability.
 */

import {
  evaluateConstraint,
  createConstraintContext,
} from './constraints.ts'
import {
  isCellBlockedByObject,
  isPositionEqual,
  isPositionWithinBounds,
} from './grid.ts'
import { puzzleSchema } from './schemas.ts'
import { determineMurdererId, solvePuzzle } from './solver.ts'
import type {
  Puzzle,
  ValidationIssue,
  ValidationResult,
} from './types.ts'

export function validatePuzzle(rawPuzzle: unknown): ValidationResult {
  const errors: ValidationIssue[] = []

  // 1. Zod schema validation
  const parsed = puzzleSchema.safeParse(rawPuzzle)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push({
        code: 'SCHEMA_ERROR',
        message: `${issue.path.join('.')}: ${issue.message}`,
        path: issue.path as (string | number)[],
      })
    }
    return {
      valid: false,
      errors,
    }
  }

  const puzzle = parsed.data as Puzzle
  const grid = puzzle.grid

  // 2. Unique IDs
  const characterIds = new Set<string>()
  for (const c of puzzle.characters) {
    if (characterIds.has(c.id)) {
      errors.push({
        code: 'DUPLICATE_CHARACTER_ID',
        message: `Duplicate character ID: "${c.id}"`,
      })
    }
    characterIds.add(c.id)
  }

  const objectIds = new Set<string>()
  for (const o of puzzle.objects) {
    if (objectIds.has(o.id)) {
      errors.push({
        code: 'DUPLICATE_OBJECT_ID',
        message: `Duplicate object ID: "${o.id}"`,
      })
    }
    objectIds.add(o.id)
  }

  const areaIds = new Set<string>()
  for (const a of puzzle.areas) {
    if (areaIds.has(a.id)) {
      errors.push({
        code: 'DUPLICATE_AREA_ID',
        message: `Duplicate area ID: "${a.id}"`,
      })
    }
    areaIds.add(a.id)
  }

  const clueIds = new Set<string>()
  for (const clue of puzzle.clues) {
    if (clueIds.has(clue.id)) {
      errors.push({
        code: 'DUPLICATE_CLUE_ID',
        message: `Duplicate clue ID: "${clue.id}"`,
      })
    }
    clueIds.add(clue.id)
  }

  // 3. Victim and Murderer verification
  const victim = puzzle.characters.find((c) => c.id === puzzle.victimId)
  if (!victim) {
    errors.push({
      code: 'MISSING_VICTIM',
      message: `Victim ID "${puzzle.victimId}" was not found in characters`,
    })
  } else if (victim.role !== 'victim') {
    errors.push({
      code: 'INVALID_VICTIM_ROLE',
      message: `Character "${puzzle.victimId}" is declared as victimId but has role "${victim.role}"`,
    })
  }

  const victimsList = puzzle.characters.filter((c) => c.role === 'victim')
  if (victimsList.length !== 1) {
    errors.push({
      code: 'INVALID_VICTIM_COUNT',
      message: `Case must have exactly 1 victim, found ${victimsList.length}`,
    })
  }

  const declaredMurdererId = puzzle.solution.murdererId
  const murderer = puzzle.characters.find((c) => c.id === declaredMurdererId)
  if (!murderer) {
    errors.push({
      code: 'MISSING_MURDERER',
      message: `Murderer ID "${declaredMurdererId}" was not found in characters`,
    })
  } else {
    if (murderer.role !== 'suspect') {
      errors.push({
        code: 'MURDERER_NOT_SUSPECT',
        message: `Murderer "${declaredMurdererId}" must be a suspect, found role "${murderer.role}"`,
      })
    }
    if (declaredMurdererId === puzzle.victimId) {
      errors.push({
        code: 'MURDERER_IS_VICTIM',
        message: 'The murderer cannot be the victim',
      })
    }
  }

  // 4. Grid bounds and area exclusivity
  const claimedCells = new Map<string, string>() // "row,col" -> areaId
  for (const area of puzzle.areas) {
    for (const cell of area.cells) {
      if (!isPositionWithinBounds(cell, grid)) {
        errors.push({
          code: 'OUT_OF_BOUNDS_AREA_CELL',
          message: `Area "${area.id}" cell (${cell.row}, ${cell.column}) is out of grid bounds`,
        })
      }
      const key = `${cell.row},${cell.column}`
      const existing = claimedCells.get(key)
      if (existing) {
        errors.push({
          code: 'OVERLAPPING_AREA_CELL',
          message: `Cell (${cell.row}, ${cell.column}) belongs to multiple areas ("${existing}" and "${area.id}")`,
        })
      } else {
        claimedCells.set(key, area.id)
      }
    }
  }

  // 5. Object bounds and collisions
  const objectPositions = new Set<string>()
  for (const obj of puzzle.objects) {
    if (!isPositionWithinBounds(obj.position, grid)) {
      errors.push({
        code: 'OUT_OF_BOUNDS_OBJECT',
        message: `Object "${obj.id}" at (${obj.position.row}, ${obj.position.column}) is out of grid bounds`,
      })
    }
    const key = `${obj.position.row},${obj.position.column}`
    if (objectPositions.has(key)) {
      errors.push({
        code: 'COLLIDING_OBJECTS',
        message: `Multiple objects placed at cell (${obj.position.row}, ${obj.position.column})`,
      })
    }
    objectPositions.add(key)
  }

  // 6. Declared Solution Checks
  const placements = puzzle.solution.placements

  // Must place every character
  for (const char of puzzle.characters) {
    if (!placements[char.id]) {
      errors.push({
        code: 'MISSING_SOLUTION_PLACEMENT',
        message: `Declared solution missing placement for character "${char.id}"`,
      })
    }
  }

  const solutionOccupiedCells = new Set<string>()
  for (const [charId, pos] of Object.entries(placements)) {
    if (!isPositionWithinBounds(pos, grid)) {
      errors.push({
        code: 'OUT_OF_BOUNDS_SOLUTION_PLACEMENT',
        message: `Character "${charId}" placed out of bounds at (${pos.row}, ${pos.column})`,
      })
    }
    if (isCellBlockedByObject(pos, puzzle.objects)) {
      errors.push({
        code: 'BLOCKED_SOLUTION_PLACEMENT',
        message: `Character "${charId}" placed on blocked object cell at (${pos.row}, ${pos.column})`,
      })
    }
    const key = `${pos.row},${pos.column}`
    if (solutionOccupiedCells.has(key)) {
      errors.push({
        code: 'OVERLAPPING_SOLUTION_PLACEMENT',
        message: `Multiple characters share cell (${pos.row}, ${pos.column}) in declared solution`,
      })
    }
    solutionOccupiedCells.add(key)
  }

  // 7. Verify declared solution satisfies every clue
  const context = createConstraintContext(puzzle)
  for (const clue of puzzle.clues) {
    if (!evaluateConstraint(clue.constraint, placements, context)) {
      errors.push({
        code: 'DECLARED_SOLUTION_VIOLATES_CLUE',
        message: `Declared solution violates clue "${clue.id}": "${clue.text}"`,
      })
    }
  }

  // 8. Verify murderer deduction rule: murderer was alone with victim in victim's area
  const derivedMurdererId = determineMurdererId(puzzle, placements)
  if (!derivedMurdererId) {
    errors.push({
      code: 'NO_LONE_SUSPECT_WITH_VICTIM',
      message: 'In declared solution, victim does not share an area with exactly one suspect',
    })
  } else if (derivedMurdererId !== declaredMurdererId) {
    errors.push({
      code: 'MURDERER_MISMATCH',
      message: `Declared murderer is "${declaredMurdererId}", but lone suspect with victim is "${derivedMurdererId}"`,
    })
  }

  // If there are structural errors before solver, exit early
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    }
  }

  // 9. Run solver to prove uniqueness
  const solveResult = solvePuzzle(puzzle, { maxSolutions: 2 })

  if (solveResult.solutionCount === 0) {
    errors.push({
      code: 'IMPOSSIBLE_PUZZLE',
      message: 'Solver found 0 solutions; puzzle is impossible to solve',
    })
  } else if (solveResult.solutionCount > 1) {
    errors.push({
      code: 'AMBIGUOUS_PUZZLE',
      message: 'Solver found multiple valid solutions; puzzle is ambiguous',
    })
  } else if (solveResult.solution) {
    // Verify solver solution matches declared solution
    const solverPlacements = solveResult.solution.placements
    for (const [charId, pos] of Object.entries(placements)) {
      const sPos = solverPlacements[charId]
      if (!sPos || !isPositionEqual(pos, sPos)) {
        errors.push({
          code: 'SOLVER_DECLARED_MISMATCH',
          message: `Solver placed "${charId}" at (${sPos?.row},${sPos?.column}) but declared was (${pos.row},${pos.column})`,
        })
      }
    }
    if (solveResult.solution.murdererId !== declaredMurdererId) {
      errors.push({
        code: 'SOLVER_MURDERER_MISMATCH',
        message: `Solver murderer "${solveResult.solution.murdererId}" does not match declared murderer "${declaredMurdererId}"`,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    solveResult,
  }
}
