import { describe, expect, it } from 'vitest'
import {
  arePositionsAdjacent,
  decodePosition,
  encodePosition,
  getAreaForPosition,
  getOrthogonalNeighbors,
  getValidPlacementCells,
  isCellBlockedByObject,
  isPositionEqual,
  isPositionWithinBounds,
  type Area,
  type GridDefinition,
  type MapObject,
  type Position,
} from '../src/index.ts'

describe('grid utilities', () => {
  const grid: GridDefinition = { width: 4, height: 4 }
  const areas: Area[] = [
    {
      id: 'foyer',
      name: 'Foyer',
      cells: [
        { row: 0, column: 0 },
        { row: 0, column: 1 },
      ],
    },
    {
      id: 'lounge',
      name: 'Lounge',
      cells: [
        { row: 1, column: 0 },
        { row: 1, column: 1 },
      ],
    },
  ]
  const objects: MapObject[] = [
    {
      id: 'statue',
      type: 'statue',
      position: { row: 2, column: 2 },
    },
  ]

  it('correctly compares positions', () => {
    expect(isPositionEqual({ row: 1, column: 2 }, { row: 1, column: 2 })).toBe(true)
    expect(isPositionEqual({ row: 1, column: 2 }, { row: 1, column: 3 })).toBe(false)
  })

  it('correctly checks bounds', () => {
    expect(isPositionWithinBounds({ row: 0, column: 0 }, grid)).toBe(true)
    expect(isPositionWithinBounds({ row: 3, column: 3 }, grid)).toBe(true)
    expect(isPositionWithinBounds({ row: -1, column: 0 }, grid)).toBe(false)
    expect(isPositionWithinBounds({ row: 4, column: 2 }, grid)).toBe(false)
    expect(isPositionWithinBounds({ row: 2, column: 4 }, grid)).toBe(false)
  })

  it('strictly enforces orthogonal adjacency and excludes diagonals', () => {
    const center: Position = { row: 2, column: 2 }

    // Orthogonal neighbors are adjacent
    expect(arePositionsAdjacent(center, { row: 1, column: 2 })).toBe(true)
    expect(arePositionsAdjacent(center, { row: 3, column: 2 })).toBe(true)
    expect(arePositionsAdjacent(center, { row: 2, column: 1 })).toBe(true)
    expect(arePositionsAdjacent(center, { row: 2, column: 3 })).toBe(true)

    // Diagonals are NOT adjacent
    expect(arePositionsAdjacent(center, { row: 1, column: 1 })).toBe(false)
    expect(arePositionsAdjacent(center, { row: 1, column: 3 })).toBe(false)
    expect(arePositionsAdjacent(center, { row: 3, column: 1 })).toBe(false)
    expect(arePositionsAdjacent(center, { row: 3, column: 3 })).toBe(false)

    // Identical position is not adjacent
    expect(arePositionsAdjacent(center, center)).toBe(false)

    // Far distance is not adjacent
    expect(arePositionsAdjacent(center, { row: 0, column: 2 })).toBe(false)
  })

  it('finds orthogonal neighbors respecting bounds', () => {
    const cornerNeighbors = getOrthogonalNeighbors({ row: 0, column: 0 }, grid)
    expect(cornerNeighbors).toHaveLength(2)
    expect(cornerNeighbors).toContainEqual({ row: 1, column: 0 })
    expect(cornerNeighbors).toContainEqual({ row: 0, column: 1 })
  })

  it('finds area for position', () => {
    expect(getAreaForPosition({ row: 0, column: 1 }, areas)?.id).toBe('foyer')
    expect(getAreaForPosition({ row: 1, column: 0 }, areas)?.id).toBe('lounge')
    expect(getAreaForPosition({ row: 3, column: 3 }, areas)).toBeUndefined()
  })

  it('detects blocked object cells and computes valid placements', () => {
    expect(isCellBlockedByObject({ row: 2, column: 2 }, objects)).toBe(true)
    expect(isCellBlockedByObject({ row: 0, column: 0 }, objects)).toBe(false)

    const validCells = getValidPlacementCells(grid, objects)
    expect(validCells).toHaveLength(15) // 16 - 1 blocked
    expect(validCells).not.toContainEqual({ row: 2, column: 2 })
  })

  it('encodes and decodes positions', () => {
    const pos = { row: 3, column: 5 }
    const key = encodePosition(pos)
    expect(key).toBe('3,5')
    expect(decodePosition(key)).toEqual(pos)
  })
})
