import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAreaForPosition } from '@casegrid/puzzle-engine'
import { useGameStore } from '../../stores/gameStore'
import { NextCaseCard } from './NextCaseCard'
import { DeductionWalkthrough } from './DeductionWalkthrough'

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function ResultView() {
  const { puzzle, placements, elapsedSeconds, mistakes, bestTime, replayCase } =
    useGameStore()
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  if (!puzzle) return null

  const victim = puzzle.characters.find((c) => c.id === puzzle.victimId)
  const murderer = puzzle.characters.find((c) => c.id === puzzle.solution.murdererId)
  const victimPos = placements[puzzle.victimId]
  const victimArea = victimPos ? getAreaForPosition(victimPos, puzzle.areas) : undefined

  return (
    <article className="result-view" aria-labelledby="result-title" data-testid="result-view">
      <div className="result-view__card">
        <div className="result-badge">
          <img src="/assets/brand/badge-case-closed.svg" width={120} height={120} alt="" />
          <p className="result-stamp" data-testid="case-closed-stamp">CASE CLOSED</p>
        </div>

        <header className="result-view__header">
          <h1 id="result-title" className="result-view__title" ref={titleRef} tabIndex={-1}>
            Mystery Solved
          </h1>
          <p className="result-view__case-name">{puzzle.title}</p>
        </header>

        <div className="result-view__revelation">
          <p>
            <strong>{murderer?.name ?? 'The murderer'}</strong> was alone with{' '}
            <strong>{victim?.name ?? 'the victim'}</strong>
            {victimArea ? ` in the ${victimArea.name}` : ''}.
          </p>
          {puzzle.resolution ? (
            <p className="result-view__resolution" data-testid="result-resolution">
              {puzzle.resolution}
            </p>
          ) : (
            <span className="result-view__sub-revelation">
              Your spatial deductions left nowhere for the truth to hide.
            </span>
          )}
        </div>

        {puzzle.deductions && puzzle.deductions.length > 0 && (
          <DeductionWalkthrough steps={puzzle.deductions} clues={puzzle.clues} />
        )}

        <section className="result-stats" aria-label="Investigation statistics">
          <div className="result-stats__item">
            <span className="result-stats__label">Investigation Time</span>
            <strong className="result-stats__value" data-testid="result-time">
              {formatTime(elapsedSeconds)}
            </strong>
          </div>

          <div className="result-stats__item">
            <span className="result-stats__label">Mistakes</span>
            <strong className="result-stats__value" data-testid="result-mistakes">
              {mistakes}
            </strong>
          </div>

          {bestTime !== undefined && (
            <div className="result-stats__item">
              <span className="result-stats__label">Best Time</span>
              <strong className="result-stats__value" data-testid="result-best-time">
                {formatTime(bestTime)}
              </strong>
            </div>
          )}
        </section>

        <NextCaseCard currentCaseId={puzzle.id} />

        <div className="result-view__actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={replayCase}
            data-testid="replay-btn"
          >
            Replay Case
          </button>
          <Link
            to="/"
            className="btn btn--outline"
            data-testid="back-to-cases-btn"
          >
            Back to Case Selection
          </Link>
        </div>
      </div>
    </article>
  )
}
