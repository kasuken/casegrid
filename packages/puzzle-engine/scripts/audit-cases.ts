/**
 * CaseGrid Case Audit CLI
 * Prints structural metrics and a deduction-path check for every bundled case.
 * Usage: pnpm audit:cases [--trace case-001]
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyzeDeductionPath, DISTINCT_CELLS_RULE } from '../src/deduction.ts'
import { puzzleIndexSchema, puzzleSchema } from '../src/schemas.ts'
import type { Puzzle } from '../src/types.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const puzzlesDir = path.resolve(__dirname, '../../../apps/web/public/puzzles')

const traceIndex = process.argv.indexOf('--trace')
const traceCaseId = traceIndex >= 0 ? process.argv[traceIndex + 1] : undefined

const index = puzzleIndexSchema.parse(
  JSON.parse(fs.readFileSync(path.join(puzzlesDir, 'index.json'), 'utf-8')),
)

function loadCase(id: string): Puzzle {
  const raw = JSON.parse(fs.readFileSync(path.join(puzzlesDir, `${id}.json`), 'utf-8'))
  return puzzleSchema.parse(raw) as Puzzle
}

if (traceCaseId) {
  const puzzle = loadCase(traceCaseId)
  const analysis = analyzeDeductionPath(puzzle)
  const clueNumber = new Map(puzzle.clues.map((c, i) => [c.id, i + 1]))
  const names = new Map(puzzle.characters.map((c) => [c.id, c.name]))
  console.log(`# ${puzzle.id}: ${puzzle.title}\n`)
  puzzle.clues.forEach((c, i) => console.log(`${i + 1}. ${c.text}  [${c.constraint.type}]`))
  console.log('\n## Propagation trace\n')
  for (const t of analysis.trace) {
    const source =
      t.source === DISTINCT_CELLS_RULE ? 'one person per cell' : `clue ${clueNumber.get(t.source)}`
    console.log(
      `round ${t.round}: ${source} -> ${names.get(t.characterId)} -${t.removed} (${t.remaining} left)`,
    )
  }
  console.log(`\nsolvedByPropagation: ${analysis.solvedByPropagation}`)
  console.log(`pinned order: ${analysis.pinnedOrder.map((id) => names.get(id)).join(' -> ')}`)
  process.exit(0)
}

console.log(
  '| # | Case | Difficulty | Grid | Areas | Objects | People | Clues | Propagation | Rounds | Constraint mix |',
)
console.log('|---|---|---|---|---|---|---|---|---|---|---|')

index.forEach((meta, i) => {
  const puzzle = loadCase(meta.id)
  const analysis = analyzeDeductionPath(puzzle)
  const mix = new Map<string, number>()
  for (const clue of puzzle.clues) {
    mix.set(clue.constraint.type, (mix.get(clue.constraint.type) ?? 0) + 1)
  }
  const mixText = [...mix.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, n]) => `${type.replace(/^characters?_/, '')}×${n}`)
    .join(', ')
  console.log(
    `| ${i + 1} | ${meta.id} ${meta.title} | ${meta.difficulty} | ${puzzle.grid.width}×${puzzle.grid.height} | ${puzzle.areas.length} | ${puzzle.objects.length} | ${puzzle.characters.length} | ${puzzle.clues.length} | ${analysis.solvedByPropagation ? 'solved' : 'STALLS'} | ${analysis.rounds} | ${mixText} |`,
  )
})
