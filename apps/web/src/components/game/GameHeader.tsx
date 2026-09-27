import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '../../stores/gameStore'
import { ConfirmModal } from './ConfirmModal'
import { AssetIcon } from '../AssetIcon'

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function GameHeader() {
  const {
    puzzle,
    elapsedSeconds,
    isTimerRunning,
    mistakes,
    tickTimer,
    setTimerRunning,
    resetCase,
    stage,
  } = useGameStore()

  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Timer interval with visibility handling
  useEffect(() => {
    if (!isTimerRunning || stage !== 'investigating') return

    const interval = setInterval(() => {
      tickTimer()
    }, 1000)

    const handleVisibility = () => {
      if (document.hidden) {
        setTimerRunning(false)
      } else if (stage === 'investigating') {
        setTimerRunning(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isTimerRunning, stage, tickTimer, setTimerRunning])

  return (
    <>
      <header className="game-header" role="banner">
        <div className="game-header__brand">
          <Link to="/" className="btn-back" aria-label="Return to case files">
            <AssetIcon name="back" size={24} /> Cases
          </Link>
          <div className="game-header__title-group">
            <span className="game-header__badge">{puzzle?.difficulty ?? 'Case'}</span>
            <h1 className="game-header__title">{puzzle?.title ?? 'Case File'}</h1>
          </div>
        </div>

        <div className="game-header__stats">
          <div className="stat-pill" aria-label={`Elapsed time: ${formatTime(elapsedSeconds)}`}>
            <span className="stat-pill__label"><AssetIcon name="timer" /> Time</span>
            <span className="stat-pill__value" data-testid="timer-display">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="stat-pill" aria-label={`Mistakes: ${mistakes}`}>
            <span className="stat-pill__label"><AssetIcon name="mistakes" /> Mistakes</span>
            <span className="stat-pill__value" data-testid="mistakes-count">
              {mistakes}
            </span>
          </div>

          {stage === 'investigating' && (
            <button
              type="button"
              className="btn btn--subtle"
              onClick={() => setShowResetConfirm(true)}
              aria-label="Reset this investigation"
            >
              <AssetIcon name="restart" size={24} /> Reset
            </button>
          )}
        </div>
      </header>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset this investigation?"
        message="Your current suspect placements, exclusions, and solved notes will be cleared."
        confirmLabel="Reset Investigation"
        onConfirm={() => {
          resetCase()
          setShowResetConfirm(false)
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  )
}
