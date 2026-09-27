import { useEffect } from 'react'
import type { Position } from '@casegrid/puzzle-engine'
import { useGameStore } from '../../stores/gameStore'
import { useGuideStore } from '../../stores/guideStore'

function hasNewPlacement(
  next: Readonly<Record<string, Position>>,
  prev: Readonly<Record<string, Position>>,
): boolean {
  return Object.entries(next).some(([id, pos]) => {
    const before = prev[id]
    return !before || before.row !== pos.row || before.column !== pos.column
  })
}

export function CaseGuide() {
  const { visible, steps, stepIndex, next, skip, advanceOn } = useGuideStore()

  useEffect(
    () =>
      useGameStore.subscribe((state, prev) => {
        if (state.history.length < prev.history.length) return
        if (state.placements !== prev.placements && hasNewPlacement(state.placements, prev.placements)) {
          advanceOn('place')
        } else if (state.selectedCharacterId && state.selectedCharacterId !== prev.selectedCharacterId) {
          advanceOn('select')
        }
        if (state.exclusions !== prev.exclusions) advanceOn('exclude')
        if (state.solvedClueIds !== prev.solvedClueIds) advanceOn('clue')
      }),
    [advanceOn],
  )

  const step = steps[stepIndex]
  if (!visible || !step) return null

  const isLast = stepIndex === steps.length - 1
  const waitsForAction = step.advanceOn !== 'manual'

  return (
    <section className="case-guide" aria-labelledby="case-guide-title" data-testid="case-guide">
      <div aria-live="polite" aria-atomic="true">
        <p className="case-guide__meta">
          Guide · Step {stepIndex + 1} of {steps.length}
        </p>
        <h2 id="case-guide-title" className="case-guide__title">
          {step.title}
        </h2>
        <p className="case-guide__text">{step.text}</p>
        {waitsForAction && <p className="case-guide__hint">Try it on the board to continue.</p>}
      </div>
      <div className="case-guide__actions">
        <button type="button" className="btn btn--subtle btn--small" onClick={skip} data-testid="guide-skip-btn">
          Skip guide
        </button>
        <button type="button" className="btn btn--small" onClick={next} data-testid="guide-next-btn">
          {isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </section>
  )
}
