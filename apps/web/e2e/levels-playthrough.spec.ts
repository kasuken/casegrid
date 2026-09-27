import { test, expect, type Page } from '@playwright/test'

interface CasePlaythrough {
  id: string
  title: string
  victimId: string
  murdererId: string
  wrongSuspectId: string
  placements: [string, string][]
  wrongPlacements: [string, string][]
  blockedCell: string
  nextCaseId?: string
}

const CASES: CasePlaythrough[] = [
  {
    id: 'case-001',
    title: 'The Rosewood Parlor',
    victimId: 'reginald',
    murdererId: 'evelyn',
    wrongSuspectId: 'arthur',
    placements: [
      ['reginald', 'cell-0-1'],
      ['evelyn', 'cell-1-0'],
      ['julian', 'cell-3-1'],
      ['arthur', 'cell-1-3'],
      ['clara', 'cell-0-4'],
      ['beatrice', 'cell-4-4'],
    ],
    wrongPlacements: [
      ['reginald', 'cell-0-1'],
      ['evelyn', 'cell-0-0'],
      ['julian', 'cell-3-1'],
      ['arthur', 'cell-1-3'],
      ['clara', 'cell-0-4'],
      ['beatrice', 'cell-4-4'],
    ],
    blockedCell: 'cell-1-1', // Stone Fountain
    nextCaseId: 'case-002',
  },
  {
    id: 'case-002',
    title: 'The Grand Antiquary',
    victimId: 'alistair',
    murdererId: 'nadia',
    wrongSuspectId: 'marcus',
    placements: [
      ['alistair', 'cell-0-1'],
      ['nadia', 'cell-2-1'],
      ['henry', 'cell-3-1'],
      ['marcus', 'cell-1-3'],
      ['elena', 'cell-0-4'],
      ['sylvia', 'cell-4-5'],
    ],
    wrongPlacements: [
      ['alistair', 'cell-0-1'],
      ['nadia', 'cell-0-0'],
      ['henry', 'cell-3-1'],
      ['marcus', 'cell-1-3'],
      ['elena', 'cell-0-4'],
      ['sylvia', 'cell-4-5'],
    ],
    blockedCell: 'cell-1-1', // T-Rex Skull
    nextCaseId: 'case-003',
  },
  {
    id: 'case-003',
    title: 'The Midnight Express',
    victimId: 'baroness',
    murdererId: 'dimitri',
    wrongSuspectId: 'viktor',
    placements: [
      ['baroness', 'cell-4-0'],
      ['dimitri', 'cell-3-1'],
      ['viktor', 'cell-0-1'],
      ['charlotte', 'cell-1-2'],
      ['gwen', 'cell-1-5'],
      ['otto', 'cell-4-5'],
    ],
    wrongPlacements: [
      ['baroness', 'cell-4-0'],
      ['dimitri', 'cell-3-0'],
      ['viktor', 'cell-0-1'],
      ['charlotte', 'cell-1-2'],
      ['gwen', 'cell-1-5'],
      ['otto', 'cell-4-5'],
    ],
    blockedCell: 'cell-1-1', // Grand Piano
    nextCaseId: 'case-004',
  },
  {
    id: 'case-004',
    title: 'The Saltmarsh Beacon',
    victimId: 'thaddeus',
    murdererId: 'mira',
    wrongSuspectId: 'lydia',
    placements: [
      ['thaddeus', 'cell-0-1'],
      ['mira', 'cell-1-0'],
      ['lydia', 'cell-2-1'],
      ['caleb', 'cell-2-0'],
      ['jonas', 'cell-2-4'],
      ['samuel', 'cell-2-5'],
      ['eleanor', 'cell-4-2'],
    ],
    wrongPlacements: [
      ['thaddeus', 'cell-0-1'],
      ['mira', 'cell-0-0'],
      ['lydia', 'cell-2-1'],
      ['caleb', 'cell-2-0'],
      ['jonas', 'cell-2-4'],
      ['samuel', 'cell-2-5'],
      ['eleanor', 'cell-4-2'],
    ],
    blockedCell: 'cell-0-2', // Fresnel Beacon Lens
    nextCaseId: 'case-005',
  },
  {
    id: 'case-005',
    title: 'The Blackwood Playhouse',
    victimId: 'vincent',
    murdererId: 'camilla',
    wrongSuspectId: 'dorian',
    placements: [
      ['vincent', 'cell-4-5'],
      ['camilla', 'cell-3-4'],
      ['julian_v', 'cell-0-1'],
      ['rowan', 'cell-1-2'],
      ['seraphina', 'cell-1-5'],
      ['dorian', 'cell-0-4'],
      ['vivian', 'cell-4-0'],
    ],
    wrongPlacements: [
      ['vincent', 'cell-4-5'],
      ['camilla', 'cell-3-5'],
      ['julian_v', 'cell-0-1'],
      ['rowan', 'cell-1-2'],
      ['seraphina', 'cell-1-5'],
      ['dorian', 'cell-0-4'],
      ['vivian', 'cell-4-0'],
    ],
    blockedCell: 'cell-1-1', // Stage Trapdoor
  },
]

async function dismissGuideIfShown(page: Page) {
  const skip = page.getByTestId('guide-skip-btn')
  if (await skip.isVisible()) {
    await skip.click()
  }
}

async function selectTrayCharacter(page: Page, charId: string) {
  const token = page.locator('.character-tray').getByTestId(`character-token-${charId}`)
  const isPressed = await token.getAttribute('aria-pressed')
  if (isPressed !== 'true') {
    await token.click()
  }
}

async function placeCharacter(page: Page, charId: string, cellId: string) {
  await selectTrayCharacter(page, charId)
  await page.getByTestId(cellId).click()
}

test.describe('Full Game Playthrough - Level by Level', () => {
  for (const c of CASES) {
    test(`Level Playthrough: ${c.id} - ${c.title}`, async ({ page }) => {
      // 1. Visit case page and verify dossier briefing
      await page.goto(`/case/${c.id}`)
      await expect(page.getByTestId('case-page')).toBeVisible()
      await expect(page.locator('#case-intro-title')).toHaveText(c.title)

      // Start investigation
      const startBtn = page.getByTestId('start-investigation-btn')
      await expect(startBtn).toBeVisible()
      await startBtn.click()

      // Guide dismissal if Case 1
      await dismissGuideIfShown(page)

      // Timer should be running
      await expect(page.getByTestId('timer-display')).toBeVisible()

      // 2. Test interaction: verify blocked object cell has blocked class, tabIndex -1, and displays feedback banner on click
      const blockedCell = page.getByTestId(c.blockedCell)
      await expect(blockedCell).toHaveClass(/grid-cell--blocked/)
      await expect(blockedCell).toHaveAttribute('tabindex', '-1')
      await blockedCell.click()
      await expect(page.getByTestId('feedback-banner')).toContainText(
        'blocks this cell. Characters cannot stand here.',
      )

      // Clicking blocked cell with a selected character shows specific blocked error
      const firstChar = c.placements[0][0]
      await selectTrayCharacter(page, firstChar)
      await blockedCell.click()
      await expect(page.getByTestId('feedback-banner')).toContainText('That cell is blocked by')
      // Deselect character
      await page.locator('.character-tray').getByTestId(`character-token-${firstChar}`).click()

      // 3. Test check button aria-disabled and feedback when not all placed
      const checkBtn = page.getByTestId('check-solution-btn')
      await expect(checkBtn).toHaveAttribute('aria-disabled', 'true')
      await checkBtn.click({ force: true })
      await expect(page.getByTestId('feedback-banner')).toContainText(
        `Place all characters before checking. (${c.placements.length} remaining)`,
      )

      // 4. Test Exclude note mode
      await page.getByTestId('mode-exclude-btn').click()
      await selectTrayCharacter(page, firstChar)
      await page.getByTestId('cell-5-0').click()
      await expect(page.getByTestId('cell-5-0').locator('.exclusion-marker')).toBeVisible()
      // Toggle exclusion off
      await page.getByTestId('cell-5-0').click()
      await expect(page.getByTestId('cell-5-0').locator('.exclusion-marker')).toHaveCount(0)
      // Switch back to place mode
      await page.getByTestId('mode-place-btn').click()

      // 5. Test Clue crossing toggle
      const firstClueToggle = page.locator('.clue-item__toggle').first()
      await expect(firstClueToggle).toHaveAttribute('aria-pressed', 'false')
      await firstClueToggle.click()
      await expect(firstClueToggle).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('.clue-panel__progress')).toContainText('1/')
      // Untoggle
      await firstClueToggle.click()
      await expect(firstClueToggle).toHaveAttribute('aria-pressed', 'false')
      await expect(page.locator('.clue-panel__progress')).toContainText('0/')

      // 6. Test Help prompt (nudge)
      const nudgeBtn = page.getByTestId('reveal-help-btn')
      await expect(nudgeBtn).toBeVisible()
      await nudgeBtn.click()
      await expect(page.getByTestId('revealed-help')).toBeVisible()

      // 7. Test wrong placements & mistake increment
      for (const [charId, cellId] of c.wrongPlacements) {
        await placeCharacter(page, charId, cellId)
      }
      await expect(checkBtn).toBeEnabled()
      await checkBtn.click()

      // Verify mistake feedback
      const conflictFeedback = page.getByTestId('feedback-banner')
      await expect(conflictFeedback).toBeVisible()
      await expect(conflictFeedback).toContainText('conflict with the clues')
      await expect(page.getByTestId('mistakes-count')).toContainText('1')

      // 8. Place correct solution
      for (const [charId, cellId] of c.placements) {
        await placeCharacter(page, charId, cellId)
      }
      await checkBtn.click()

      // 9. Accusation stage reached
      await expect(page.getByRole('heading', { name: 'Everyone is in the right place.' })).toBeVisible()

      // Test wrong accusation first
      await page.getByTestId(`accuse-suspect-${c.wrongSuspectId}`).click()
      await page.getByTestId('accuse-btn').click()
      await expect(page.getByTestId('accusation-error')).toContainText('That does not fit the evidence')

      // Now accuse the correct murderer
      await page.getByTestId(`accuse-suspect-${c.murdererId}`).click()
      await page.getByTestId('accuse-btn').click()

      // 10. CASE CLOSED result screen reached
      const resultView = page.getByTestId('result-view')
      await expect(resultView).toBeVisible()
      await expect(page.getByTestId('case-closed-stamp')).toBeVisible()
      await expect(page.getByTestId('result-resolution')).toBeVisible()

      // Verify stats
      await expect(page.getByTestId('result-time')).toBeVisible()
      // Mistakes should be at least 2 (1 wrong placement + 1 wrong accusation)
      const mistakesVal = await page.getByTestId('result-mistakes').textContent()
      expect(Number(mistakesVal)).toBeGreaterThanOrEqual(2)
      // Nudges used should be 1
      await expect(page.getByTestId('result-nudges')).toHaveText('1')

      // 11. Deduction walkthrough toggle
      await page.getByTestId('see-deductions-btn').click()
      await expect(page.getByTestId('deduction-steps')).toBeVisible()

      // 12. Share card toggle
      await page.getByTestId('open-share-btn').click()
      await expect(page.getByTestId('share-panel')).toBeVisible()

      // 13. Next case button or return to cases
      if (c.nextCaseId) {
        const nextBtn = page.getByTestId('open-next-case-btn')
        await expect(nextBtn).toBeVisible()
        await nextBtn.click()
        await expect(page).toHaveURL(new RegExp(`/case/${c.nextCaseId}$`))
      } else {
        // Last published case
        await page.getByTestId('back-to-cases-btn').click()
        await expect(page).toHaveURL('/')
      }
    })
  }

  test('Coming Soon level: case-006 is guarded with informative banner', async ({ page }) => {
    await page.goto('/case/case-006')
    await expect(page.getByTestId('case-coming-soon')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'The Whispering Cloister' })).toBeVisible()
    await expect(page.getByText('This case file is still being prepared')).toBeVisible()
    await expect(page.getByTestId('start-investigation-btn')).toHaveCount(0)

    // Check return link
    const returnLink = page.getByRole('link', { name: 'Browse available cases' })
    await expect(returnLink).toBeVisible()
    await returnLink.click()
    await expect(page).toHaveURL('/')
  })

  test('Mobile viewport playthrough: case-001 at 375px phone screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/case/case-001')
    await page.getByTestId('start-investigation-btn').click()
    await dismissGuideIfShown(page)

    // Verify grid fits without widening page
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(375)

    // Mobile clue quick-peek FAB and drawer
    await expect(page.getByTestId('mobile-clue-fab')).toBeVisible()
    await page.getByTestId('mobile-clue-fab').click()
    await expect(page.getByTestId('mobile-clue-drawer')).toBeVisible()
    await page.getByTestId('close-clue-drawer-btn').click()
    await expect(page.getByTestId('mobile-clue-drawer')).toBeHidden()

    // Toggle clue panel collapse on mobile
    const collapseToggle = page.locator('.clue-panel__collapse-toggle')
    await expect(collapseToggle).toBeVisible()
    await collapseToggle.click()
    await expect(page.locator('#clues-list')).toHaveCount(0)
    await collapseToggle.click()
    await expect(page.locator('#clues-list')).toBeVisible()

    // Place all characters by tapping
    for (const [charId, cellId] of CASES[0].placements) {
      await placeCharacter(page, charId, cellId)
    }

    await page.getByTestId('check-solution-btn').click()
    await expect(page.getByRole('heading', { name: 'Everyone is in the right place.' })).toBeVisible()

    await page.getByTestId('accuse-suspect-evelyn').click()
    await page.getByTestId('accuse-btn').click()

    await expect(page.getByTestId('result-view')).toBeVisible()
    await expect(page.getByTestId('case-closed-stamp')).toBeVisible()
  })
})
