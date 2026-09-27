import { useGameStore } from '../../stores/gameStore'
import { useGuideStore } from '../../stores/guideStore'
import { HowToPlay } from './HowToPlay'

interface CaseBriefingModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export function CaseBriefingModal({ isOpen, onClose }: CaseBriefingModalProps) {
  const { puzzle } = useGameStore()
  const reopenGuide = useGuideStore((s) => s.reopen)

  if (!isOpen || !puzzle) return null

  const hasGuide = (puzzle.tutorial?.length ?? 0) > 0
  const victim = puzzle.characters.find((c) => c.role === 'victim')
  const suspects = puzzle.characters.filter((c) => c.role === 'suspect')

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-briefing-title"
      onClick={onClose}
    >
      <div
        className="modal-card modal-card--briefing"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="case-intro__edition">
          Case Briefing • {puzzle.difficulty.toUpperCase()}
        </span>
        <h2 id="case-briefing-title" className="modal-title">
          {puzzle.title}
        </h2>
        {puzzle.subtitle && <p className="case-intro__subtitle">{puzzle.subtitle}</p>}

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
            <span className="dossier-card__desc">{suspects.map((s) => s.name).join(', ')}</span>
          </div>
        </section>

        <h3 className="modal-subtitle">How to play</h3>
        <HowToPlay victimName={victim?.name} />

        <div className="modal-actions">
          {hasGuide && (
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                reopenGuide()
                onClose()
              }}
              data-testid="reopen-guide-btn"
            >
              Show the guide again
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary"
            onClick={onClose}
            data-testid="close-case-briefing-btn"
          >
            Back to Investigation
          </button>
        </div>
      </div>
    </div>
  )
}
