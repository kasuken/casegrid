/**
 * CaseGrid Catalog Progress
 * Pure helpers that combine catalog metadata with saved progress to pick entry points.
 */

import type { PuzzleMetadata, PuzzleProgress, PuzzleStatus } from '@casegrid/puzzle-engine'
import { loadProgress } from './progressStorage'

export interface CatalogEntry extends PuzzleMetadata {
  readonly status: PuzzleStatus
  readonly bestTime?: number
  readonly updatedAt?: number
}

export type NextCaseSuggestion =
  | { readonly kind: 'case'; readonly entry: CatalogEntry }
  | { readonly kind: 'all-complete' }
  | { readonly kind: 'none' }

export function isAvailable(entry: PuzzleMetadata): boolean {
  return entry.availability !== 'coming-soon'
}

export function withProgress(
  index: readonly PuzzleMetadata[],
  load: (id: string) => PuzzleProgress | null = loadProgress,
): CatalogEntry[] {
  return index.map((item) => {
    const progress = load(item.id)
    return {
      ...item,
      status: progress?.status ?? 'not-started',
      bestTime: progress?.bestTime,
      updatedAt: progress?.updatedAt,
    }
  })
}

/** The most recently touched in-progress case; catalog order breaks ties and older saves without timestamps. */
export function findActiveCase(entries: readonly CatalogEntry[]): CatalogEntry | undefined {
  let best: CatalogEntry | undefined
  for (const entry of entries) {
    if (entry.status !== 'in-progress' || !isAvailable(entry)) continue
    if (!best || (entry.updatedAt ?? 0) > (best.updatedAt ?? 0)) best = entry
  }
  return best
}

export function hasAnyProgress(entries: readonly CatalogEntry[]): boolean {
  return entries.some((entry) => entry.status !== 'not-started')
}

/**
 * Suggests the next unsolved, published case after `currentId` in catalog order
 * (which follows difficulty progression), wrapping to earlier cases if needed.
 */
export function selectNextCase(
  entries: readonly CatalogEntry[],
  currentId?: string,
): NextCaseSuggestion {
  const available = entries.filter(isAvailable)
  if (available.length === 0) return { kind: 'none' }

  const start = currentId ? entries.findIndex((entry) => entry.id === currentId) + 1 : 0
  const ordered = [...entries.slice(start), ...entries.slice(0, start)]
  const next = ordered.find(
    (entry) => entry.id !== currentId && isAvailable(entry) && entry.status !== 'completed',
  )
  if (next) return { kind: 'case', entry: next }

  return available.every((entry) => entry.status === 'completed')
    ? { kind: 'all-complete' }
    : { kind: 'none' }
}
