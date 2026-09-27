import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  analyzeDeductionPath,
  getAreaForPosition,
  puzzleIndexSchema,
  solvePuzzle,
  validatePuzzle,
  type Puzzle,
} from '../src/index.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const puzzlesDir = path.resolve(__dirname, '../../../apps/web/public/puzzles')

const index = puzzleIndexSchema.parse(JSON.parse(fs.readFileSync(path.join(puzzlesDir, 'index.json'), 'utf-8')))

describe('bundled cases validation', () => {
  const caseFiles = fs
    .readdirSync(puzzlesDir)
    .filter((f) => f.startsWith('case-') && f.endsWith('.json'))
    .sort()

  for (const caseFile of caseFiles) {
    const caseId = path.basename(caseFile, '.json')

    it(`locks ${caseId} uniqueness and declared solution`, () => {
      const filePath = path.join(puzzlesDir, caseFile)
      expect(fs.existsSync(filePath)).toBe(true)

      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      const validation = validatePuzzle(raw)

      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)

      const puzzle = raw as Puzzle
      const solveRes = solvePuzzle(puzzle, { maxSolutions: 2 })

      expect(solveRes.solutionCount).toBe(1)
      expect(solveRes.isUnique).toBe(true)
      expect(solveRes.solution?.placements).toEqual(puzzle.solution.placements)
      expect(solveRes.solution?.murdererId).toBe(puzzle.solution.murdererId)
    })

    it(`${caseId} is solvable by step-by-step deduction without trial and error`, () => {
      const puzzle = JSON.parse(fs.readFileSync(path.join(puzzlesDir, caseFile), 'utf-8')) as Puzzle
      const analysis = analyzeDeductionPath(puzzle)

      expect(analysis.solvedByPropagation).toBe(true)
      for (const [charId, domain] of Object.entries(analysis.domains)) {
        expect(domain).toEqual([puzzle.solution.placements[charId]])
      }
    })

    const published = index.find((entry) => entry.id === caseId)?.availability !== 'coming-soon'
    it.runIf(published)(`${caseId} does not signpost the murderer through a single clue`, () => {
      const puzzle = JSON.parse(fs.readFileSync(path.join(puzzlesDir, caseFile), 'utf-8')) as Puzzle
      const { victimId } = puzzle
      const murdererId = puzzle.solution.murdererId
      const victimArea = getAreaForPosition(puzzle.solution.placements[victimId], puzzle.areas)?.id
      const pair = (a: string, b: string) => [a, b].includes(victimId) && [a, b].includes(murdererId)

      for (const { id, constraint: c } of puzzle.clues) {
        if (c.type === 'character_adjacent_to_character' || c.type === 'characters_same_area') {
          expect(pair(c.characterId, c.targetCharacterId), `${id} ties the murderer to the victim`).toBe(false)
        }
        if (c.type === 'character_in_area') {
          expect(c.characterId === murdererId && c.areaId === victimArea, `${id} puts the murderer in the victim's room`).toBe(false)
        }
      }

      const directlyRoomed = new Set(
        puzzle.clues.flatMap(({ constraint: c }) => (c.type === 'character_in_area' ? [c.characterId] : [])),
      )
      const unroomedInnocents = puzzle.characters.filter(
        (ch) => ch.role === 'suspect' && ch.id !== murdererId && !directlyRoomed.has(ch.id),
      )
      expect(unroomedInnocents.length, 'the murderer must not be the only suspect without a room clue').toBeGreaterThan(0)
    })

    // Display text is presentation only; this guards the 1-based coordinates players read.
    it(`${caseId} clue text uses the same 1-based coordinates as its structured constraint`, () => {
      const puzzle = JSON.parse(fs.readFileSync(path.join(puzzlesDir, caseFile), 'utf-8')) as Puzzle
      for (const clue of puzzle.clues) {
        const c = clue.constraint
        const rowText = clue.text.match(/row (\d+)/)?.[1]
        const columnText = clue.text.match(/column (\d+)/)?.[1]
        if (c.type === 'character_in_row') expect(Number(rowText), clue.id).toBe(c.row + 1)
        if (c.type === 'character_in_column') expect(Number(columnText), clue.id).toBe(c.column + 1)
        if (c.type === 'character_at_position') {
          expect(Number(rowText), clue.id).toBe(c.position.row + 1)
          expect(Number(columnText), clue.id).toBe(c.position.column + 1)
        }
      }
    })
  }
})
