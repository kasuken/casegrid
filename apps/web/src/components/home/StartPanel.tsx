import { Link } from 'react-router-dom'
import {
  findActiveCase,
  hasAnyProgress,
  isAvailable,
  selectNextCase,
  type CatalogEntry,
} from '../../services/caseProgress'

interface StartPanelProps {
  readonly entries: readonly CatalogEntry[]
}

function caseNumber(entries: readonly CatalogEntry[], id: string): string {
  return (entries.findIndex((e) => e.id === id) + 1).toString().padStart(2, '0')
}

export function StartPanel({ entries }: StartPanelProps) {
  const active = findActiveCase(entries)

  if (active) {
    return (
      <section className="start-panel" aria-labelledby="start-panel-title" data-testid="start-panel">
        <p className="start-panel__eyebrow">Investigation in progress</p>
        <h2 id="start-panel-title" className="start-panel__title">
          Case {caseNumber(entries, active.id)}: {active.title}
        </h2>
        <p className="start-panel__text">Your placements, notes, and time are saved exactly where you left them.</p>
        <Link to={`/case/${active.id}`} className="btn btn--primary btn--large" data-testid="resume-case-btn">
          Resume investigation
        </Link>
      </section>
    )
  }

  if (!hasAnyProgress(entries)) {
    const first = entries.find(isAvailable)
    if (!first) return null
    return (
      <section className="start-panel" aria-labelledby="start-panel-title" data-testid="start-panel">
        <p className="start-panel__eyebrow">New here?</p>
        <h2 id="start-panel-title" className="start-panel__title">
          Start with {first.title}
        </h2>
        <p className="start-panel__text">
          A gentle first case with a short, skippable guide on the real board.
        </p>
        <Link to={`/case/${first.id}`} className="btn btn--primary btn--large" data-testid="first-mystery-btn">
          Solve your first mystery
        </Link>
      </section>
    )
  }

  const next = selectNextCase(entries)
  if (next.kind !== 'case') return null
  return (
    <section className="start-panel" aria-labelledby="start-panel-title" data-testid="start-panel">
      <p className="start-panel__eyebrow">Your next investigation</p>
      <h2 id="start-panel-title" className="start-panel__title">
        Case {caseNumber(entries, next.entry.id)}: {next.entry.title}
      </h2>
      {next.entry.subtitle && <p className="start-panel__text">{next.entry.subtitle}</p>}
      <Link to={`/case/${next.entry.id}`} className="btn btn--primary btn--large" data-testid="next-case-cta">
        Open case {caseNumber(entries, next.entry.id)}
      </Link>
    </section>
  )
}
