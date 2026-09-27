import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { puzzleSchema, type Puzzle } from '@casegrid/puzzle-engine'
import rawCase from '../../../public/puzzles/case-001.json'
import { useGameStore } from '../../stores/gameStore'
import { useUndoShortcut } from '../../hooks/useUndoShortcut'
import { UndoButton } from './UndoButton'

const puzzle = puzzleSchema.parse(rawCase) as Puzzle

function Harness() {
  const stage = useGameStore((s) => s.stage)
  const undo = useGameStore((s) => s.undo)
  useUndoShortcut(stage === 'investigating', undo)
  return (
    <>
      <label>
        Scratch <input data-testid="scratch" />
      </label>
      <UndoButton />
    </>
  )
}

describe('Undo control', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.getState().loadCase(puzzle)
    useGameStore.getState().startInvestigation()
  })
  afterEach(cleanup)

  it('explains that there is nothing to undo and stays inert', async () => {
    render(<Harness />)
    const button = screen.getByTestId('undo-btn')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveAccessibleDescription('Nothing to undo yet.')

    await userEvent.click(button)
    expect(useGameStore.getState().feedback).toBeNull()
  })

  it('undoes the last placement when clicked', async () => {
    render(<Harness />)
    useGameStore.getState().placeCharacter('evelyn', { row: 0, column: 0 })
    const button = await screen.findByRole('button', { name: /undo/i })
    expect(button).toHaveAttribute('aria-disabled', 'false')

    await userEvent.click(button)
    expect(useGameStore.getState().placements.evelyn).toBeUndefined()
  })

  it('supports Ctrl+Z and Cmd+Z but leaves text fields alone', () => {
    render(<Harness />)
    const { placeCharacter } = useGameStore.getState()
    placeCharacter('evelyn', { row: 0, column: 0 })
    placeCharacter('arthur', { row: 1, column: 3 })

    fireEvent.keyDown(screen.getByTestId('scratch'), { key: 'z', ctrlKey: true })
    expect(useGameStore.getState().placements.arthur).toEqual({ row: 1, column: 3 })

    fireEvent.keyDown(document.body, { key: 'z', ctrlKey: true })
    expect(useGameStore.getState().placements.arthur).toBeUndefined()

    fireEvent.keyDown(document.body, { key: 'Z', metaKey: true })
    expect(useGameStore.getState().placements.evelyn).toBeUndefined()
  })

  it('does not treat Ctrl+Shift+Z as undo', () => {
    render(<Harness />)
    useGameStore.getState().placeCharacter('evelyn', { row: 0, column: 0 })
    fireEvent.keyDown(document.body, { key: 'z', ctrlKey: true, shiftKey: true })
    expect(useGameStore.getState().placements.evelyn).toEqual({ row: 0, column: 0 })
  })
})
