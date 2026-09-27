import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { solvePuzzle, validatePuzzle, type Puzzle } from '../src/index.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const puzzlesDir = path.resolve(__dirname, '../../../apps/web/public/puzzles')

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
  }
})
