import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import type { CatalogEntry } from '../../services/caseProgress'
import { StartPanel } from './StartPanel'

const entry = (id: string, title: string, status: CatalogEntry['status'], extra: Partial<CatalogEntry> = {}): CatalogEntry => ({
  id,
  title,
  difficulty: 'beginner',
  suspectCount: 5,
  availability: 'available',
  status,
  ...extra,
})

const renderPanel = (entries: CatalogEntry[]) =>
  render(
    <MemoryRouter>
      <StartPanel entries={entries} />
    </MemoryRouter>,
  )

describe('StartPanel', () => {
  afterEach(cleanup)

  it('invites a new player to solve the first published mystery', () => {
    renderPanel([entry('case-001', 'The Rosewood Parlor', 'not-started'), entry('case-002', 'The Grand Antiquary', 'not-started')])
    const cta = screen.getByRole('link', { name: 'Solve your first mystery' })
    expect(cta).toHaveAttribute('href', '/case/case-001')
    expect(screen.getByRole('heading', { name: /Start with The Rosewood Parlor/ })).toBeInTheDocument()
  })

  it('lets a returning player resume their most recent investigation', () => {
    renderPanel([
      entry('case-001', 'The Rosewood Parlor', 'in-progress', { updatedAt: 10 }),
      entry('case-002', 'The Grand Antiquary', 'in-progress', { updatedAt: 50 }),
    ])
    expect(screen.getByRole('link', { name: 'Resume investigation' })).toHaveAttribute('href', '/case/case-002')
    expect(screen.getByRole('heading', { name: 'Case 02: The Grand Antiquary' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Solve your first mystery' })).not.toBeInTheDocument()
  })

  it('points a player with only finished cases to the next unsolved one', () => {
    renderPanel([entry('case-001', 'The Rosewood Parlor', 'completed'), entry('case-002', 'The Grand Antiquary', 'not-started')])
    expect(screen.getByRole('link', { name: 'Open case 02' })).toHaveAttribute('href', '/case/case-002')
  })

  it('renders nothing when every published case is solved', () => {
    const { container } = renderPanel([entry('case-001', 'The Rosewood Parlor', 'completed')])
    expect(container).toBeEmptyDOMElement()
  })
})
