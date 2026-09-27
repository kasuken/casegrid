import { test, expect } from '@playwright/test'

test.describe('CaseGrid Critical Journeys', () => {
  test('Flow 1: Complete Case 1, submit solution, accuse murderer, and reach CASE CLOSED', async ({
    page,
  }) => {
    // 1. Open home
    await page.goto('/')
    await expect(page.getByTestId('home-page')).toBeVisible()

    // 2. Select first case
    const case1Card = page.getByTestId('case-card-case-001')
    await expect(case1Card).toBeVisible()
    await case1Card.click()

    // 3. Read briefing & Start investigation
    await expect(page.getByTestId('case-page')).toBeVisible()
    const startBtn = page.getByTestId('start-investigation-btn')
    await expect(startBtn).toBeVisible()
    await startBtn.click()

    // Timer should now be visible and running
    await expect(page.getByTestId('timer-display')).toBeVisible()

    // 4. Place characters using click/tap interaction
    // Case 1 placements:
    // reginald -> (0, 1)
    await page.getByTestId('character-token-reginald').click()
    await page.getByTestId('cell-0-1').click()

    // evelyn -> (0, 0)
    await page.getByTestId('character-token-evelyn').click()
    await page.getByTestId('cell-0-0').click()

    // julian -> (3, 1)
    await page.getByTestId('character-token-julian').click()
    await page.getByTestId('cell-3-1').click()

    // arthur -> (1, 3)
    await page.getByTestId('character-token-arthur').click()
    await page.getByTestId('cell-1-3').click()

    // clara -> (0, 4)
    await page.getByTestId('character-token-clara').click()
    await page.getByTestId('cell-0-4').click()

    // beatrice -> (4, 4)
    await page.getByTestId('character-token-beatrice').click()
    await page.getByTestId('cell-4-4').click()

    // 5. Submit solution
    const checkBtn = page.getByTestId('check-solution-btn')
    await expect(checkBtn).toBeEnabled()
    await checkBtn.click()

    // 6. Accusation view should appear
    await expect(page.getByText('Everyone is in the right place.')).toBeVisible()

    // Select the murderer (Evelyn)
    await page.getByTestId('accuse-suspect-evelyn').click()
    await page.getByTestId('accuse-btn').click()

    // 7. Reaches CASE CLOSED
    const resultView = page.getByTestId('result-view')
    await expect(resultView).toBeVisible()
    await expect(resultView.getByText('CASE CLOSED')).toBeVisible()
    await expect(resultView.getByText(/Evelyn Rosewood was alone with Lord Reginald/i)).toBeVisible()
    await expect(page.getByTestId('replay-btn')).toBeVisible()
    await expect(page.getByTestId('back-to-cases-btn')).toBeVisible()
  })

  test('Flow 2: Active investigation state persists across page refresh', async ({
    page,
  }) => {
    await page.goto('/case/case-001')
    await page.getByTestId('start-investigation-btn').click()

    // Place a suspect
    await page.getByTestId('character-token-evelyn').click()
    await page.getByTestId('cell-0-0').click()

    // Cell 0-0 should contain Evelyn
    const placedCell = page.getByTestId('cell-0-0')
    await expect(placedCell.getByTestId('character-token-evelyn')).toBeVisible()

    // Reload the page
    await page.reload()

    // Confirm investigation resumes without resetting to intro
    await expect(page.getByTestId('timer-display')).toBeVisible()
    const reloadedCell = page.getByTestId('cell-0-0')
    await expect(reloadedCell.getByTestId('character-token-evelyn')).toBeVisible()
  })

  test('Flow 3: Mobile viewport tap-to-place interaction works smoothly', async ({
    page,
  }) => {
    // Set viewport to iPhone size
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/case/case-001')
    await page.getByTestId('start-investigation-btn').click()

    // Tap suspect then tap cell
    await page.getByTestId('character-token-julian').click()
    await page.getByTestId('cell-3-1').click()

    const cell = page.getByTestId('cell-3-1')
    await expect(cell.getByTestId('character-token-julian')).toBeVisible()
  })
})
