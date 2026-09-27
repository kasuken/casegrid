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

const CASE_001_SOLUTION: [string, string][] = [
  ['reginald', 'cell-0-1'],
  ['evelyn', 'cell-0-0'],
  ['julian', 'cell-3-1'],
  ['arthur', 'cell-1-3'],
  ['clara', 'cell-0-4'],
  ['beatrice', 'cell-4-4'],
]
const CASE_001_SUSPECTS = ['Evelyn Rosewood', 'Arthur Vance', 'Clara Mercer', 'Julian Sterling', 'Beatrice Finch']

async function closeCase001(page: Page) {
  await startCase(page)
  await dismissGuideIfShown(page)
  for (const [character, cell] of CASE_001_SOLUTION) {
    await page.getByTestId(`character-token-${character}`).click()
    await page.getByTestId(cell).click()
  }
  await page.getByTestId('check-solution-btn').click()
  await page.getByTestId('accuse-suspect-evelyn').click()
  await page.getByTestId('accuse-btn').click()
  await expect(page.getByTestId('result-view')).toBeVisible()
}

test.describe('Sharing', () => {
  test('a closed case shares a spoiler-free card and link that opens the exact case for a fresh recipient', async ({
    page,
    context,
    browser,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-specific')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await closeCase001(page)

    await page.getByTestId('open-share-btn').click()
    const panel = page.getByTestId('share-panel')
    await expect(panel.getByTestId('share-card-image')).toBeVisible()
    const text = await panel.getByTestId('share-text').inputValue()
    expect(text).toContain('Case 01: The Rosewood Parlor')
    expect(text).toMatch(/CASE CLOSED in \d\d:\d\d · 0 mistakes · 0 nudges/)
    for (const name of CASE_001_SUSPECTS) expect(text).not.toContain(name)
    const shareUrl = text.trim().split('\n').at(-1) ?? ''
    expect(new URL(shareUrl).pathname).toBe('/case/case-001')
    expect(new URL(shareUrl).search).toBe('')

    await panel.getByTestId('copy-share-btn').click()
    await expect(panel.getByTestId('share-status')).toHaveText('Copied. Paste it anywhere to challenge a friend.')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text)

    const download = page.waitForEvent('download')
    await panel.getByTestId('download-card-btn').click()
    expect((await download).suggestedFilename()).toBe('casegrid-case-01.png')

    const recipient = await browser.newContext()
    const friend = await recipient.newPage()
    await friend.goto(shareUrl)
    await expect(friend.locator('#case-intro-title')).toHaveText('The Rosewood Parlor')
    await expect(friend.getByTestId('start-investigation-btn')).toBeVisible()
    await expect(friend.getByTestId('result-view')).toHaveCount(0)
    await recipient.close()
  })

  test('cancelling the native share sheet is neither an error nor a success', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: () => Promise.reject(new DOMException('Share canceled', 'AbortError')),
      })
    })
    await closeCase001(page)
    await page.getByTestId('open-share-btn').click()
    await page.getByTestId('native-share-btn').click()
    await expect(page.getByTestId('share-status')).toHaveText('Sharing cancelled.')
  })

  test('a recipient who already played keeps their own progress', async ({ page }) => {
    await startCase(page)
    await dismissGuideIfShown(page)
    await page.getByTestId('character-token-julian').click()
    await page.getByTestId('cell-3-1').click()

    await page.goto('/case/case-001')
    await expect(page.getByTestId('cell-3-1').getByTestId('character-token-julian')).toBeVisible()
  })

  test('shared case URLs serve spoiler-free link-preview HTML', async ({ request }) => {
    const response = await request.get('/case/case-001')
    expect(response.ok()).toBe(true)
    const html = await response.text()
    expect(html).toContain('<title>Case 01: The Rosewood Parlor · CaseGrid</title>')
    expect(html).toContain('property="og:image" content="')
    expect(html).toContain('/og/case-001.png"')
    for (const name of CASE_001_SUSPECTS) expect(html).not.toContain(name)

    const image = await request.get('/og/case-001.png')
    expect(image.headers()['content-type']).toBe('image/png')

    const unpublished = await (await request.get('/case/case-006')).text()
    expect(unpublished).not.toContain('og/case-006.png')
  })
})

test.describe('Case of the Week', () => {
  test('features the scheduled case, links to it canonically, and resumes it with true progress', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-30T12:00:00Z'))
    await page.goto('/')
    const weekly = page.getByTestId('weekly-panel')
    await expect(weekly.getByRole('heading', { name: 'Case 03: The Midnight Express' })).toBeVisible()
    await expect(page.getByTestId('case-card-case-003')).toContainText('Case of the Week')
    await expect(page.getByTestId('first-mystery-btn')).toBeVisible()

    await weekly.getByTestId('weekly-case-btn').click()
    await expect(page).toHaveURL(/\/case\/case-003$/)
    await page.getByTestId('start-investigation-btn').click()
    await page.getByTestId('character-token-dimitri').click()
    await page.getByTestId('cell-3-0').click()

    await page.goto('/')
    await expect(weekly.getByTestId('weekly-case-btn')).toHaveText('Resume this week’s case')
    await weekly.getByTestId('weekly-case-btn').click()
    await expect(page.getByTestId('cell-3-0').getByTestId('character-token-dimitri')).toBeVisible()
  })

  test('changes at Monday 00:00 UTC and falls back once the schedule runs out', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-27T23:59:59Z'))
    await page.goto('/')
    await expect(page.getByTestId('weekly-panel').getByRole('heading')).toHaveText('Case 02: The Grand Antiquary')

    await page.clock.setFixedTime(new Date('2026-09-28T00:00:00Z'))
    await page.reload()
    await expect(page.getByTestId('weekly-panel').getByRole('heading')).toHaveText('Case 03: The Midnight Express')

    await page.clock.setFixedTime(new Date('2026-11-02T09:00:00Z'))
    await page.reload()
    await expect(page.getByTestId('weekly-panel')).toContainText('No Case of the Week is scheduled right now')
    await expect(page.getByTestId('case-card-case-002')).toBeVisible()
  })
})

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
