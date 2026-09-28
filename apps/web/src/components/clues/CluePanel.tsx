import { useEffect, useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { AssetIcon } from '../AssetIcon'
import { HelpPanel } from './HelpPanel'

export function CluePanel() {
  const { puzzle, solvedClueIds, toggleClueSolved } = useGameStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    if (!isDrawerOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen])

  if (!puzzle) return null

  const totalClues = puzzle.clues.length
  const solvedCount = solvedClueIds.length

  return (
    <>
      <aside className="clue-panel" aria-labelledby="clue-panel-title">
        <div className="clue-panel__header">
          <div className="clue-panel__title-group">
            <h2 id="clue-panel-title" className="clue-panel__title">
              Witness Clues
            </h2>
            <span className="clue-panel__progress">
              {solvedCount}/{totalClues} marked
            </span>
          </div>
          <button
            type="button"
            className="clue-panel__collapse-toggle md:hidden"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-expanded={!isCollapsed}
            aria-controls="clues-list"
          >
            {isCollapsed ? 'Show Clues ▼' : 'Hide Clues ▲'}
          </button>
        </div>

        <HelpPanel />

        {!isCollapsed && (
          <ol id="clues-list" className="clue-panel__list">
            {puzzle.clues.map((clue, idx) => {
              const isSolved = solvedClueIds.includes(clue.id)
              return (
                <li
                  key={clue.id}
                  className={`clue-item ${isSolved ? 'clue-item--solved' : ''}`}
                  data-testid={`clue-item-${clue.id}`}
                >
                  <button
                    type="button"
                    className="clue-item__toggle"
                    onClick={() => toggleClueSolved(clue.id)}
                    aria-pressed={isSolved}
                    aria-label={`Clue ${idx + 1}: ${clue.text}. Mark as ${
                      isSolved ? 'unresolved' : 'resolved'
                    }`}
                  >
                    <AssetIcon name={isSolved ? 'clue-resolved' : 'clue-unresolved'} />
                    <span className="clue-item__number">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="clue-item__text">{clue.text}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </aside>

      <button
        type="button"
        className="mobile-clue-fab md:hidden"
        onClick={() => setIsDrawerOpen(true)}
        data-testid="mobile-clue-fab"
        aria-label="Open witness clues drawer"
      >
        <span>🔍 Clues ({solvedCount}/{totalClues})</span>
      </button>

      {isDrawerOpen && (
        <>
          <div
            className="mobile-clue-drawer-overlay"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            className="mobile-clue-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-clue-drawer-title"
            data-testid="mobile-clue-drawer"
          >
            <div className="mobile-clue-drawer__header">
              <div className="mobile-clue-drawer__title-group">
                <h2 id="mobile-clue-drawer-title" className="mobile-clue-drawer__title">
                  Witness Clues
                </h2>
                <span className="mobile-clue-drawer__progress">
                  {solvedCount}/{totalClues} marked
                </span>
              </div>
              <button
                type="button"
                className="btn btn--outline btn--small mobile-clue-drawer__close"
                onClick={() => setIsDrawerOpen(false)}
                data-testid="close-clue-drawer-btn"
                aria-label="Close witness clues drawer"
              >
                ✕ Close
              </button>
            </div>

            <div className="mobile-clue-drawer__body">
              <HelpPanel />
              <ol className="clue-panel__list">
                {puzzle.clues.map((clue, idx) => {
                  const isSolved = solvedClueIds.includes(clue.id)
                  return (
                    <li
                      key={clue.id}
                      className={`clue-item ${isSolved ? 'clue-item--solved' : ''}`}
                    >
                      <button
                        type="button"
                        className="clue-item__toggle"
                        onClick={() => toggleClueSolved(clue.id)}
                        aria-pressed={isSolved}
                        aria-label={`Clue ${idx + 1}: ${clue.text}. Mark as ${
                          isSolved ? 'unresolved' : 'resolved'
                        }`}
                      >
                        <AssetIcon name={isSolved ? 'clue-resolved' : 'clue-unresolved'} />
                        <span className="clue-item__number">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="clue-item__text">{clue.text}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </>
      )}
    </>
  )
}

