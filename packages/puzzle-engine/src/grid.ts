/**
 * CaseGrid Puzzle Engine - Grid Utilities
 * Pure functions for positions, adjacency, bounds, and areas.
 */

import type { Area, GridDefinition, MapObject, Position } from './types.ts'

export function encodePosition(pos: Position): string {
  return `${pos.row},${pos.column}`
}

export function decodePosition(key: string): Position {
  const [rowStr, colStr] = key.split(',')
  return {
    row: Number.parseInt(rowStr, 10),
    column: Number.parseInt(colStr, 10),
  }
}

export function isPositionEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.column === b.column
}

export function isPositionWithinBounds(pos: Position, grid: GridDefinition): boolean {
  return (
    pos.row >= 0 &&
    pos.row < grid.height &&
    pos.column >= 0 &&
    pos.column < grid.width
  )
}

/**
 * Adjacency is orthogonal only (horizontal or vertical).
 * Diagonals are strictly NOT adjacent.
 */
export function arePositionsAdjacent(a: Position, b: Position): boolean {
  const rowDiff = Math.abs(a.row - b.row)
  const colDiff = Math.abs(a.column - b.column)
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
}

export function getOrthogonalNeighbors(pos: Position, grid?: GridDefinition): Position[] {
  const candidates: Position[] = [
    { row: pos.row - 1, column: pos.column },
    { row: pos.row + 1, column: pos.column },
    { row: pos.row, column: pos.column - 1 },
    { row: pos.row, column: pos.column + 1 },
  ]

  if (!grid) {
    return candidates
  }

  return candidates.filter((c) => isPositionWithinBounds(c, grid))
}

export function getAreaForPosition(
  pos: Position,
  areas: readonly Area[],
): Area | undefined {
  return areas.find((area) =>
    area.cells.some((cell) => isPositionEqual(cell, pos)),
  )
}

export function isCellInArea(pos: Position, area: Area): boolean {
  return area.cells.some((cell) => isPositionEqual(cell, pos))
}

export function getBlockedObjectPositions(
  objects: readonly MapObject[],
): Position[] {
  return objects.map((obj) => obj.position)
}

export function isCellBlockedByObject(
  pos: Position,
  objects: readonly MapObject[],
): boolean {
  return objects.some((obj) => isPositionEqual(obj.position, pos))
}

export function getAllGridPositions(grid: GridDefinition): Position[] {
  const positions: Position[] = []
  for (let r = 0; r < grid.height; r++) {
    for (let c = 0; c < grid.width; c++) {
      positions.push({ row: r, column: c })
    }
  }
  return positions
}

export function getValidPlacementCells(
  grid: GridDefinition,
  objects: readonly MapObject[],
): Position[] {
  const allPositions = getAllGridPositions(grid)
  return allPositions.filter((pos) => !isCellBlockedByObject(pos, objects))
}
