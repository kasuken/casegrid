import { Link } from 'react-router-dom'
import type { FeaturedCaseResult } from '@casegrid/puzzle-engine'
import type { CatalogEntry } from '../../services/caseProgress'
import { formatDuration } from '../../services/shareResult'

interface WeeklyCasePanelProps {
  readonly entries: readonly CatalogEntry[]
  readonly featured: FeaturedCaseResult | null
}

const utcDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

export function WeeklyCasePanel({ entries, featured }: WeeklyCasePanelProps) {
  const entry = featured?.kind === 'featured' ? entries.find((e) => e.id === featured.week.caseId) : undefined

  if (!featured || featured.kind !== 'featured' || !entry) {
    return (
      <section className="weekly-panel weekly-panel--idle" aria-labelledby="weekly-title" data-testid="weekly-panel">
        <h2 id="weekly-title" className="weekly-panel__eyebrow">Case of the Week</h2>
        <p className="weekly-panel__text">
          No Case of the Week is scheduled right now. Every case below is ready to play.
        </p>
      </section>
    )
  }

  const number = (entries.findIndex((e) => e.id === entry.id) + 1).toString().padStart(2, '0')
  const until = utcDay.format(new Date(featured.endsAt))

  return (
    <section className="weekly-panel" aria-labelledby="weekly-title" data-testid="weekly-panel">
      <p className="weekly-panel__eyebrow">Case of the Week · until {until}, 00:00 UTC</p>
      <h2 id="weekly-title" className="weekly-panel__title">
        Case {number}: {entry.title}
      </h2>
      <p className="weekly-panel__text">
        {entry.subtitle ? `${entry.subtitle}. ` : ''}Everyone playing this week gets the same case, so you can compare notes.
      </p>
      {entry.status === 'completed' ? (
        <p className="weekly-panel__status" data-testid="weekly-status">
          You closed this case{entry.bestTime !== undefined ? ` · best time ${formatDuration(entry.bestTime)}` : ''}.
        </p>
      ) : null}
      <Link to={`/case/${entry.id}`} className="btn btn--outline" data-testid="weekly-case-btn">
        {entry.status === 'in-progress'
          ? 'Resume this week’s case'
          : entry.status === 'completed'
            ? 'Open this week’s case'
            : 'Play this week’s case'}
      </Link>
    </section>
  )
}
