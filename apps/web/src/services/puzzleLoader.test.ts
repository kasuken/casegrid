import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import puzzle from '../../public/puzzles/case-001.json'

describe('case availability', () => {
  beforeEach(() => vi.resetModules())
  afterEach(() => vi.unstubAllGlobals())

  function mockCatalog(availability: 'available' | 'coming-soon') {
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () => url.endsWith('index.json')
        ? [{ id: puzzle.id, title: puzzle.title, difficulty: puzzle.difficulty, suspectCount: 5, availability }]
        : puzzle,
    }))
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  it('loads and caches an available case', async () => {
    const fetchMock = mockCatalog('available')
    const { fetchPuzzle } = await import('./puzzleLoader')
    expect(await fetchPuzzle(puzzle.id)).toEqual(puzzle)
    expect(await fetchPuzzle(puzzle.id)).toEqual(puzzle)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('blocks upcoming cases before fetching their full data', async () => {
    const fetchMock = mockCatalog('coming-soon')
    const { fetchPuzzle, CaseComingSoonError } = await import('./puzzleLoader')
    await expect(fetchPuzzle(puzzle.id)).rejects.toBeInstanceOf(CaseComingSoonError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/puzzles/index.json')
  })

  describe('weekly schedule', () => {
    const catalog = [{ id: 'case-002', title: 'B', difficulty: 'easy' as const, suspectCount: 5, availability: 'available' as const }]
    const stub = (response: { ok: boolean; body?: unknown }) =>
      vi.stubGlobal('fetch', vi.fn(async () => ({ ok: response.ok, status: response.ok ? 200 : 404, json: async () => response.body })))

    it('loads a valid schedule', async () => {
      stub({ ok: true, body: { weeks: [{ weekStart: '2026-09-21', caseId: 'case-002' }] } })
      const { fetchWeeklySchedule } = await import('./puzzleLoader')
      expect(await fetchWeeklySchedule(catalog)).toEqual({ weeks: [{ weekStart: '2026-09-21', caseId: 'case-002' }] })
    })

    it('treats a missing, malformed, or unpublished schedule as no featured case', async () => {
      const { fetchWeeklySchedule } = await import('./puzzleLoader')
      stub({ ok: false })
      expect(await fetchWeeklySchedule(catalog)).toBeNull()
      stub({ ok: true, body: { weeks: [{ weekStart: 'soon', caseId: 'case-002' }] } })
      expect(await fetchWeeklySchedule(catalog)).toBeNull()
      stub({ ok: true, body: { weeks: [{ weekStart: '2026-09-21', caseId: 'case-099' }] } })
      expect(await fetchWeeklySchedule(catalog)).toBeNull()
    })
  })

  it('rejects unknown case IDs without requesting arbitrary files', async () => {
    const fetchMock = mockCatalog('available')
    const { fetchPuzzle } = await import('./puzzleLoader')
    await expect(fetchPuzzle('case-missing')).rejects.toThrow('was not found')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
