import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { puzzleSchema, type Puzzle } from '@casegrid/puzzle-engine'
import rawCase from '../../../public/puzzles/case-001.json'
import { SharePanel } from './SharePanel'

const puzzle = puzzleSchema.parse(rawCase) as Puzzle

const { renderShareCardMock } = vi.hoisted(() => ({ renderShareCardMock: vi.fn() }))
vi.mock('../../services/shareCard', () => ({ renderShareCard: renderShareCardMock }))
vi.mock('../../services/puzzleLoader', () => ({
  fetchPuzzleIndex: () => Promise.resolve([{ id: 'case-001', title: 'The Rosewood Parlor', difficulty: 'beginner', suspectCount: 5 }]),
}))

async function openPanel() {
  render(<SharePanel puzzle={puzzle} elapsedSeconds={204} mistakes={1} nudgesUsed={2} />)
  await userEvent.click(screen.getByTestId('open-share-btn'))
}

function setShare(impl?: (data: ShareData) => Promise<void>) {
  Object.defineProperty(navigator, 'share', { configurable: true, value: impl })
  Object.defineProperty(navigator, 'canShare', { configurable: true, value: impl ? () => true : undefined })
}

describe('SharePanel', () => {
  beforeEach(() => {
    renderShareCardMock.mockReset()
    renderShareCardMock.mockResolvedValue(new Blob(['png'], { type: 'image/png' }))
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:card'), revokeObjectURL: vi.fn() }))
    setShare(undefined)
  })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    setShare(undefined)
  })

  it('shows a spoiler-free message, link, and described card image', async () => {
    await openPanel()
    const text = screen.getByTestId('share-text') as HTMLTextAreaElement
    expect(text.value).toContain('Case 01: The Rosewood Parlor')
    expect(text.value).toContain('CASE CLOSED in 03:24 · 1 mistake · 2 nudges')
    expect(text.value).toContain(`${window.location.origin}/case/case-001`)
    for (const character of puzzle.characters) expect(text.value).not.toContain(character.name)

    const image = await screen.findByTestId('share-card-image')
    expect(image).toHaveAttribute('alt', expect.stringContaining('CASE CLOSED card for Case 01'))
    expect(renderShareCardMock).toHaveBeenCalledWith(expect.objectContaining({ caseNumber: '01', nudges: 2 }))
    expect(JSON.stringify(renderShareCardMock.mock.calls)).not.toContain('Evelyn')
  })

  it('copies the message and link, and explains a clipboard failure', async () => {
    await openPanel()
    const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied'))
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

    await userEvent.click(screen.getByTestId('copy-share-btn'))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/case/case-001'))
    expect(screen.getByTestId('share-status')).toHaveTextContent('Copied.')

    await userEvent.click(screen.getByTestId('copy-share-btn'))
    expect(screen.getByTestId('share-status')).toHaveTextContent('Could not copy automatically')
  })

  it('hides native sharing when the browser does not support it', async () => {
    await openPanel()
    expect(screen.queryByTestId('native-share-btn')).not.toBeInTheDocument()
    expect(screen.getByTestId('copy-share-btn')).toBeInTheDocument()
  })

  it('reports a completed native share without claiming delivery', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    setShare(share)
    await openPanel()
    await screen.findByTestId('share-card-image')
    await userEvent.click(screen.getByTestId('native-share-btn'))
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: `${window.location.origin}/case/case-001`, files: expect.any(Array) }))
    expect(screen.getByTestId('share-status')).toHaveTextContent('Handed to your share sheet')
    expect(screen.getByTestId('share-status')).not.toHaveTextContent(/sent|delivered|success/i)
  })

  it('treats a cancelled share as neither an error nor a success', async () => {
    setShare(vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')))
    await openPanel()
    await userEvent.click(screen.getByTestId('native-share-btn'))
    expect(screen.getByTestId('share-status')).toHaveTextContent('Sharing cancelled.')
    expect(screen.getByTestId('share-status')).not.toHaveClass('share-panel__status--warn')
  })

  it('suggests fallbacks when native sharing fails', async () => {
    setShare(vi.fn().mockRejectedValue(new DOMException('nope', 'NotAllowedError')))
    await openPanel()
    await userEvent.click(screen.getByTestId('native-share-btn'))
    expect(screen.getByTestId('share-status')).toHaveTextContent('Copy the text or download the image instead')
  })

  it('keeps text sharing available when the card cannot be drawn', async () => {
    renderShareCardMock.mockRejectedValue(new Error('no canvas'))
    await openPanel()
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(screen.queryByTestId('share-card-image')).not.toBeInTheDocument()
    expect(screen.queryByTestId('download-card-btn')).not.toBeInTheDocument()
    expect(screen.getByTestId('copy-share-btn')).toBeInTheDocument()
  })
})
