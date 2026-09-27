import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { analyzeDeductionPath, puzzleIndexSchema, validatePuzzle, type Puzzle } from '../src/index.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const minisDir = path.join(root, 'docs/discovery/minis')
const puzzlesDir = path.join(root, 'apps/web/public/puzzles')
const catalog = puzzleIndexSchema.parse(JSON.parse(fs.readFileSync(path.join(puzzlesDir, 'index.json'), 'utf-8')))

const minis = fs
  .readdirSync(minisDir)
  .filter((file) => file.endsWith('.json'))
  .sort()
  .map((file) => JSON.parse(fs.readFileSync(path.join(minisDir, file), 'utf-8')) as Puzzle & { linkedCaseId: string })

describe('discovery mini-mysteries', () => {
  it('prepares three concepts', () => {
    expect(minis).toHaveLength(3)
  })

  for (const mini of minis) {
    describe(mini.title, () => {
      it('has exactly one justified answer, proven by the independent solver', () => {
        const result = validatePuzzle(mini)
        expect(result.errors).toEqual([])
        expect(result.solveResult?.isUnique).toBe(true)
      })

      it('can be solved clue by clue without guessing', () => {
        expect(analyzeDeductionPath(mini).solvedByPropagation).toBe(true)
      })

      it('stays small enough to solve inside a post', () => {
        expect(mini.clues.length).toBeLessThanOrEqual(6)
        expect(mini.grid.width * mini.grid.height).toBeLessThanOrEqual(8)
      })

      it('does not signpost the killer as the person beside the victim', () => {
        const besideVictim = mini.clues.some(
          (clue) =>
            clue.constraint.type === 'character_adjacent_to_character' &&
            [clue.constraint.characterId, clue.constraint.targetCharacterId].includes(mini.victimId),
        )
        expect(besideVictim).toBe(false)
      })

      it('links to a published case without spoiling it', () => {
        const linked = catalog.find((entry) => entry.id === mini.linkedCaseId)
        expect(linked?.availability).not.toBe('coming-soon')
        const full = JSON.parse(fs.readFileSync(path.join(puzzlesDir, `${mini.linkedCaseId}.json`), 'utf-8')) as Puzzle
        const fullText = JSON.stringify(full)
        for (const character of mini.characters) expect(fullText).not.toContain(character.name)
        const miniText = JSON.stringify(mini)
        for (const character of full.characters) expect(miniText).not.toContain(character.name)
      })
    })
  }
})
