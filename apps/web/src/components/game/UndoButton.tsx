import { canUndo, useGameStore } from '../../stores/gameStore'

export function UndoButton() {
  const enabled = useGameStore(canUndo)
  const undo = useGameStore((s) => s.undo)

  return (
    <button
      type="button"
      className="btn btn--subtle btn--undo"
      onClick={undo}
      aria-disabled={!enabled}
      aria-keyshortcuts="Control+Z Meta+Z"
      aria-describedby="undo-hint"
      data-testid="undo-btn"
    >
      <span aria-hidden="true">↶</span> Undo
      <span id="undo-hint" className="sr-only">
        {enabled ? 'Undo your last placement or note. Shortcut: Control or Command plus Z.' : 'Nothing to undo yet.'}
      </span>
    </button>
  )
}
