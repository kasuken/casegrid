/**
 * CaseGrid Puzzle Engine - Deduction Path Analysis
 * Authoring aid: checks whether a case yields to step-by-step clue propagation,
 * the kind of reasoning a player can follow without trial and error.
 */

import { createConstraintContext, evaluateConstraint, type ConstraintContext } from './constraints.ts'
import {
  encodePosition,
  getAreaForPosition,
  getValidPlacementCells,
  isCellInArea,
  isPositionEqual,
} from './grid.ts'
import type { Clue, Position, Puzzle } from './types.ts'

export const DISTINCT_CELLS_RULE = 'distinct-cells'

export interface DeductionTraceEntry {
  readonly round: number
  /** Clue ID, or DISTINCT_CELLS_RULE when a pinned character frees a cell for nobody else. */
  readonly source: string
  readonly characterId: string
  readonly removed: number
  readonly remaining: number
}

export interface DeductionAnalysis {
  /** True when propagation alone pins every character to a single cell. */
  readonly solvedByPropagation: boolean
  readonly rounds: number
  readonly trace: readonly DeductionTraceEntry[]
  readonly domains: Readonly<Record<string, readonly Position[]>>
  /** Order in which characters were first pinned to a single cell. */
  readonly pinnedOrder: readonly string[]
}

type Domains = Map<string, Position[]>

const UNARY_TYPES = new Set([
  'character_in_area',
  'character_not_in_area',
  'character_at_position',
  'character_in_row',
  'character_in_column',
  'character_adjacent_to_object',
  'character_not_adjacent_to_object',
])

function areaIdOf(pos: Position, context: ConstraintContext): string | undefined {
  return getAreaForPosition(pos, context.areas)?.id
}

/** Returns the cells each affected character may still occupy after applying one clue. */
function pruneByClue(
  clue: Clue,
  domains: Domains,
  context: ConstraintContext,
): Map<string, Position[]> {
  const updates = new Map<string, Position[]>()
  const c = clue.constraint

  if (UNARY_TYPES.has(c.type) && 'characterId' in c) {
    const domain = domains.get(c.characterId) ?? []
    updates.set(
      c.characterId,
      domain.filter((p) => evaluateConstraint(c, { [c.characterId]: p }, context)),
    )
    return updates
  }

  switch (c.type) {
    case 'character_adjacent_to_character':
    case 'character_not_adjacent_to_character':
    case 'characters_same_area':
    case 'characters_different_area': {
      const a = c.characterId
      const b = c.targetCharacterId
      const domA = domains.get(a) ?? []
      const domB = domains.get(b) ?? []
      const supported = (p: Position, q: Position) =>
        !isPositionEqual(p, q) && evaluateConstraint(c, { [a]: p, [b]: q }, context)
      updates.set(a, domA.filter((p) => domB.some((q) => supported(p, q))))
      updates.set(b, domB.filter((q) => domA.some((p) => supported(p, q))))
      return updates
    }

    case 'character_alone_in_area': {
      const own = domains.get(c.characterId) ?? []
      updates.set(
        c.characterId,
        own.filter((p) => areaIdOf(p, context) !== undefined),
      )
      const candidateAreas = new Set(own.map((p) => areaIdOf(p, context)))
      if (candidateAreas.size === 1) {
        const [areaId] = candidateAreas
        const area = areaId ? context.areaMap.get(areaId) : undefined
        if (area) {
          for (const [charId, domain] of domains) {
            if (charId !== c.characterId) {
              updates.set(charId, domain.filter((p) => !isCellInArea(p, area)))
            }
          }
        }
      }
      return updates
    }

    case 'exactly_n_characters_in_area': {
      const area = context.areaMap.get(c.areaId)
      if (!area) return updates
      const must: string[] = []
      const can: string[] = []
      for (const [charId, domain] of domains) {
        const inside = domain.filter((p) => isCellInArea(p, area)).length
        if (inside > 0) can.push(charId)
        if (inside > 0 && inside === domain.length) must.push(charId)
      }
      if (must.length === c.count) {
        for (const [charId, domain] of domains) {
          if (!must.includes(charId)) {
            updates.set(charId, domain.filter((p) => !isCellInArea(p, area)))
          }
        }
      } else if (can.length === c.count) {
        for (const charId of can) {
          updates.set(charId, (domains.get(charId) ?? []).filter((p) => isCellInArea(p, area)))
        }
      }
      return updates
    }

    default:
      return updates
  }
}

export function analyzeDeductionPath(puzzle: Puzzle): DeductionAnalysis {
  const context = createConstraintContext(puzzle)
  const validCells = getValidPlacementCells(puzzle.grid, puzzle.objects)
  const domains: Domains = new Map(puzzle.characters.map((ch) => [ch.id, [...validCells]]))
  const trace: DeductionTraceEntry[] = []
  const pinnedOrder: string[] = []

  const apply = (round: number, source: string, updates: Map<string, Position[]>) => {
    let changed = false
    for (const [charId, next] of updates) {
      const before = domains.get(charId) ?? []
      if (next.length < before.length) {
        domains.set(charId, next)
        trace.push({
          round,
          source,
          characterId: charId,
          removed: before.length - next.length,
          remaining: next.length,
        })
        if (next.length === 1 && !pinnedOrder.includes(charId)) pinnedOrder.push(charId)
        changed = true
      }
    }
    return changed
  }

  let round = 0
  let changed = true
  while (changed) {
    round++
    changed = false

    for (const clue of puzzle.clues) {
      if (apply(round, clue.id, pruneByClue(clue, domains, context))) changed = true
    }

    for (const [charId, domain] of domains) {
      if (domain.length !== 1) continue
      const pinned = encodePosition(domain[0])
      const updates = new Map<string, Position[]>()
      for (const [otherId, otherDomain] of domains) {
        if (otherId !== charId) {
          updates.set(otherId, otherDomain.filter((p) => encodePosition(p) !== pinned))
        }
      }
      if (apply(round, DISTINCT_CELLS_RULE, updates)) changed = true
    }

    if ([...domains.values()].some((d) => d.length === 0)) break
  }

  const finalDomains: Record<string, Position[]> = {}
  for (const [charId, domain] of domains) finalDomains[charId] = domain

  return {
    solvedByPropagation: [...domains.values()].every((d) => d.length === 1),
    rounds: round,
    trace,
    domains: finalDomains,
    pinnedOrder,
  }
}
