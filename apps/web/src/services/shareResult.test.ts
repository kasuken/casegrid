import { describe, expect, it } from 'vitest'
import type { Puzzle } from '@casegrid/puzzle-engine'
import case001 from '../../public/puzzles/case-001.json'
import case002 from '../../public/puzzles/case-002.json'
import case003 from '../../public/puzzles/case-003.json'
import case004 from '../../public/puzzles/case-004.json'
import case005 from '../../public/puzzles/case-005.json'
import { buildShareContent, caseUrl, formatDuration } from './shareResult'

const published = [case001, case002, case003, case004, case005] as Puzzle[]

describe('share content', () => {
  it('describes the result and invites a friend to the exact case', () => {
    const share = buildShareContent({
      caseId: 'case-001',
      caseNumber: '01',
      title: 'The Rosewood Parlor',
      elapsedSeconds: 204,
      mistakes: 1,
      nudgesUsed: 2,
      origin: 'https://casegrid.example/',
    })
    expect(share.text).toBe(
      'CaseGrid · Case 01: The Rosewood Parlor\nCASE CLOSED in 03:24 · 1 mistake · 2 nudges\nCan you solve this case?',
    )
    expect(share.url).toBe('https://casegrid.example/case/case-001')
    expect(share.imageAlt).toContain('solved in 03:24')
  })

  it('omits the nudge count for cases without nudges', () => {
    const share = buildShareContent({
      caseId: 'case-009',
      caseNumber: '09',
      title: 'X',
      elapsedSeconds: 61,
      mistakes: 0,
      origin: 'https://a.b',
    })
    expect(share.text).toContain('CASE CLOSED in 01:01 · 0 mistakes\n')
    expect(share.text).not.toContain('nudge')
  })

  it.each(published.map((p) => [p.id, p] as const))('%s share output reveals no solution details', (_id, puzzle) => {
    const share = buildShareContent({
      caseId: puzzle.id,
      caseNumber: puzzle.id.slice(-2),
      title: puzzle.title,
      elapsedSeconds: 300,
      mistakes: 3,
      nudgesUsed: 1,
      origin: 'https://casegrid.example',
    })
    const output = [share.title, share.text, share.url, share.imageAlt].join('\n')
    for (const character of puzzle.characters) {
      expect(output).not.toContain(character.name)
    }
    for (const step of puzzle.deductions ?? []) expect(output).not.toContain(step.text)
    if (puzzle.resolution) expect(output).not.toContain(puzzle.resolution)
    expect(output).not.toMatch(/row \d|column \d|murder/i)
    expect(new URL(share.url).search).toBe('')
  })

  it('formats durations and encodes case ids in links', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(3599)).toBe('59:59')
    expect(caseUrl('https://x.y', 'case 1')).toBe('https://x.y/case/case%201')
  })
})
