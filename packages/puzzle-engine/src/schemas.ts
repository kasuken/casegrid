/**
 * CaseGrid Puzzle Engine - Zod Schemas
 * Runtime validation for puzzle data, progress, and metadata.
 */

import { z } from 'zod'

export const positionSchema = z.object({
  row: z.number().int().min(0, { message: 'Row must be a non-negative integer' }),
  column: z.number().int().min(0, { message: 'Column must be a non-negative integer' }),
})

export const gridDefinitionSchema = z.object({
  width: z.number().int().min(1, { message: 'Grid width must be at least 1' }),
  height: z.number().int().min(1, { message: 'Grid height must be at least 1' }),
})

export const areaSchema = z.object({
  id: z.string().min(1, { message: 'Area id cannot be empty' }),
  name: z.string().min(1, { message: 'Area name cannot be empty' }),
  cells: z.array(positionSchema).min(1, { message: 'Area must have at least one cell' }),
})

export const mapObjectSchema = z.object({
  id: z.string().min(1, { message: 'Object id cannot be empty' }),
  type: z.string().min(1, { message: 'Object type cannot be empty' }),
  label: z.string().optional(),
  position: positionSchema,
})

export const characterRoleSchema = z.enum(['suspect', 'victim'])

export const characterSchema = z.object({
  id: z.string().min(1, { message: 'Character id cannot be empty' }),
  name: z.string().min(1, { message: 'Character name cannot be empty' }),
  description: z.string().optional(),
  role: characterRoleSchema,
  avatar: z.string().optional(),
})

export const puzzleDifficultySchema = z.enum([
  'beginner',
  'easy',
  'medium',
  'hard',
  'expert',
])

export const characterInAreaConstraintSchema = z.object({
  type: z.literal('character_in_area'),
  characterId: z.string().min(1),
  areaId: z.string().min(1),
})

export const characterNotInAreaConstraintSchema = z.object({
  type: z.literal('character_not_in_area'),
  characterId: z.string().min(1),
  areaId: z.string().min(1),
})

export const characterAtPositionConstraintSchema = z.object({
  type: z.literal('character_at_position'),
  characterId: z.string().min(1),
  position: positionSchema,
})

export const characterInRowConstraintSchema = z.object({
  type: z.literal('character_in_row'),
  characterId: z.string().min(1),
  row: z.number().int().min(0),
})

export const characterInColumnConstraintSchema = z.object({
  type: z.literal('character_in_column'),
  characterId: z.string().min(1),
  column: z.number().int().min(0),
})

export const characterAdjacentToCharacterConstraintSchema = z.object({
  type: z.literal('character_adjacent_to_character'),
  characterId: z.string().min(1),
  targetCharacterId: z.string().min(1),
})

export const characterNotAdjacentToCharacterConstraintSchema = z.object({
  type: z.literal('character_not_adjacent_to_character'),
  characterId: z.string().min(1),
  targetCharacterId: z.string().min(1),
})

export const characterAdjacentToObjectConstraintSchema = z.object({
  type: z.literal('character_adjacent_to_object'),
  characterId: z.string().min(1),
  objectId: z.string().min(1),
})

export const characterNotAdjacentToObjectConstraintSchema = z.object({
  type: z.literal('character_not_adjacent_to_object'),
  characterId: z.string().min(1),
  objectId: z.string().min(1),
})

export const charactersSameAreaConstraintSchema = z.object({
  type: z.literal('characters_same_area'),
  characterId: z.string().min(1),
  targetCharacterId: z.string().min(1),
})

export const charactersDifferentAreaConstraintSchema = z.object({
  type: z.literal('characters_different_area'),
  characterId: z.string().min(1),
  targetCharacterId: z.string().min(1),
})

export const characterAloneInAreaConstraintSchema = z.object({
  type: z.literal('character_alone_in_area'),
  characterId: z.string().min(1),
})

export const exactlyNCharactersInAreaConstraintSchema = z.object({
  type: z.literal('exactly_n_characters_in_area'),
  areaId: z.string().min(1),
  count: z.number().int().min(0),
})

export const constraintSchema = z.discriminatedUnion('type', [
  characterInAreaConstraintSchema,
  characterNotInAreaConstraintSchema,
  characterAtPositionConstraintSchema,
  characterInRowConstraintSchema,
  characterInColumnConstraintSchema,
  characterAdjacentToCharacterConstraintSchema,
  characterNotAdjacentToCharacterConstraintSchema,
  characterAdjacentToObjectConstraintSchema,
  characterNotAdjacentToObjectConstraintSchema,
  charactersSameAreaConstraintSchema,
  charactersDifferentAreaConstraintSchema,
  characterAloneInAreaConstraintSchema,
  exactlyNCharactersInAreaConstraintSchema,
])

export const clueSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  constraint: constraintSchema,
})

export const puzzleSolutionSchema = z.object({
  placements: z.record(z.string(), positionSchema),
  murdererId: z.string().min(1),
})

export const deductionStepSchema = z.object({
  text: z.string().min(1),
  clueIds: z.array(z.string().min(1)),
})

export const helpPromptSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  clueIds: z.array(z.string().min(1)),
})

export const tutorialStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
  advanceOn: z.enum(['manual', 'select', 'place', 'exclude', 'clue']),
})

export const puzzleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().min(1),
  difficulty: puzzleDifficultySchema,
  grid: gridDefinitionSchema,
  areas: z.array(areaSchema),
  objects: z.array(mapObjectSchema),
  characters: z.array(characterSchema).min(2, { message: 'Must have at least 2 characters' }),
  clues: z.array(clueSchema),
  victimId: z.string().min(1),
  solution: puzzleSolutionSchema,
  resolution: z.string().min(1).optional(),
  deductions: z.array(deductionStepSchema).optional(),
  helpPrompts: z.array(helpPromptSchema).optional(),
  tutorial: z.array(tutorialStepSchema).optional(),
})

export const puzzleMetadataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  difficulty: puzzleDifficultySchema,
  suspectCount: z.number().int().min(1),
  victimName: z.string().optional(),
  availability: z.enum(['available', 'coming-soon']).optional(),
})

export const puzzleIndexSchema = z.array(puzzleMetadataSchema)

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Week start must be YYYY-MM-DD' })

export const weeklyScheduleSchema = z.object({
  weeks: z.array(
    z.object({
      weekStart: isoDate,
      caseId: z.string().min(1),
    }),
  ),
})

export const puzzleStatusSchema = z.enum(['not-started', 'in-progress', 'completed'])

export const puzzleProgressSchema = z.object({
  puzzleId: z.string().min(1),
  status: puzzleStatusSchema,
  placements: z.record(z.string(), positionSchema),
  exclusions: z.record(z.string(), z.array(positionSchema)),
  solvedClueIds: z.array(z.string()),
  elapsedSeconds: z.number().min(0),
  mistakes: z.number().int().min(0),
  bestTime: z.number().min(0).optional(),
  revealedHelpIds: z.array(z.string()).optional(),
  updatedAt: z.number().min(0).optional(),
})
