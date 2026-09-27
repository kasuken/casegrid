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

test.describe('First visit onboarding', () => {
  test('a new player follows the guide on a phone, and refresh keeps both progress and dismissal', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 })
    await page.goto('/')
    await page.getByTestId('first-mystery-btn').click()
    await expect(page).toHaveURL(/\/case\/case-001$/)
    await page.getByTestId('start-investigation-btn').click()

    const guide = page.getByTestId('case-guide')
    await expect(guide.getByRole('heading', { name: 'Pick a person' })).toBeVisible()

    await page.getByTestId('character-token-julian').click()
    await expect(guide.getByRole('heading', { name: 'Place them on the map' })).toBeVisible()
    await page.getByTestId('cell-3-1').click()
    await expect(guide.getByRole('heading', { name: '“Beside” means sharing an edge' })).toBeVisible()
    await page.getByTestId('guide-next-btn').click()
    await page.getByTestId('guide-next-btn').click()
    await expect(guide.getByRole('heading', { name: 'Take notes' })).toBeVisible()

    await page.getByTestId('mode-exclude-btn').click()
    await page.getByTestId('character-token-evelyn').click()
    await page.getByTestId('cell-2-0').click()
    await expect(guide.getByRole('heading', { name: 'Tick off clues' })).toBeVisible()
    await page.getByTestId('clue-item-clue-1').getByRole('button').click()
    await expect(guide).toHaveCount(0)

    await page.reload()
    await expect(page.getByTestId('timer-display')).toBeVisible()
    await expect(page.getByTestId('cell-3-1').getByTestId('character-token-julian')).toBeVisible()
    await expect(page.getByTestId('case-guide')).toHaveCount(0)

    await page.goto('/')
    await expect(page.getByTestId('resume-case-btn')).toHaveAttribute('href', '/case/case-001')
    await expect(page.getByTestId('first-mystery-btn')).toHaveCount(0)
  })

  test('the first case and its guide work with the keyboard alone', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('first-mystery-btn').focus()
    await page.keyboard.press('Enter')
    await page.getByTestId('start-investigation-btn').focus()
    await page.keyboard.press('Enter')

    const guide = page.getByTestId('case-guide')
    await expect(guide.getByRole('heading', { name: 'Pick a person' })).toBeVisible()

    await page.getByTestId('character-token-reginald').focus()
    await page.keyboard.press('Enter')
    await expect(guide.getByRole('heading', { name: 'Place them on the map' })).toBeVisible()
    await page.getByTestId('cell-0-1').focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('cell-0-1').getByTestId('character-token-reginald')).toBeVisible()

    await page.getByTestId('guide-skip-btn').focus()
    await page.keyboard.press('Enter')
    await expect(guide).toHaveCount(0)

    await page.getByTestId('view-case-briefing-btn').focus()
    await page.keyboard.press('Enter')
    await page.getByTestId('reopen-guide-btn').focus()
    await page.keyboard.press('Enter')
    await expect(guide.getByRole('heading', { name: 'Pick a person' })).toBeVisible()
    await expect(page.getByTestId('cell-0-1').getByTestId('character-token-reginald')).toBeVisible()
  })
})

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
