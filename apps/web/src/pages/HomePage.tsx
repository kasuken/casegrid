import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPuzzleIndex } from '../services/puzzleLoader'
import { loadProgress } from '../services/progressStorage'
import { AssetIcon } from '../components/AssetIcon'
import type { PuzzleMetadata } from '@casegrid/puzzle-engine'

interface CaseCardData extends PuzzleMetadata {
  readonly status: 'not-started' | 'in-progress' | 'completed'
  readonly bestTime?: number
}

function formatBestTime(secs?: number): string {
  if (secs === undefined) return '--:--'
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
}

export function HomePage() {
  const [cases, setCases] = useState<CaseCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchPuzzleIndex()
      .then((index) => {
        if (!mounted) return
        const withProgress: CaseCardData[] = index.map((item) => {
          const progress = loadProgress(item.id)
          return {
            ...item,
            status: progress?.status ?? 'not-started',
            bestTime: progress?.bestTime,
          }
        })
        setCases(withProgress)
        setLoading(false)
      })
      .catch((err) => {
        if (!mounted) return
        console.error('Error loading cases catalog:', err)
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="site-shell" data-testid="home-page">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="CaseGrid home">
          <img className="brand__wordmark" src="/assets/brand/logo-casegrid.svg" width={320} height={80} alt="CaseGrid" />
        </Link>
        <span className="edition">Spatial Murder-Mystery Logic Game</span>
      </header>

      <section className="intro" aria-labelledby="intro-title">
        <p className="intro__context">A spatial murder-mystery logic game</p>
        <h1 id="intro-title">
          Solve the scene.
          <br />
          Find the killer.
        </h1>
        <p className="intro__summary">
          Inspect the crime scene, place every suspect according to witness testimony,
          and discover who was alone with the victim.
        </p>

        <div className="cases-section">
          <h2 className="cases-section__title">Case Files</h2>
          <p>Start with the first five cases. More investigations are coming soon.</p>

          {loading ? (
            <p className="loading-note">Gathering case records...</p>
          ) : (
            <div className="cases-grid" role="list">
              {cases.map((caseItem, idx) => {
                const caseNum = (idx + 1).toString().padStart(2, '0')
                const isCompleted = caseItem.status === 'completed'
                const isInProgress = caseItem.status === 'in-progress'

                if (caseItem.availability === 'coming-soon') {
                  return (
                    <article
                      key={caseItem.id}
                      className="case-card case-card--coming-soon"
                      role="listitem"
                      aria-label={`Case ${caseNum}: ${caseItem.title}. Coming soon`}
                      data-testid={`case-card-${caseItem.id}`}
                    >
                      <div className="case-card__header">
                        <span className="case-card__number">CASE {caseNum}</span>
                      </div>
                      <h3 className="case-card__title">{caseItem.title}</h3>
                      <p className="case-card__subtitle">{caseItem.subtitle}</p>
                      <div className="case-card__footer">
                        <span className="status-badge">Coming soon</span>
                      </div>
                    </article>
                  )
                }

                return (
                  <Link
                    key={caseItem.id}
                    to={`/case/${caseItem.id}`}
                    className={`case-card ${isCompleted ? 'case-card--completed' : ''}`}
                    role="listitem"
                    aria-label={`Case ${caseNum}: ${caseItem.title}. Difficulty: ${
                      caseItem.difficulty
                    }. Status: ${
                      isCompleted ? `Solved in ${formatBestTime(caseItem.bestTime)}` : isInProgress ? 'In Progress' : 'Unopened'
                    }`}
                    data-testid={`case-card-${caseItem.id}`}
                  >
                    <div className="case-card__header">
                      <span className="case-card__number">CASE {caseNum}</span>
                      <span className="case-card__difficulty">{caseItem.difficulty}</span>
                    </div>

                    <h3 className="case-card__title">{caseItem.title}</h3>
                    {caseItem.subtitle && (
                      <p className="case-card__subtitle">{caseItem.subtitle}</p>
                    )}

                    <div className="case-card__footer">
                      {isCompleted ? (
                        <div className="case-card__status case-card__status--solved">
                          <span className="status-badge status-badge--solved"><img className="asset-icon" src="/assets/brand/badge-solved-star.svg" width={20} height={20} alt="" /> Solved</span>
                          <span className="case-card__best-time" data-testid="card-best-time">
                            <AssetIcon name="timer" /> {formatBestTime(caseItem.bestTime)}
                          </span>
                        </div>
                      ) : isInProgress ? (
                        <div className="case-card__status case-card__status--in-progress">
                          <span className="status-badge status-badge--active">● In Progress</span>
                        </div>
                      ) : (
                        <div className="case-card__status">
                          <span className="status-badge">Unopened</span>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <div className="board-trace" aria-hidden="true">
        <span className="board-trace__room board-trace__room--one" />
        <span className="board-trace__room board-trace__room--two" />
        <span className="board-trace__room board-trace__room--three" />
        <span className="board-trace__marker board-trace__marker--one" />
        <span className="board-trace__marker board-trace__marker--two" />
      </div>

      <footer className="site-footer">
        <span>CaseGrid</span>
        <span>Static web application • No account required</span>
      </footer>
    </main>
  )
}
