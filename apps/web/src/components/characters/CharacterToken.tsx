import { useDraggable } from '@dnd-kit/core'
import type { Character } from '@casegrid/puzzle-engine'
import { CharacterPortrait } from './CharacterPortrait'

interface CharacterTokenProps {
  readonly character: Character
  readonly isSelected?: boolean
  readonly isPlaced?: boolean
  readonly onClick?: () => void
  readonly disabled?: boolean
}

// Generate consistent accessible colors per character
const CHARACTER_PALETTES: Record<string, { bg: string; text: string; border: string }> = {
  reginald: { bg: '#8f2d20', text: '#fff9f0', border: '#5c170d' }, // deep burgundy for victim
  evelyn: { bg: '#23594e', text: '#e6f7f2', border: '#123932' },   // emerald green
  arthur: { bg: '#405273', text: '#edf2fa', border: '#253450' },   // navy slate
  clara: { bg: '#91532b', text: '#fff4eb', border: '#5f3214' },    // warm amber
  julian: { bg: '#58436e', text: '#f3eef8', border: '#38274a' },   // amethyst plum
  beatrice: { bg: '#6b663b', text: '#faf8ea', border: '#45411f' }, // antique olive
}

export function CharacterToken({
  character,
  isSelected = false,
  isPlaced = false,
  onClick,
  disabled = false,
}: CharacterTokenProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `char-${character.id}`,
    data: { characterId: character.id },
    disabled,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined

  const colors = CHARACTER_PALETTES[character.id] ?? {
    bg: character.role === 'victim' ? '#8f2d20' : '#405273',
    text: '#ffffff',
    border: '#18272d',
  }

  return (
    <button
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: isSelected ? 'var(--evidence, #b84435)' : colors.border,
      }}
      className={`character-token ${isSelected ? 'character-token--selected' : ''} ${
        isPlaced ? 'character-token--placed' : ''
      } ${isDragging ? 'character-token--dragging' : ''}`}
      onClick={onClick}
      {...attributes}
      {...listeners}
      aria-pressed={isSelected}
      aria-label={`${character.name} (${character.role})${isPlaced ? ' placed' : ' unplaced'}`}
      data-testid={`character-token-${character.id}`}
    >
      <CharacterPortrait character={character} />
      <span className="character-token__name">{character.name}</span>
      {character.role === 'victim' && (
        <span className="character-token__role-tag" aria-hidden="true">
          Victim
        </span>
      )}
    </button>
  )
}
