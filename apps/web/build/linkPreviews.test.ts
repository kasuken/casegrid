import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { casePreview, escapeHtml, HOME_PREVIEW, renderPreviewHead, type CatalogItem } from './linkPreviews.ts'

const publicDir = path.resolve(import.meta.dirname, '../public')
const html = fs.readFileSync(path.resolve(import.meta.dirname, '../index.html'), 'utf8')
const catalog = JSON.parse(fs.readFileSync(path.join(publicDir, 'puzzles/index.json'), 'utf8')) as CatalogItem[]

describe('link previews', () => {
  it('replaces the title and description and adds absolute Open Graph tags', () => {
    const out = renderPreviewHead(html, casePreview(catalog[0], '01'), 'https://casegrid.example/')
    expect(out).toContain('<title>Case 01: The Rosewood Parlor · CaseGrid</title>')
    expect(out.match(/name="description"/g)).toHaveLength(1)
    expect(out).toContain('<meta property="og:url" content="https://casegrid.example/case/case-001" />')
    expect(out).toContain('<meta property="og:image" content="https://casegrid.example/og/case-001.png" />')
    expect(out).toContain('<link rel="canonical" href="https://casegrid.example/case/case-001" />')
    expect(out).toContain('<script type="module"')
  })

  it('falls back to relative URLs without a configured site URL', () => {
    const out = renderPreviewHead(html, HOME_PREVIEW)
    expect(out).toContain('<meta property="og:image" content="/og/casegrid.png" />')
    expect(out).not.toContain('rel="canonical"')
  })

  it('escapes catalog copy', () => {
    expect(escapeHtml('A "quote" & <tag>')).toBe('A &quot;quote&quot; &amp; &lt;tag&gt;')
  })

  it.each(catalog.filter((c) => c.availability !== 'coming-soon').map((c) => [c.id] as const))(
    '%s preview reveals no solution details',
    (id) => {
      const item = catalog.find((c) => c.id === id)!
      const puzzle = JSON.parse(fs.readFileSync(path.join(publicDir, `puzzles/${id}.json`), 'utf8')) as {
        victimId: string
        characters: { id: string; name: string }[]
        solution: { murdererId: string }
        resolution?: string
      }
      const out = renderPreviewHead(html, casePreview(item, '01'), 'https://casegrid.example')
      const suspects = puzzle.characters.filter((c) => c.id !== puzzle.victimId)
      for (const suspect of suspects) expect(out).not.toContain(suspect.name)
      expect(out).not.toMatch(/row \d|column \d/)
      if (puzzle.resolution) expect(out).not.toContain(puzzle.resolution)
    },
  )
})
