import { useGameStore } from '../../stores/gameStore'

export function CaseIntro() {
  const { puzzle, startInvestigation, bestTime } = useGameStore()
  if (!puzzle) return null

  const victim = puzzle.characters.find((c) => c.role === 'victim')
  const suspects = puzzle.characters.filter((c) => c.role === 'suspect')

  const formatBestTime = (secs?: number) => {
    if (secs === undefined) return null
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

  return (
    <article className="case-intro" aria-labelledby="case-intro-title">
      <header className="case-intro__header">
        <span className="case-intro__edition">
          Case Briefing • {puzzle.difficulty.toUpperCase()}
        </span>
        <h1 id="case-intro-title" className="case-intro__title">
          {puzzle.title}
        </h1>
        {puzzle.subtitle && (
          <p className="case-intro__subtitle">{puzzle.subtitle}</p>
        )}
      </header>

      <div className="case-intro__body">
        <p className="case-intro__narrative">{puzzle.description}</p>

        <section className="case-intro__dossier" aria-label="Incident summary">
          <div className="dossier-card dossier-card--victim">
            <span className="dossier-card__label">Victim</span>
            <strong className="dossier-card__name">{victim?.name ?? 'Unknown'}</strong>
            <span className="dossier-card__desc">{victim?.description}</span>
          </div>

          <div className="dossier-card">
            <span className="dossier-card__label">Suspects</span>
            <strong className="dossier-card__name">{suspects.length} Persons of Interest</strong>
            <span className="dossier-card__desc">
              {suspects.map((s) => s.name).join(', ')}
            </span>
          </div>

          {bestTime !== undefined && (
            <div className="dossier-card dossier-card--best">
              <span className="dossier-card__label">Best Record</span>
              <strong className="dossier-card__name">{formatBestTime(bestTime)}</strong>
              <span className="dossier-card__desc">Previously solved</span>
            </div>
          )}
        </section>

        <div className="case-intro__rules">
          <p>
            <strong>Investigation objective:</strong> Use the witness clues to place every character on the map.
            Once all characters are placed, accuse the suspect who was alone in the room with {victim?.name ?? 'the victim'}.
          </p>
        </div>

        <div className="case-intro__actions">
          <button
            type="button"
            className="btn btn--primary btn--large"
            onClick={startInvestigation}
            data-testid="start-investigation-btn"
          >
            Start Investigation
          </button>
        </div>
      </div>
    </article>
  )
}
