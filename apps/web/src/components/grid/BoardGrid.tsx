import { useMemo } from 'react'
import {
  getAreaForPosition,
  isPositionEqual,
  type Position,
} from '@casegrid/puzzle-engine'
import { useGameStore } from '../../stores/gameStore'
import { Cell } from './Cell'
import { UndoButton } from '../game/UndoButton'

export function BoardGrid() {
  const {
    puzzle,
    placements,
    exclusions,
    selectedCharacterId,
    checkSolution,
  } = useGameStore()

  // Precompute first cell of each area for label placement
  const areaHeaders = useMemo(() => {
    const headers = new Map<string, Position>()
    if (!puzzle) return headers
    for (const area of puzzle.areas) {
      if (area.cells.length > 0) {
        // Find top-leftmost cell (min row, then min col)
        let best = area.cells[0]
        for (const c of area.cells) {
          if (c.row < best.row || (c.row === best.row && c.column < best.column)) {
            best = c
          }
        }
        headers.set(area.id, best)
      }
    }
    return headers
  }, [puzzle])

  if (!puzzle) return null

  const { width, height } = puzzle.grid
  const placedCount = Object.keys(placements).length
  const totalCount = puzzle.characters.length
  const allPlaced = placedCount === totalCount

  // Generate all positions
  const cells = []
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const pos: Position = { row: r, column: c }
      const area = getAreaForPosition(pos, puzzle.areas)
      const areaNumber = area ? puzzle.areas.findIndex((item) => item.id === area.id) + 1 : undefined
      const startsAreaAbove = Boolean(area && getAreaForPosition({ row: r - 1, column: c }, puzzle.areas)?.id !== area.id)
      const startsAreaLeft = Boolean(area && getAreaForPosition({ row: r, column: c - 1 }, puzzle.areas)?.id !== area.id)
      const isHeader =
        area &&
        areaHeaders.get(area.id) &&
        isPositionEqual(pos, areaHeaders.get(area.id)!)

      const mapObj = puzzle.objects.find((o) => isPositionEqual(o.position, pos))

      // Check which character is placed here
      let placedChar = undefined
      for (const [charId, p] of Object.entries(placements)) {
        if (isPositionEqual(p, pos)) {
          placedChar = puzzle.characters.find((char) => char.id === charId)
          break
        }
      }

      // Check if excluded for selected character
      const isExcluded = selectedCharacterId
        ? (exclusions[selectedCharacterId] ?? []).some((p) => isPositionEqual(p, pos))
        : false

      cells.push(
        <Cell
          key={`${r}-${c}`}
          position={pos}
          area={area}
          areaNumber={areaNumber}
          startsAreaAbove={startsAreaAbove}
          startsAreaLeft={startsAreaLeft}
          isAreaHeader={Boolean(isHeader)}
          mapObject={mapObj}
          placedCharacter={placedChar}
          isExcluded={isExcluded}
        />,
      )
    }
  }

  return (
    <section className="board-container" aria-label="Investigation grid map">
      <div className="board-frame">
        <div
          className="board-grid"
          style={{
            gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
          }}
          data-testid="board-grid"
        >
          {cells}
        </div>
      </div>

      <ol className="board-room-key" aria-label="Map rooms">
        {puzzle.areas.map((area, index) => (
          <li key={area.id}>
            <span className={`board-room-key__number grid-cell--zone-${index + 1}`}>{index + 1}</span>
            {area.name}
          </li>
        ))}
      </ol>

      <div className="board-actions">
        <span className="board-actions__count">
          Placed: <strong>{placedCount}</strong> of <strong>{totalCount}</strong> characters
        </span>
        <div className="board-actions__buttons">
          <UndoButton />
          <button
            type="button"
            className="btn btn--primary btn--check"
            onClick={() => checkSolution()}
            aria-disabled={!allPlaced}
            data-testid="check-solution-btn"
            title={allPlaced ? 'Check your solution' : 'Place all suspects first'}
          >
            Check Solution
          </button>
        </div>
      </div>
    </section>
  )
}
