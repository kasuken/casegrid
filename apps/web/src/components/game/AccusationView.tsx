import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { CharacterPortrait } from '../characters/CharacterPortrait'

export function AccusationView() {
  const { puzzle, accuse, mistakes } = useGameStore()
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!puzzle) return null

  const victim = puzzle.characters.find((c) => c.role === 'victim')
  const suspects = puzzle.characters.filter((c) => c.role === 'suspect')

  const handleAccuse = () => {
    if (!selectedSuspectId) return

    const res = accuse(selectedSuspectId)
    if (!res.success) {
      setErrorMsg(res.explanation ?? 'That does not fit the evidence. Review the scene and try again.')
    }
  }

  return (
    <section
      className="accusation-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accusation-title"
    >
      <div className="accusation-card">
        <header className="accusation-card__header">
          <img className="accusation-card__emblem" src="/assets/brand/badge-accused.svg" width={72} height={72} alt="" />
          <span className="accusation-card__badge">Deduction Verified</span>
          <h2 id="accusation-title" className="accusation-card__title">
            Everyone is in the right place.
          </h2>
          <p className="accusation-card__subtitle">
            Who murdered <strong>{victim?.name ?? 'the victim'}</strong>?
          </p>
        </header>

        {errorMsg && (
          <div role="alert" className="feedback-banner feedback-banner--error" data-testid="accusation-error">
            <img className="asset-icon" src="/assets/ui/badge-clue-conflict.svg" width={28} height={28} alt="" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div
          className="suspect-grid"
          role="radiogroup"
          aria-label="Select the murderer"
        >
          {suspects.map((suspect) => {
            const isSelected = selectedSuspectId === suspect.id
            return (
              <button
                key={suspect.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`suspect-card ${isSelected ? 'suspect-card--selected' : ''}`}
                onClick={() => {
                  setSelectedSuspectId(suspect.id)
                  setErrorMsg(null)
                }}
                data-testid={`accuse-suspect-${suspect.id}`}
              >
                <div className="suspect-card__avatar" aria-hidden="true">
                  <CharacterPortrait character={suspect} />
                </div>
                <div className="suspect-card__info">
                  <strong className="suspect-card__name">{suspect.name}</strong>
                  <span className="suspect-card__desc">{suspect.description}</span>
                </div>
                <span className="suspect-card__indicator" aria-hidden="true">
                  {isSelected ? '●' : '○'}
                </span>
              </button>
            )
          })}
        </div>

        <div className="accusation-card__footer">
          <span className="accusation-card__mistakes">
            Mistakes made so far: <strong>{mistakes}</strong>
          </span>
          <button
            type="button"
            className="btn btn--danger btn--large"
            disabled={!selectedSuspectId}
            onClick={handleAccuse}
            data-testid="accuse-btn"
          >
            Accuse Suspect
          </button>
        </div>
      </div>
    </section>
  )
}
