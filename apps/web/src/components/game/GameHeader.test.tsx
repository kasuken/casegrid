import { act, cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import { puzzleSchema } from '@casegrid/puzzle-engine'
import puzzle from '../../../public/puzzles/case-001.json'
import { useGameStore } from '../../stores/gameStore'
import { GameHeader } from './GameHeader'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it('pauses while hidden and resumes when the tab becomes visible again', () => {
  vi.useFakeTimers()
  let hidden = false
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
  useGameStore.getState().loadCase(puzzleSchema.parse(puzzle))
  useGameStore.getState().startInvestigation()
  render(<MemoryRouter><GameHeader /></MemoryRouter>)
  act(() => vi.advanceTimersByTime(2000))
  expect(useGameStore.getState().elapsedSeconds).toBe(2)

  act(() => { hidden = true; document.dispatchEvent(new Event('visibilitychange')) })
  act(() => vi.advanceTimersByTime(4000))
  expect(useGameStore.getState().elapsedSeconds).toBe(2)

  act(() => { hidden = false; document.dispatchEvent(new Event('visibilitychange')) })
  act(() => vi.advanceTimersByTime(2000))
  expect(useGameStore.getState().elapsedSeconds).toBe(4)
})
