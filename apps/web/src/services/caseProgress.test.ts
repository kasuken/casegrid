import { describe, expect, it } from 'vitest'
import type { PuzzleMetadata, PuzzleProgress } from '@casegrid/puzzle-engine'
import {
  findActiveCase,
  hasAnyProgress,
  selectNextCase,
  withProgress,
  type CatalogEntry,
} from './caseProgress'

const meta = (id: string, extra: Partial<PuzzleMetadata> = {}): PuzzleMetadata => ({
  id,
  title: `Title ${id}`,
  difficulty: 'easy',
  suspectCount: 5,
  availability: 'available',
  ...extra,
})

const entry = (id: string, status: CatalogEntry['status'], extra: Partial<CatalogEntry> = {}): CatalogEntry => ({
  ...meta(id),
  status,
  ...extra,
})

describe('catalog progress', () => {
  it('merges saved progress into catalog metadata', () => {
    const saved: Record<string, PuzzleProgress> = {
      b: {
        puzzleId: 'b',
        status: 'completed',
        placements: {},
        exclusions: {},
        solvedClueIds: [],
        elapsedSeconds: 70,
        mistakes: 0,
        bestTime: 70,
        updatedAt: 5,
      },
    }
    const entries = withProgress([meta('a'), meta('b')], (id) => saved[id] ?? null)
    expect(entries.map((e) => [e.id, e.status, e.bestTime, e.updatedAt])).toEqual([
      ['a', 'not-started', undefined, undefined],
      ['b', 'completed', 70, 5],
    ])
    expect(hasAnyProgress(entries)).toBe(true)
    expect(hasAnyProgress(withProgress([meta('a')], () => null))).toBe(false)
  })

  it('finds the most recently updated active case, ignoring unpublished ones', () => {
    const entries = [
      entry('a', 'in-progress'),
      entry('b', 'in-progress', { updatedAt: 20 }),
      entry('c', 'in-progress', { updatedAt: 10 }),
      entry('d', 'in-progress', { updatedAt: 99, availability: 'coming-soon' }),
    ]
    expect(findActiveCase(entries)?.id).toBe('b')
    expect(findActiveCase([entry('a', 'in-progress'), entry('b', 'in-progress')])?.id).toBe('a')
    expect(findActiveCase([entry('a', 'completed')])).toBeUndefined()
  })

  describe('selectNextCase', () => {
    it('picks the next unsolved published case in catalog order', () => {
      const entries = [entry('a', 'completed'), entry('b', 'completed'), entry('c', 'not-started')]
      expect(selectNextCase(entries, 'a')).toEqual({ kind: 'case', entry: entries[2] })
    })

    it('offers an in-progress next case so it can be resumed rather than restarted', () => {
      const entries = [entry('a', 'completed'), entry('b', 'in-progress', { updatedAt: 3 })]
      const next = selectNextCase(entries, 'a')
      expect(next.kind === 'case' && next.entry.status).toBe('in-progress')
    })

    it('skips unpublished cases and wraps around to earlier unsolved ones', () => {
      const entries = [
        entry('a', 'not-started'),
        entry('b', 'completed'),
        entry('c', 'not-started', { availability: 'coming-soon' }),
      ]
      expect(selectNextCase(entries, 'b')).toEqual({ kind: 'case', entry: entries[0] })
    })

    it('reports when every published case is complete', () => {
      const entries = [entry('a', 'completed'), entry('b', 'completed'), entry('c', 'not-started', { availability: 'coming-soon' })]
      expect(selectNextCase(entries, 'b')).toEqual({ kind: 'all-complete' })
    })

    it('handles missing or unknown catalog data', () => {
      expect(selectNextCase([], 'a')).toEqual({ kind: 'none' })
      const entries = [entry('a', 'not-started')]
      expect(selectNextCase(entries, 'zzz')).toEqual({ kind: 'case', entry: entries[0] })
      expect(selectNextCase(entries)).toEqual({ kind: 'case', entry: entries[0] })
    })

    it('never suggests the current case', () => {
      expect(selectNextCase([entry('a', 'in-progress')], 'a')).toEqual({ kind: 'none' })
    })
  })
})
