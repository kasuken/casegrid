import { useEffect } from 'react'

function isTextEntry(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/** Ctrl+Z / Cmd+Z undo that leaves browser text editing alone. */
export function useUndoShortcut(enabled: boolean, onUndo: () => void): void {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'z' || event.shiftKey || event.altKey) return
      if (!(event.ctrlKey || event.metaKey)) return
      if (isTextEntry(event.target)) return
      event.preventDefault()
      onUndo()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onUndo])
}
