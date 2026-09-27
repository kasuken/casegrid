import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CaseComingSoonError, fetchPuzzle } from '../services/puzzleLoader'
import { ComingSoonView } from '../components/game/ComingSoonView'
import { loadProgress } from '../services/progressStorage'
import { useGameStore } from '../stores/gameStore'
import { CaseGridMark } from '../components/CaseGridMark'
import { GameHeader } from '../components/game/GameHeader'
import { CaseIntro } from '../components/game/CaseIntro'
import { CharacterTray } from '../components/characters/CharacterTray'
import { BoardGrid } from '../components/grid/BoardGrid'
import { CluePanel } from '../components/clues/CluePanel'
import { AccusationView } from '../components/game/AccusationView'
import { ResultView } from '../components/game/ResultView'
import { FeedbackBanner } from '../components/game/FeedbackBanner'
import { useUndoShortcut } from '../hooks/useUndoShortcut'

export function CasePage() {
  const { caseId = 'case-001' } = useParams<{ caseId: string }>()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<Error | null>(null)

  const {
    stage,
    feedback,
    loadCase,
    placeCharacter,
    clearFeedback,
    undo,
  } = useGameStore()

  useUndoShortcut(stage === 'investigating', undo)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // Prevents accidental drag on click/tap
      },
    }),
    useSensor(KeyboardSensor),
  )

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
        if (!(err instanceof CaseComingSoonError)) console.error('Error loading case:', err)
        setLoadError(err instanceof Error ? err : new Error('Failed to load case'))
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [caseId, loadCase])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const characterId = active.data.current?.characterId
    const position = over.data.current?.position

    if (characterId && position) {
      placeCharacter(characterId, position)
    }
  }

  if (loading) {
    return (
      <main className="site-shell" data-testid="case-page-loading">
        <header className="site-header">
          <Link className="brand" to="/" aria-label="CaseGrid home">
            <CaseGridMark />
            <span>CaseGrid</span>
          </Link>
          <span className="edition">Loading dossier...</span>
        </header>
        <div className="loading-state">
          <div className="spinner" aria-hidden="true" />
          <p>Opening case file {caseId}...</p>
        </div>
      </main>
    )
  }

  if (loadError instanceof CaseComingSoonError) {
    return <ComingSoonView metadata={loadError.metadata} />
  }

  if (loadError) {
    return (
      <main className="site-shell not-found" data-testid="case-page-error">
        <header className="site-header">
          <Link className="brand" to="/" aria-label="CaseGrid home">
            <CaseGridMark />
            <span>CaseGrid</span>
          </Link>
          <span className="edition">File Missing</span>
        </header>
        <section className="intro">
          <p className="intro__context">Case File Not Found</p>
          <h1>Unable to open file</h1>
          <p className="intro__summary">{loadError.message}</p>
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
    <div className="game-screen" data-testid="case-page">
      <GameHeader />

      <main className="game-content">
        <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />

        {stage === 'intro' && <CaseIntro />}

        {stage === 'investigating' && (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="investigation-layout">
              <div className="investigation-layout__main">
                <BoardGrid />
                <CharacterTray />
              </div>
              <div className="investigation-layout__sidebar">
                <CluePanel />
              </div>
            </div>
          </DndContext>
        )}

        {stage === 'accusing' && <AccusationView />}

        {stage === 'closed' && <ResultView />}
      </main>
    </div>
  )
}
