import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { selectFeaturedCase, type WeeklySchedule } from '@casegrid/puzzle-engine'
import type { CatalogEntry } from '../../services/caseProgress'
import { WeeklyCasePanel } from './WeeklyCasePanel'

const entries: CatalogEntry[] = [
  { id: 'case-001', title: 'The Rosewood Parlor', difficulty: 'beginner', suspectCount: 5, status: 'not-started' },
  { id: 'case-002', title: 'The Grand Antiquary', subtitle: 'A silent museum', difficulty: 'easy', suspectCount: 5, status: 'not-started' },
]
const schedule: WeeklySchedule = { weeks: [{ weekStart: '2026-09-21', caseId: 'case-002' }] }
const midWeek = Date.parse('2026-09-24T10:00:00Z')

const renderPanel = (list: CatalogEntry[], now = midWeek) =>
  render(
    <MemoryRouter>
      <WeeklyCasePanel entries={list} featured={selectFeaturedCase(schedule, now)} />
    </MemoryRouter>,
  )

describe('WeeklyCasePanel', () => {
  afterEach(cleanup)

  it('features the scheduled case with its canonical link and UTC deadline', () => {
    renderPanel(entries)
    expect(screen.getByRole('heading', { name: 'Case 02: The Grand Antiquary' })).toBeInTheDocument()
    expect(screen.getByText(/until Mon 28 Sept?, 00:00 UTC/)).toBeInTheDocument()
    expect(screen.getByTestId('weekly-case-btn')).toHaveAttribute('href', '/case/case-002')
    expect(screen.queryByText(/new/i)).not.toBeInTheDocument()
  })

  it('keeps the true status of a featured case the player already started or solved', () => {
    renderPanel([entries[0], { ...entries[1], status: 'in-progress' }])
    expect(screen.getByTestId('weekly-case-btn')).toHaveTextContent('Resume this week’s case')
    cleanup()

    renderPanel([entries[0], { ...entries[1], status: 'completed', bestTime: 125 }])
    expect(screen.getByTestId('weekly-status')).toHaveTextContent('You closed this case · best time 02:05.')
  })

  it('shows a clear fallback once the schedule has run out', () => {
    renderPanel(entries, Date.parse('2026-10-20T00:00:00Z'))
    expect(screen.getByText(/No Case of the Week is scheduled right now/)).toBeInTheDocument()
    expect(screen.queryByTestId('weekly-case-btn')).not.toBeInTheDocument()
  })

  it('shows the fallback when the schedule could not be loaded', () => {
    render(
      <MemoryRouter>
        <WeeklyCasePanel entries={entries} featured={null} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/No Case of the Week is scheduled right now/)).toBeInTheDocument()
  })
})
