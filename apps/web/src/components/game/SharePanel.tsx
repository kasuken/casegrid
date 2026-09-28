import { useEffect, useMemo, useState } from 'react'
import type { Puzzle } from '@casegrid/puzzle-engine'
import { fetchPuzzleIndex } from '../../services/puzzleLoader'
import { buildShareContent, formatDuration } from '../../services/shareResult'

interface SharePanelProps {
  readonly puzzle: Puzzle
  readonly elapsedSeconds: number
  readonly mistakes: number
  readonly nudgesUsed?: number
}

type Status = { readonly tone: 'info' | 'warn'; readonly message: string } | null

type CardState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly blob: Blob; readonly url: string }
  | { readonly kind: 'failed' }

export function SharePanel({ puzzle, elapsedSeconds, mistakes, nudgesUsed }: SharePanelProps) {
  const [open, setOpen] = useState(false)
  const [caseNumber, setCaseNumber] = useState(puzzle.id.replace(/\D/g, '').slice(-2) || '00')
  const [card, setCard] = useState<CardState>({ kind: 'loading' })
  const [status, setStatus] = useState<Status>(null)

  const share = useMemo(
    () =>
      buildShareContent({
        caseId: puzzle.id,
        caseNumber,
        title: puzzle.title,
        elapsedSeconds,
        mistakes,
        nudgesUsed,
        origin: window.location.origin,
      }),
    [puzzle.id, puzzle.title, caseNumber, elapsedSeconds, mistakes, nudgesUsed],
  )
  const shareText = `${share.text}\n${share.url}`

  useEffect(() => {
    let mounted = true
    fetchPuzzleIndex()
      .then((index) => {
        const position = index.findIndex((entry) => entry.id === puzzle.id)
        if (mounted && position >= 0) setCaseNumber((position + 1).toString().padStart(2, '0'))
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [puzzle.id])

  useEffect(() => {
    if (!open) return
    let objectUrl: string | undefined
    let mounted = true
    import('../../services/shareCard')
      .then(({ renderShareCard }) =>
        renderShareCard({
          caseNumber,
          title: puzzle.title,
          subtitle: puzzle.subtitle,
          difficulty: puzzle.difficulty,
          time: formatDuration(elapsedSeconds),
          mistakes,
          nudges: nudgesUsed,
          linkLabel: share.url.replace(/^https?:\/\//, ''),
        }),
      )
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        if (mounted) setCard({ kind: 'ready', blob, url: objectUrl })
      })
      .catch(() => {
        if (mounted) setCard({ kind: 'failed' })
      })
    return () => {
      mounted = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, caseNumber, puzzle.title, puzzle.subtitle, puzzle.difficulty, elapsedSeconds, mistakes, nudgesUsed, share.url])

  const canNativeShare = typeof navigator.share === 'function'
  const fileName = `casegrid-case-${caseNumber}.png`

  const handleNativeShare = async () => {
    const data: ShareData = { title: share.title, text: share.text, url: share.url }
    if (card.kind === 'ready') {
      const file = new File([card.blob], fileName, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) data.files = [file]
    }
    try {
      await navigator.share(data)
      setStatus({ tone: 'info', message: 'Handed to your share sheet. The app you chose takes it from here.' })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus({ tone: 'info', message: 'Sharing cancelled.' })
      } else {
        setStatus({ tone: 'warn', message: 'Your browser could not share this. Copy the text or download the image instead.' })
      }
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setStatus({ tone: 'info', message: 'Copied. Paste it anywhere to challenge a friend.' })
    } catch {
      setStatus({ tone: 'warn', message: 'Could not copy automatically. Select the text above and copy it.' })
    }
  }

  const handleDownload = () => {
    if (card.kind !== 'ready') return
    const link = document.createElement('a')
    link.href = card.url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    setStatus({ tone: 'info', message: 'Image download started.' })
  }

  if (!open) {
    return (
      <div className="share-launch">
        <button type="button" className="btn btn--primary" onClick={() => setOpen(true)} data-testid="open-share-btn">
          Challenge a friend
        </button>
      </div>
    )
  }

  return (
    <section className="share-panel" aria-labelledby="share-panel-title" data-testid="share-panel">
      <h2 id="share-panel-title" className="share-panel__title">
        Share this case
      </h2>
      <p className="share-panel__note">
        Only your time, mistakes, and nudges are shared, with a link to this case. The killer and your board stay secret.
      </p>

      {card.kind === 'ready' && (
        <img className="share-panel__card" src={card.url} alt={share.imageAlt} width={540} height={540} data-testid="share-card-image" />
      )}
      {card.kind === 'loading' && <p className="share-panel__note">Preparing your card…</p>}

      <label className="share-panel__label" htmlFor="share-text">
        Message
      </label>
      <textarea
        id="share-text"
        className="share-panel__text"
        readOnly
        rows={4}
        value={shareText}
        onFocus={(event) => event.currentTarget.select()}
        data-testid="share-text"
      />

      <div className="share-panel__actions">
        {canNativeShare && (
          <button type="button" className="btn btn--primary" onClick={handleNativeShare} data-testid="native-share-btn">
            Share…
          </button>
        )}
        <button type="button" className="btn btn--outline" onClick={handleCopy} data-testid="copy-share-btn">
          Copy text and link
        </button>
        {card.kind === 'ready' && (
          <button type="button" className="btn btn--outline" onClick={handleDownload} data-testid="download-card-btn">
            Download image
          </button>
        )}
      </div>

      <p className={`share-panel__status share-panel__status--${status?.tone ?? 'info'}`} role="status" data-testid="share-status">
        {status?.message ?? ''}
      </p>
    </section>
  )
}
