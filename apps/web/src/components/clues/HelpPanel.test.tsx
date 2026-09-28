import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { puzzleSchema, type Puzzle } from '@casegrid/puzzle-engine'
import rawCase from '../../../public/puzzles/case-001.json'
import { useGameStore } from '../../stores/gameStore'
import { CluePanel } from './CluePanel'

const puzzle = puzzleSchema.parse(rawCase) as Puzzle
const prompts = puzzle.helpPrompts ?? []

describe('HelpPanel', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.getState().loadCase(puzzle)
    useGameStore.getState().startInvestigation()
  })
  afterEach(cleanup)

  it('reveals successive nudges with clue references and keeps earlier ones visible', async () => {
    render(<CluePanel />)
    const button = screen.getByTestId('reveal-help-btn')
    expect(button).toHaveTextContent('Need a nudge?')
    expect(screen.queryByTestId('revealed-help')).not.toBeInTheDocument()

    await userEvent.click(button)
    expect(screen.getByText(prompts[0].text)).toBeInTheDocument()
    expect(screen.getByText('Look at clue 01')).toBeInTheDocument()
    expect(button).toHaveTextContent('Another nudge')

    await userEvent.click(button)
    expect(screen.getByText(prompts[0].text)).toBeInTheDocument()
    expect(screen.getByText(prompts[1].text)).toBeInTheDocument()
    expect(useGameStore.getState().revealedHelpIds).toHaveLength(2)
  })

  it('stops at the last nudge without inflating the count', async () => {
    render(<CluePanel />)
    const button = screen.getByTestId('reveal-help-btn')
    for (let i = 0; i < prompts.length; i++) await userEvent.click(button)
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('No more nudges')
    expect(useGameStore.getState().revealedHelpIds).toHaveLength(prompts.length)
    expect(screen.getByTestId('revealed-help').querySelectorAll('li')).toHaveLength(prompts.length)
  })

  it('leaves placements, exclusions, and clue marks untouched', async () => {
    const { placeCharacter, toggleExclusion, toggleClueSolved } = useGameStore.getState()
    placeCharacter('evelyn', { row: 2, column: 2 })
    toggleExclusion('arthur', { row: 0, column: 0 })
    toggleClueSolved('clue-3')
    const before = useGameStore.getState()

    render(<CluePanel />)
    await userEvent.click(screen.getByTestId('reveal-help-btn'))
    const after = useGameStore.getState()
    expect(after.placements).toEqual(before.placements)
    expect(after.exclusions).toEqual(before.exclusions)
    expect(after.solvedClueIds).toEqual(before.solvedClueIds)
  })

  it('is absent for a case with no authored nudges', () => {
    useGameStore.getState().loadCase({ ...puzzle, helpPrompts: undefined })
    useGameStore.getState().startInvestigation()
    render(<CluePanel />)
    expect(screen.queryByTestId('help-panel')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Witness Clues' })).toBeInTheDocument()
  })
})
