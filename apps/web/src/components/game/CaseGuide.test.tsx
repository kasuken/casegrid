import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { puzzleSchema, type Puzzle } from '@casegrid/puzzle-engine'
import rawCase from '../../../public/puzzles/case-001.json'
import { useGameStore } from '../../stores/gameStore'
import { useGuideStore } from '../../stores/guideStore'
import { CaseGuide } from './CaseGuide'
import { CaseBriefingModal } from './CaseBriefingModal'

const puzzle = puzzleSchema.parse(rawCase) as Puzzle

describe('CaseGuide on the first case', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.getState().loadCase(puzzle)
    useGameStore.getState().startInvestigation()
    useGuideStore.getState().init(puzzle.id, puzzle.tutorial ?? [])
  })
  afterEach(cleanup)

  it('teaches with the authored steps and advances as the player acts on the board', () => {
    render(<CaseGuide />)
    expect(screen.getByRole('heading', { name: 'Pick a person' })).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 6/)).toBeInTheDocument()

    act(() => useGameStore.getState().selectCharacter('evelyn'))
    expect(screen.getByRole('heading', { name: 'Place them on the map' })).toBeInTheDocument()

    act(() => useGameStore.getState().placeCharacter('evelyn', { row: 2, column: 2 }))
    expect(screen.getByRole('heading', { name: '“Beside” means sharing an edge' })).toBeInTheDocument()
  })

  it('never changes placements, notes, or the timer on its own', async () => {
    render(<CaseGuide />)
    const before = useGameStore.getState()
    await userEvent.click(screen.getByTestId('guide-next-btn'))
    await userEvent.click(screen.getByTestId('guide-next-btn'))
    const after = useGameStore.getState()
    expect(after.placements).toBe(before.placements)
    expect(after.exclusions).toBe(before.exclusions)
    expect(after.solvedClueIds).toBe(before.solvedClueIds)
    expect(after.isTimerRunning).toBe(true)
  })

  it('can be skipped and brought back from the case file', async () => {
    render(
      <>
        <CaseGuide />
        <CaseBriefingModal isOpen onClose={() => {}} />
      </>,
    )
    await userEvent.click(screen.getByTestId('guide-skip-btn'))
    expect(screen.queryByTestId('case-guide')).not.toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'How to play' })).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('reopen-guide-btn'))
    expect(screen.getByTestId('case-guide')).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 6/)).toBeInTheDocument()
  })
})
