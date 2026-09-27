/**
 * CaseGrid Puzzle Engine - Domain Types
 * Framework-independent TypeScript domain definitions.
 */

export interface Position {
  readonly row: number
  readonly column: number
}

export interface GridDefinition {
  readonly width: number
  readonly height: number
}

export interface Area {
  readonly id: string
  readonly name: string
  readonly cells: readonly Position[]
}

export interface MapObject {
  readonly id: string
  readonly type: string
  readonly label?: string
  readonly position: Position
}

export type CharacterRole = 'suspect' | 'victim'

export interface Character {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly role: CharacterRole
  readonly avatar?: string
}

export type PuzzleDifficulty =
  | 'beginner'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'expert'

// Discriminated union of structured constraints
export type ConstraintType =
  | 'character_in_area'
  | 'character_not_in_area'
  | 'character_at_position'
  | 'character_in_row'
  | 'character_in_column'
  | 'character_adjacent_to_character'
  | 'character_not_adjacent_to_character'
  | 'character_adjacent_to_object'
  | 'character_not_adjacent_to_object'
  | 'characters_same_area'
  | 'characters_different_area'
  | 'character_alone_in_area'
  | 'exactly_n_characters_in_area'

export interface CharacterInAreaConstraint {
  readonly type: 'character_in_area'
  readonly characterId: string
  readonly areaId: string
}

export interface CharacterNotInAreaConstraint {
  readonly type: 'character_not_in_area'
  readonly characterId: string
  readonly areaId: string
}

export interface CharacterAtPositionConstraint {
  readonly type: 'character_at_position'
  readonly characterId: string
  readonly position: Position
}

export interface CharacterInRowConstraint {
  readonly type: 'character_in_row'
  readonly characterId: string
  readonly row: number
}

export interface CharacterInColumnConstraint {
  readonly type: 'character_in_column'
  readonly characterId: string
  readonly column: number
}

export interface CharacterAdjacentToCharacterConstraint {
  readonly type: 'character_adjacent_to_character'
  readonly characterId: string
  readonly targetCharacterId: string
}

export interface CharacterNotAdjacentToCharacterConstraint {
  readonly type: 'character_not_adjacent_to_character'
  readonly characterId: string
  readonly targetCharacterId: string
}

export interface CharacterAdjacentToObjectConstraint {
  readonly type: 'character_adjacent_to_object'
  readonly characterId: string
  readonly objectId: string
}

export interface CharacterNotAdjacentToObjectConstraint {
  readonly type: 'character_not_adjacent_to_object'
  readonly characterId: string
  readonly objectId: string
}

export interface CharactersSameAreaConstraint {
  readonly type: 'characters_same_area'
  readonly characterId: string
  readonly targetCharacterId: string
}

export interface CharactersDifferentAreaConstraint {
  readonly type: 'characters_different_area'
  readonly characterId: string
  readonly targetCharacterId: string
}

export interface CharacterAloneInAreaConstraint {
  readonly type: 'character_alone_in_area'
  readonly characterId: string
}

export interface ExactlyNCharactersInAreaConstraint {
  readonly type: 'exactly_n_characters_in_area'
  readonly areaId: string
  readonly count: number
}

export type Constraint =
  | CharacterInAreaConstraint
  | CharacterNotInAreaConstraint
  | CharacterAtPositionConstraint
  | CharacterInRowConstraint
  | CharacterInColumnConstraint
  | CharacterAdjacentToCharacterConstraint
  | CharacterNotAdjacentToCharacterConstraint
  | CharacterAdjacentToObjectConstraint
  | CharacterNotAdjacentToObjectConstraint
  | CharactersSameAreaConstraint
  | CharactersDifferentAreaConstraint
  | CharacterAloneInAreaConstraint
  | ExactlyNCharactersInAreaConstraint

export interface Clue {
  readonly id: string
  readonly text: string
  readonly constraint: Constraint
}

export interface PuzzleSolution {
  readonly placements: Readonly<Record<string, Position>>
  readonly murdererId: string
}

export interface Puzzle {
  readonly id: string
  readonly title: string
  readonly subtitle?: string
  readonly description: string
  readonly difficulty: PuzzleDifficulty
  readonly grid: GridDefinition
  readonly areas: readonly Area[]
  readonly objects: readonly MapObject[]
  readonly characters: readonly Character[]
  readonly clues: readonly Clue[]
  readonly victimId: string
  readonly solution: PuzzleSolution
}

export interface PuzzleMetadata {
  readonly id: string
  readonly title: string
  readonly subtitle?: string
  readonly description?: string
  readonly difficulty: PuzzleDifficulty
  readonly suspectCount: number
  readonly victimName?: string
  readonly availability?: 'available' | 'coming-soon'
}

export type PuzzleStatus = 'not-started' | 'in-progress' | 'completed'

export interface PuzzleProgress {
  readonly puzzleId: string
  readonly status: PuzzleStatus
  readonly placements: Readonly<Record<string, Position>>
  readonly exclusions: Readonly<Record<string, readonly Position[]>>
  readonly solvedClueIds: readonly string[]
  readonly elapsedSeconds: number
  readonly mistakes: number
  readonly bestTime?: number
}

export interface SolveResult {
  readonly solutionCount: number
  readonly solution?: PuzzleSolution
  readonly isUnique: boolean
}

export interface ValidationIssue {
  readonly code: string
  readonly message: string
  readonly path?: readonly (string | number)[]
}

export interface ValidationResult {
  readonly valid: boolean
  readonly errors: readonly ValidationIssue[]
  readonly solveResult?: SolveResult
}
