import { test, expect, type Page } from '@playwright/test'

async function startCase(page: Page, caseId = 'case-001') {
  await page.goto(`/case/${caseId}`)
  await page.getByTestId('start-investigation-btn').click()
  await expect(page.getByTestId('timer-display')).toBeVisible()
}

async function dismissGuideIfShown(page: Page) {
  const skip = page.getByTestId('guide-skip-btn')
  if (await skip.isVisible()) await skip.click()
}

async function dragTo(page: Page, fromTestId: string, toTestId: string) {
  const from = await page.getByTestId(fromTestId).boundingBox()
  const to = await page.getByTestId(toTestId).boundingBox()
  if (!from || !to) throw new Error('Missing drag geometry')
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 })
  await page.mouse.up()
}

test.describe('Undo', () => {
  test('reverses tap and drag placements, from the button and the keyboard', async ({ page }) => {
    await startCase(page)
    await dismissGuideIfShown(page)

    const undo = page.getByTestId('undo-btn')
    await expect(undo).toHaveAttribute('aria-disabled', 'true')

    await page.getByTestId('character-token-evelyn').click()
    await page.getByTestId('cell-0-0').click()
    await expect(page.getByTestId('cell-0-0').getByTestId('character-token-evelyn')).toBeVisible()
    await undo.click()
    await expect(page.getByTestId('cell-0-0').getByTestId('character-token-evelyn')).toHaveCount(0)

    await page.getByTestId('character-token-arthur').click()
    await page.getByTestId('cell-1-3').click()
    await page.getByTestId('cell-1-3').scrollIntoViewIfNeeded()
    await dragTo(page, 'cell-1-3', 'cell-2-3')
    await expect(page.getByTestId('cell-2-3').getByTestId('character-token-arthur')).toBeVisible()

    await page.keyboard.press('ControlOrMeta+z')
    await expect(page.getByTestId('cell-1-3').getByTestId('character-token-arthur')).toBeVisible()
    await expect(page.getByTestId('cell-2-3').getByTestId('character-token-arthur')).toHaveCount(0)

    await undo.click()
    await expect(page.getByTestId('cell-1-3').getByTestId('character-token-arthur')).toHaveCount(0)
    await expect(undo).toHaveAttribute('aria-disabled', 'true')
  })
})
