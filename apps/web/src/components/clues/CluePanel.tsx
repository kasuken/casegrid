import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { AssetIcon } from '../AssetIcon'

export function CluePanel() {
  const { puzzle, solvedClueIds, toggleClueSolved } = useGameStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (!puzzle) return null

  const totalClues = puzzle.clues.length
  const solvedCount = solvedClueIds.length

  return (
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
  )
}
