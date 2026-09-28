import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPuzzleIndex } from '../../services/puzzleLoader'
import { selectNextCase, withProgress, type NextCaseSuggestion } from '../../services/caseProgress'

interface NextCaseCardProps {
  readonly currentCaseId: string
}

export function NextCaseCard({ currentCaseId }: NextCaseCardProps) {
  const [state, setState] = useState<{ suggestion: NextCaseSuggestion; number?: string } | null>(null)

  useEffect(() => {
    let mounted = true
    fetchPuzzleIndex()
      .then((index) => {
        if (!mounted) return
        const entries = withProgress(index)
        const suggestion = selectNextCase(entries, currentCaseId)
        const number =
          suggestion.kind === 'case'
            ? (entries.findIndex((e) => e.id === suggestion.entry.id) + 1).toString().padStart(2, '0')
            : undefined
        setState({ suggestion, number })
      })
      .catch(() => {
        if (mounted) setState({ suggestion: { kind: 'none' } })
      })
    return () => {
      mounted = false
    }
  }, [currentCaseId])

  if (!state || state.suggestion.kind === 'none') return null

  if (state.suggestion.kind === 'all-complete') {
    return (
      <section className="next-case next-case--done" aria-labelledby="next-case-title" data-testid="next-case-card">
        <h2 id="next-case-title" className="next-case__title">Every published case is closed</h2>
        <p className="next-case__text">You have solved them all. More investigations are coming soon.</p>
      </section>
    )
  }

  const { entry } = state.suggestion
  const resuming = entry.status === 'in-progress'

  return (
    <section className="next-case" aria-labelledby="next-case-title" data-testid="next-case-card">
      <p className="next-case__eyebrow">
        {resuming ? 'Pick up where you left off' : 'Your next investigation'} · Case {state.number} ·{' '}
        <span className="next-case__difficulty">{entry.difficulty}</span>
      </p>
      <h2 id="next-case-title" className="next-case__title">{entry.title}</h2>
      {entry.subtitle && <p className="next-case__text">{entry.subtitle}</p>}
      {resuming && <p className="next-case__text">Your placements and notes are saved.</p>}
      <Link to={`/case/${entry.id}`} className="btn btn--primary btn--large" data-testid="open-next-case-btn">
        {resuming ? `Resume case ${state.number}` : 'Open the next case'}
      </Link>
    </section>
  )
}
