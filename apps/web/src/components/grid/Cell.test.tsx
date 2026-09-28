import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DndContext } from '@dnd-kit/core'
import { puzzleSchema, type Puzzle } from '@casegrid/puzzle-engine'
import rawCase from '../../../public/puzzles/case-001.json'
import { useGameStore } from '../../stores/gameStore'
import { Cell } from './Cell'

const puzzle = puzzleSchema.parse(rawCase) as Puzzle

describe('Cell selection ergonomics', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.getState().loadCase(puzzle)
    useGameStore.getState().startInvestigation()
  })
  afterEach(cleanup)

  it('deselects character upon successful placement click', async () => {
    const user = userEvent.setup()
    useGameStore.getState().selectCharacter('evelyn')
    expect(useGameStore.getState().selectedCharacterId).toBe('evelyn')

    render(
      <DndContext>
        <Cell position={{ row: 0, column: 0 }} />
      </DndContext>,
    )

    const cell = screen.getByTestId('cell-0-0')
    await user.click(cell)

    expect(useGameStore.getState().placements.evelyn).toEqual({ row: 0, column: 0 })
    expect(useGameStore.getState().selectedCharacterId).toBeNull()
  })

  it('shows info feedback when clicking blocked cell without selected character', async () => {
    const user = userEvent.setup()
    const fountainObject = puzzle.objects[0] // Stone Fountain at { row: 1, column: 1 }

    render(
      <DndContext>
        <Cell position={fountainObject.position} mapObject={fountainObject} />
      </DndContext>,
    )

    const cell = screen.getByTestId(`cell-${fountainObject.position.row}-${fountainObject.position.column}`)
    await user.click(cell)

    const feedback = useGameStore.getState().feedback
    expect(feedback?.type).toBe('info')
    expect(feedback?.message).toContain('Stone Fountain blocks this cell. Characters cannot stand here.')
  })

  it('triggers blocked error feedback when clicking blocked cell with selected character', async () => {
    const user = userEvent.setup()
    useGameStore.getState().selectCharacter('evelyn')
    const fountainObject = puzzle.objects[0] // Stone Fountain at { row: 1, column: 1 }

    render(
      <DndContext>
        <Cell position={fountainObject.position} mapObject={fountainObject} />
      </DndContext>,
    )

    const cell = screen.getByTestId(`cell-${fountainObject.position.row}-${fountainObject.position.column}`)
    await user.click(cell)

    const feedback = useGameStore.getState().feedback
    expect(feedback?.type).toBe('error')
    expect(feedback?.message).toBe('That cell is blocked by the Stone Fountain.')
    expect(useGameStore.getState().placements.evelyn).toBeUndefined()
  })
})
