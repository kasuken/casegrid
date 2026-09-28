import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { puzzleSchema, type Puzzle } from '@casegrid/puzzle-engine'
import rawCase from '../../../public/puzzles/case-001.json'
import { useGameStore } from '../../stores/gameStore'
import { CluePanel } from './CluePanel'

const puzzle = puzzleSchema.parse(rawCase) as Puzzle

describe('CluePanel', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.getState().loadCase(puzzle)
    useGameStore.getState().startInvestigation()
  })
  afterEach(cleanup)

  it('renders the clue panel and mobile floating action button', () => {
    render(<CluePanel />)
    expect(screen.getByRole('heading', { name: 'Witness Clues' })).toBeInTheDocument()
    expect(screen.getByTestId('mobile-clue-fab')).toBeInTheDocument()
    expect(screen.queryByTestId('mobile-clue-drawer')).not.toBeInTheDocument()
  })

  it('opens and closes the mobile clue drawer via close button', async () => {
    render(<CluePanel />)
    const fab = screen.getByTestId('mobile-clue-fab')

    await userEvent.click(fab)
    expect(screen.getByTestId('mobile-clue-drawer')).toBeInTheDocument()

    const closeBtn = screen.getByTestId('close-clue-drawer-btn')
    await userEvent.click(closeBtn)
    expect(screen.queryByTestId('mobile-clue-drawer')).not.toBeInTheDocument()
  })

  it('closes the drawer when backdrop overlay is clicked', async () => {
    const { container } = render(<CluePanel />)
    const fab = screen.getByTestId('mobile-clue-fab')

    await userEvent.click(fab)
    expect(screen.getByTestId('mobile-clue-drawer')).toBeInTheDocument()

    const overlay = container.querySelector('.mobile-clue-drawer-overlay')
    expect(overlay).not.toBeNull()
    if (overlay) {
      await userEvent.click(overlay)
    }
    expect(screen.queryByTestId('mobile-clue-drawer')).not.toBeInTheDocument()
  })

  it('closes the drawer when Escape key is pressed', async () => {
    render(<CluePanel />)
    const fab = screen.getByTestId('mobile-clue-fab')

    await userEvent.click(fab)
    expect(screen.getByTestId('mobile-clue-drawer')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByTestId('mobile-clue-drawer')).not.toBeInTheDocument()
  })

  it('toggles clue solved state from within the drawer', async () => {
    render(<CluePanel />)
    const fab = screen.getByTestId('mobile-clue-fab')

    await userEvent.click(fab)
    const drawer = screen.getByTestId('mobile-clue-drawer')
    const clueButtons = drawer.querySelectorAll('.clue-item__toggle')
    expect(clueButtons.length).toBeGreaterThan(0)

    const firstClueId = puzzle.clues[0].id
    expect(useGameStore.getState().solvedClueIds).not.toContain(firstClueId)

    await userEvent.click(clueButtons[0])
    expect(useGameStore.getState().solvedClueIds).toContain(firstClueId)

    await userEvent.click(clueButtons[0])
    expect(useGameStore.getState().solvedClueIds).not.toContain(firstClueId)
  })
})
