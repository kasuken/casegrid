/**
 * CaseGrid Puzzle Validation CLI
 * Validates all bundled puzzles against schema, invariants, and unique solvability.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePuzzle } from '../src/validator.ts'
import { puzzleIndexSchema } from '../src/schemas.ts'
import { validateWeeklySchedule } from '../src/schedule.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const puzzlesDir = path.resolve(__dirname, '../../../apps/web/public/puzzles')

if (!fs.existsSync(puzzlesDir)) {
  console.error(`Puzzles directory not found at: ${puzzlesDir}`)
  process.exit(1)
}

const files = fs.readdirSync(puzzlesDir).sort()
const indexPath = path.join(puzzlesDir, 'index.json')

let totalErrors = 0
let validatedCount = 0

// 1. Validate index.json if present
if (fs.existsSync(indexPath)) {
  try {
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
    const parsed = puzzleIndexSchema.safeParse(indexData)
    if (!parsed.success) {
      console.error('❌ index.json failed schema validation:')
      for (const err of parsed.error.issues) {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      }
      totalErrors++
    } else {
      console.log(`index.json ✓ valid metadata for ${indexData.length} cases`)
    }
  } catch (err) {
    console.error('❌ Error parsing index.json:', err)
    totalErrors++
  }
}

// 1b. Validate the Case of the Week schedule against the published catalog
const schedulePath = path.join(puzzlesDir, 'schedule.json')
if (fs.existsSync(schedulePath) && fs.existsSync(indexPath)) {
  try {
    const catalog = puzzleIndexSchema.parse(JSON.parse(fs.readFileSync(indexPath, 'utf-8')))
    const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf-8'))
    const issues = validateWeeklySchedule(schedule, catalog)
    if (issues.length > 0) {
      console.error('❌ schedule.json validation failed:')
      for (const issue of issues) console.error(`  - [${issue.code}] ${issue.message}`)
      totalErrors++
    } else {
      console.log(`schedule.json ✓ ${schedule.weeks.length} week(s), Monday 00:00 UTC boundaries, published cases only`)
    }
  } catch (err) {
    console.error('❌ Error reading schedule.json:', err)
    totalErrors++
  }
}

// 2. Validate all case-*.json files
const puzzleFiles = files.filter(
  (f) => f.startsWith('case-') && f.endsWith('.json'),
)

if (puzzleFiles.length === 0) {
  console.log('No puzzle files found to validate yet.')
}

for (const file of puzzleFiles) {
  const filePath = path.join(puzzlesDir, file)
  const caseName = path.basename(file, '.json')

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const json = JSON.parse(content)

    const start = performance.now()
    const result = validatePuzzle(json)
    const duration = Math.round(performance.now() - start)

    if (result.valid) {
      console.log(`${caseName} ✓ valid, unique solution (${duration}ms)`)
      validatedCount++
    } else {
      console.error(`❌ ${caseName} validation failed:`)
      for (const issue of result.errors) {
        console.error(`  - [${issue.code}] ${issue.message}`)
      }
      totalErrors++
    }
  } catch (err) {
    console.error(`❌ ${caseName} could not be read or parsed:`, err)
    totalErrors++
  }
}

console.log()
if (totalErrors > 0) {
  console.error(`Validation failed with ${totalErrors} error(s).`)
  process.exit(1)
} else {
  console.log(`${validatedCount} puzzle(s) successfully validated.`)
  process.exit(0)
}
