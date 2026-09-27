import { useGameStore } from '../../stores/gameStore'
import { CharacterToken } from './CharacterToken'
import { AssetIcon } from '../AssetIcon'

export function CharacterTray() {
  const {
    puzzle,
    placements,
    selectedCharacterId,
    interactionMode,
    selectCharacter,
    setInteractionMode,
    unplaceCharacter,
  } = useGameStore()

  if (!puzzle) return null

  const selectedChar = puzzle.characters.find((c) => c.id === selectedCharacterId)
  const isSelectedPlaced = selectedChar ? Boolean(placements[selectedChar.id]) : false

  return (
    <section className="character-tray" aria-label="Characters tray">
      <div className="character-tray__header">
        <h2 className="character-tray__title">Persons of Interest</h2>
        <div
          className="mode-toggle"
          role="radiogroup"
          aria-label="Cell interaction mode"
        >
          <button
            type="button"
            role="radio"
            aria-checked={interactionMode === 'place'}
            className={`mode-toggle__btn ${
              interactionMode === 'place' ? 'mode-toggle__btn--active' : ''
            }`}
            onClick={() => setInteractionMode('place')}
            data-testid="mode-place-btn"
          >
            Place
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={interactionMode === 'exclude'}
            className={`mode-toggle__btn ${
              interactionMode === 'exclude' ? 'mode-toggle__btn--active' : ''
            }`}
            onClick={() => setInteractionMode('exclude')}
            data-testid="mode-exclude-btn"
          >
            <AssetIcon name="cell-excluded" /> Exclude Note
          </button>
        </div>
      </div>

      <div className="character-tray__list">
        {puzzle.characters.map((char) => {
          const isPlaced = Boolean(placements[char.id])
          const isSelected = selectedCharacterId === char.id

          return (
            <div key={char.id} className="character-tray__item">
              <CharacterToken
                character={char}
                isSelected={isSelected}
                isPlaced={isPlaced}
                onClick={() => {
                  if (isSelected) {
                    selectCharacter(null)
                  } else {
                    selectCharacter(char.id)
                  }
                }}
              />
            </div>
          )
        })}
      </div>

      {selectedChar && (
        <div className="character-tray__selected-bar">
          <span className="character-tray__selected-hint">
            Selected: <strong>{selectedChar.name}</strong>
            {interactionMode === 'place'
              ? ' — Tap a map cell to place'
              : ' — Tap a map cell to mark/unmark as excluded note'}
          </span>
          {isSelectedPlaced && (
            <button
              type="button"
              className="btn btn--subtle btn--small"
              onClick={() => unplaceCharacter(selectedChar.id)}
              data-testid="recall-character-btn"
            >
              Recall to Tray
            </button>
          )}
        </div>
      )}
    </section>
  )
}
