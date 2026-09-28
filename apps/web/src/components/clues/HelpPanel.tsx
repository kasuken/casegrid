import { useGameStore } from '../../stores/gameStore'

export function HelpPanel() {
  const { puzzle, revealedHelpIds, revealNextHelp } = useGameStore()
  const prompts = puzzle?.helpPrompts ?? []
  if (!puzzle || prompts.length === 0) return null

  const clueNumber = new Map(puzzle.clues.map((clue, index) => [clue.id, index + 1]))
  const revealed = prompts.filter((prompt) => revealedHelpIds.includes(prompt.id))
  const remaining = prompts.length - revealed.length

  return (
    <section className="help-panel" aria-labelledby="help-panel-title" data-testid="help-panel">
      <div className="help-panel__header">
        <h3 id="help-panel-title" className="help-panel__title">
          Stuck?
        </h3>
        <button
          type="button"
          className="btn btn--subtle btn--small"
          onClick={revealNextHelp}
          disabled={remaining === 0}
          data-testid="reveal-help-btn"
        >
          {remaining === 0 ? 'No more nudges' : revealed.length === 0 ? 'Need a nudge?' : 'Another nudge'}
        </button>
      </div>
      <p className="help-panel__note">
        Nudges point to evidence worth combining. They never show an answer or check your board.
      </p>
      {revealed.length > 0 && (
        <ol className="help-panel__list" aria-live="polite" data-testid="revealed-help">
          {revealed.map((prompt) => (
            <li key={prompt.id} className="help-panel__item">
              <span>{prompt.text}</span>
              {prompt.clueIds.length > 0 && (
                <span className="help-panel__clues">
                  {prompt.clueIds.length === 1 ? 'Look at clue ' : 'Look at clues '}
                  {prompt.clueIds.map((id) => (clueNumber.get(id) ?? 0).toString().padStart(2, '0')).join(', ')}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
