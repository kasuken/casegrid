import { useDroppable } from '@dnd-kit/core'
import {
  type Area,
  type Character,
  type MapObject,
  type Position,
} from '@casegrid/puzzle-engine'
import { useGameStore } from '../../stores/gameStore'
import { CharacterToken } from '../characters/CharacterToken'
import { ObjectToken } from './ObjectToken'

interface CellProps {
  readonly position: Position
  readonly area?: Area
  readonly isAreaHeader?: boolean
  readonly mapObject?: MapObject
  readonly placedCharacter?: Character
  readonly isExcluded?: boolean
  readonly isTargetHighlight?: boolean
}

export function Cell({
  position,
  area,
  isAreaHeader = false,
  mapObject,
  placedCharacter,
  isExcluded = false,
  isTargetHighlight = false,
}: CellProps) {
  const {
    selectedCharacterId,
    interactionMode,
    placeCharacter,
    toggleExclusion,
    selectCharacter,
  } = useGameStore()

  const cellId = `cell-${position.row}-${position.column}`

  const { isOver, setNodeRef } = useDroppable({
    id: cellId,
    data: { position },
    disabled: Boolean(mapObject),
  })

  const handleClick = () => {
    if (mapObject) {
      return
    }

    if (interactionMode === 'exclude') {
      if (selectedCharacterId) {
        toggleExclusion(selectedCharacterId, position)
      }
      return
    }

    // Place mode
    if (selectedCharacterId) {
      placeCharacter(selectedCharacterId, position)
      // Keep selection or deselect
    } else if (placedCharacter) {
      selectCharacter(placedCharacter.id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const isBlocked = Boolean(mapObject)
  const isSelected = placedCharacter && placedCharacter.id === selectedCharacterId

  return (
    <div
      ref={setNodeRef}
      className={`grid-cell ${area ? `grid-cell--area-${area.id}` : ''} ${
        isOver && !isBlocked ? 'grid-cell--drop-over' : ''
      } ${isTargetHighlight ? 'grid-cell--target' : ''} ${
        isBlocked ? 'grid-cell--blocked' : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isBlocked ? -1 : 0}
      role="button"
      aria-label={`Row ${position.row + 1}, Column ${position.column + 1}${
        area ? `, ${area.name}` : ''
      }${mapObject ? `, Object: ${mapObject.label ?? mapObject.type}` : ''}${
        placedCharacter ? `, Occupied by ${placedCharacter.name}` : ', Empty'
      }${isExcluded ? ', Marked impossible' : ''}`}
      data-testid={`cell-${position.row}-${position.column}`}
    >
      {isAreaHeader && area && (
        <span className="grid-cell__area-label" aria-hidden="true">
          {area.name}
        </span>
      )}

      <span className="grid-cell__coords" aria-hidden="true">
        {position.row + 1},{position.column + 1}
      </span>

      <div className="grid-cell__content">
        {mapObject && <ObjectToken object={mapObject} />}

        {placedCharacter && (
          <CharacterToken
            character={placedCharacter}
            isPlaced={true}
            isSelected={isSelected}
            onClick={() => {
              // Clicking directly on placed character
              if (selectedCharacterId === placedCharacter.id) {
                selectCharacter(null)
              } else {
                selectCharacter(placedCharacter.id)
              }
            }}
          />
        )}

        {isExcluded && !placedCharacter && (
          <div
            className="exclusion-marker"
            aria-label="Excluded cell note"
            title="Marked impossible for selected character"
          >
            ✕
          </div>
        )}
      </div>
    </div>
  )
}
