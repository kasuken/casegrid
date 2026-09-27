import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { puzzleSchema, type Puzzle, type PuzzleMetadata, type PuzzleProgress } from '@casegrid/puzzle-engine'
import rawCase from '../../../public/puzzles/case-001.json'
import rawIndex from '../../../public/puzzles/index.json'
import { useGameStore } from '../../stores/gameStore'
import { saveProgress } from '../../services/progressStorage'
import { ResultView } from './ResultView'
import { ResultPage } from '../../pages/ResultPage'

const puzzle = puzzleSchema.parse(rawCase) as Puzzle
const index = rawIndex as PuzzleMetadata[]

const { fetchPuzzleIndexMock } = vi.hoisted(() => ({ fetchPuzzleIndexMock: vi.fn() }))
vi.mock('../../services/puzzleLoader', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/puzzleLoader')>()),
  fetchPuzzleIndex: fetchPuzzleIndexMock,
}))

const completed = (puzzleId: string, extra: Partial<PuzzleProgress> = {}): PuzzleProgress => ({
  puzzleId,
  status: 'completed',
  placements: puzzleId === puzzle.id ? puzzle.solution.placements : {},
  exclusions: {},
  solvedClueIds: [],
  elapsedSeconds: 185,
  mistakes: 1,
  bestTime: 150,
  ...extra,
})

function stubFetch(catalog: PuzzleMetadata[] = index, failIndex = false) {
  fetchPuzzleIndexMock.mockReset()
  if (failIndex) fetchPuzzleIndexMock.mockRejectedValue(new Error('offline'))
  else fetchPuzzleIndexMock.mockResolvedValue(catalog)
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (url.includes('index.json')) {
        return failIndex
          ? Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve(null) })
          : Promise.resolve({ ok: true, json: () => Promise.resolve(catalog) })
      }
      if (url.includes('case-001.json')) return Promise.resolve({ ok: true, json: () => Promise.resolve(rawCase) })
      return Promise.reject(new Error(`Unexpected ${url}`))
    }),
  )
}

function renderClosed() {
  saveProgress(completed(puzzle.id))
  useGameStore.getState().loadCase(puzzle, completed(puzzle.id))
  return render(
    <MemoryRouter>
      <ResultView />
    </MemoryRouter>,
  )
}

describe('ResultView', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows the authored resolution and keeps stats, replay, and browsing', async () => {
    stubFetch()
    renderClosed()
    expect(screen.getByTestId('case-closed-stamp')).toHaveTextContent('CASE CLOSED')
    expect(screen.getByTestId('result-resolution')).toHaveTextContent(/Evelyn Rosewood was the only person in the conservatory/)
    expect(screen.getByTestId('result-time')).toHaveTextContent('03:05')
    expect(screen.getByTestId('result-mistakes')).toHaveTextContent('1')
    expect(screen.getByTestId('result-best-time')).toHaveTextContent('02:30')
    expect(screen.getByTestId('replay-btn')).toBeInTheDocument()
    expect(screen.getByTestId('back-to-cases-btn')).toHaveAttribute('href', '/')
    expect(screen.getByRole('heading', { name: 'Mystery Solved' })).toHaveFocus()
    await screen.findByTestId('next-case-card')
  })

  it('reveals the walkthrough with clue references on request', async () => {
    stubFetch()
    renderClosed()
    expect(screen.queryByTestId('deduction-steps')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('see-deductions-btn'))
    const steps = screen.getByTestId('deduction-steps')
    expect(steps.querySelectorAll('li')).toHaveLength(puzzle.deductions?.length ?? 0)
    expect(steps).toHaveTextContent('Clues 02, 03')
    expect(screen.getByTestId('see-deductions-btn')).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens the next unsolved case in catalog order', async () => {
    stubFetch()
    renderClosed()
    const link = await screen.findByTestId('open-next-case-btn')
    expect(link).toHaveTextContent('Open the next case')
    expect(link).toHaveAttribute('href', '/case/case-002')
    expect(screen.getByRole('heading', { name: 'The Grand Antiquary' })).toBeInTheDocument()
  })

  it('offers to resume a next case that is already in progress, without touching its save', async () => {
    stubFetch()
    const inProgress: PuzzleProgress = {
      ...completed('case-002'),
      status: 'in-progress',
      placements: { nadia: { row: 0, column: 0 } },
    }
    saveProgress(inProgress)
    renderClosed()
    const link = await screen.findByTestId('open-next-case-btn')
    expect(link).toHaveTextContent('Resume case 02')
    const saved = JSON.parse(localStorage.getItem('casegrid_progress_v1_case-002') ?? '{}')
    expect(saved.placements).toEqual({ nadia: { row: 0, column: 0 } })
  })

  it('celebrates when every published case is closed', async () => {
    stubFetch()
    for (const meta of index.filter((m) => m.availability !== 'coming-soon')) saveProgress(completed(meta.id))
    renderClosed()
    expect(await screen.findByText('Every published case is closed')).toBeInTheDocument()
    expect(screen.queryByTestId('open-next-case-btn')).not.toBeInTheDocument()
  })

  it('leaves out the next-case action when the catalog cannot be loaded', async () => {
    stubFetch(index, true)
    renderClosed()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(screen.queryByTestId('next-case-card')).not.toBeInTheDocument()
    expect(screen.getByTestId('replay-btn')).toBeInTheDocument()
  })
})

describe('ResultPage spoiler safety', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('reveals nothing on the result route while the case is unsolved', async () => {
    stubFetch()
    saveProgress({ ...completed(puzzle.id), status: 'in-progress', placements: {} })
    render(
      <MemoryRouter initialEntries={['/case/case-001/result']}>
        <Routes>
          <Route path="/case/:caseId/result" element={<ResultPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText('Investigation Still Active')).toBeInTheDocument()
    expect(screen.queryByTestId('result-resolution')).not.toBeInTheDocument()
    expect(screen.queryByTestId('see-deductions-btn')).not.toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/alone with Lord Reginald/)
  })
})
