import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPuzzle } from '../services/puzzleLoader'
import { loadProgress } from '../services/progressStorage'
import { useGameStore } from '../stores/gameStore'
import { CaseGridMark } from '../components/CaseGridMark'
import { GameHeader } from '../components/game/GameHeader'
import { ResultView } from '../components/game/ResultView'

export function ResultPage() {
  const { caseId = 'case-001' } = useParams<{ caseId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { stage, loadCase } = useGameStore()

  useEffect(() => {
    let mounted = true
    fetchPuzzle(caseId)
      .then((puzzle) => {
        if (!mounted) return
        const saved = loadProgress(caseId)
        loadCase(puzzle, saved)
        setLoading(false)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Failed to load case')
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [caseId, loadCase])

  if (loading) {
    return (
      <main className="site-shell">
        <header className="site-header">
          <Link className="brand" to="/" aria-label="CaseGrid home">
            <CaseGridMark />
            <span>CaseGrid</span>
          </Link>
          <span className="edition">Loading result...</span>
        </header>
        <div className="loading-state">
          <p>Verifying conclusion...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="site-shell not-found">
        <header className="site-header">
          <Link className="brand" to="/" aria-label="CaseGrid home">
            <CaseGridMark />
            <span>CaseGrid</span>
          </Link>
          <span className="edition">Case Missing</span>
        </header>
        <section className="intro">
          <h1>Case not found</h1>
          <p className="intro__summary">{error}</p>
          <div className="mt-8">
            <Link to="/" className="btn btn--primary">
              Return to Case Selection
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className="game-screen">
      <GameHeader />
      <main className="game-content">
        {stage === 'closed' ? (
          <ResultView />
        ) : (
          <div className="result-view">
            <div className="result-view__card text-center">
              <h1>Investigation Still Active</h1>
              <p className="intro__summary">
                This case has not been solved yet. Resume your investigation to uncover the truth.
              </p>
              <div className="result-view__actions mt-6">
                <Link to={`/case/${caseId}`} className="btn btn--primary">
                  Resume Investigation
                </Link>
                <Link to="/" className="btn btn--outline">
                  Back to Cases
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
