import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePuzzle } from '../src/validator.ts'
import type { Area, Clue, MapObject, Position, Puzzle, Character } from '../src/types.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const puzzlesDir = path.resolve(__dirname, '../../../apps/web/public/puzzles')

function makeRectArea(id: string, name: string, r1: number, r2: number, c1: number, c2: number): Area {
  const cells: Position[] = []
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      cells.push({ row: r, column: c })
    }
  }
  return { id, name, cells }
}

const standardAreas = (names: [string, string, string, string], ids: [string, string, string, string]): Area[] => [
  makeRectArea(ids[0], names[0], 0, 2, 0, 2),
  makeRectArea(ids[1], names[1], 0, 2, 3, 5),
  makeRectArea(ids[2], names[2], 3, 5, 0, 2),
  makeRectArea(ids[3], names[3], 3, 5, 3, 5),
]

interface CaseDef {
  id: string
  title: string
  subtitle: string
  description: string
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'
  areas: Area[]
  objects: MapObject[]
  characters: Character[]
  clues: Clue[]
  victimId: string
  solution: {
    placements: Record<string, Position>
    murdererId: string
  }
}

const cases: CaseDef[] = [
  // CASE 006: The Whispering Cloister (beginner)
  {
    id: 'case-006',
    title: 'The Whispering Cloister',
    subtitle: 'A silent abbey broken by a midnight confession',
    description: "Abbot Augustine was found poisoned in the Chapter House of Saint Jude's Abbey. Five monks and visitors were scattered across the cloister quadrangle. Deduce everyone's location and discover who was alone with Abbot Augustine.",
    difficulty: 'beginner',
    areas: standardAreas(
      ['Chapter House', 'Scriptorium', 'Herb Garden', 'Refectory'],
      ['chapter_house', 'scriptorium', 'herb_garden', 'refectory']
    ),
    objects: [
      { id: 'altar', type: 'desk', label: 'Stone Altar', position: { row: 1, column: 1 } },
      { id: 'lectern', type: 'bookshelf', label: 'Illuminated Lectern', position: { row: 1, column: 4 } },
      { id: 'well', type: 'fountain', label: 'Abbey Well', position: { row: 4, column: 1 } },
      { id: 'hearth', type: 'fireplace', label: 'Refectory Hearth', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'augustine', name: 'Abbot Augustine', role: 'victim', description: "The strict abbot of Saint Jude's." },
      { id: 'bernard', name: 'Brother Bernard', role: 'suspect', description: 'The ambitious cellarer managing finances.' },
      { id: 'thomas', name: 'Brother Thomas', role: 'suspect', description: 'A quiet manuscript illuminator.' },
      { id: 'beatrice', name: 'Sister Beatrice', role: 'suspect', description: 'A visiting herbalist from the convent.' },
      { id: 'anselm', name: 'Father Anselm', role: 'suspect', description: 'An elderly Latin translator.' },
      { id: 'stephen', name: 'Prior Stephen', role: 'suspect', description: 'The second-in-command awaiting succession.' },
    ],
    clues: [
      { id: 'c6-1', text: 'Abbot Augustine was seated at row 0, column 1 near the altar.', constraint: { type: 'character_at_position', characterId: 'augustine', position: { row: 0, column: 1 } } },
      { id: 'c6-2', text: 'Brother Bernard was in the Chapter House.', constraint: { type: 'character_in_area', characterId: 'bernard', areaId: 'chapter_house' } },
      { id: 'c6-3', text: 'Brother Bernard was standing directly beside Abbot Augustine.', constraint: { type: 'character_adjacent_to_character', characterId: 'bernard', targetCharacterId: 'augustine' } },
      { id: 'c6-4', text: 'Brother Bernard was in column 0.', constraint: { type: 'character_in_column', characterId: 'bernard', column: 0 } },
      { id: 'c6-5', text: 'Brother Thomas and Father Anselm were both working in the Scriptorium.', constraint: { type: 'characters_same_area', characterId: 'thomas', targetCharacterId: 'anselm' } },
      { id: 'c6-6', text: 'Brother Thomas was in the Scriptorium.', constraint: { type: 'character_in_area', characterId: 'thomas', areaId: 'scriptorium' } },
      { id: 'c6-7', text: 'Brother Thomas stood directly beside the Illuminated Lectern.', constraint: { type: 'character_adjacent_to_object', characterId: 'thomas', objectId: 'lectern' } },
      { id: 'c6-8', text: 'Brother Thomas was in row 0.', constraint: { type: 'character_in_row', characterId: 'thomas', row: 0 } },
      { id: 'c6-9', text: 'Father Anselm stood directly beside the Illuminated Lectern.', constraint: { type: 'character_adjacent_to_object', characterId: 'anselm', objectId: 'lectern' } },
      { id: 'c6-10', text: 'Father Anselm was in column 3.', constraint: { type: 'character_in_column', characterId: 'anselm', column: 3 } },
      { id: 'c6-11', text: 'Sister Beatrice was the only person in the Herb Garden.', constraint: { type: 'character_alone_in_area', characterId: 'beatrice' } },
      { id: 'c6-12', text: 'Sister Beatrice was in the Herb Garden.', constraint: { type: 'character_in_area', characterId: 'beatrice', areaId: 'herb_garden' } },
      { id: 'c6-13', text: 'Sister Beatrice stood directly beside the Abbey Well.', constraint: { type: 'character_adjacent_to_object', characterId: 'beatrice', objectId: 'well' } },
      { id: 'c6-14', text: 'Sister Beatrice was in column 0.', constraint: { type: 'character_in_column', characterId: 'beatrice', column: 0 } },
      { id: 'c6-15', text: 'Prior Stephen was the only person in the Refectory.', constraint: { type: 'character_alone_in_area', characterId: 'stephen' } },
      { id: 'c6-16', text: 'Prior Stephen was in the Refectory.', constraint: { type: 'character_in_area', characterId: 'stephen', areaId: 'refectory' } },
      { id: 'c6-17', text: 'Prior Stephen stood directly beside the Refectory Hearth.', constraint: { type: 'character_adjacent_to_object', characterId: 'stephen', objectId: 'hearth' } },
      { id: 'c6-18', text: 'Prior Stephen was in column 3.', constraint: { type: 'character_in_column', characterId: 'stephen', column: 3 } },
    ],
    victimId: 'augustine',
    solution: {
      placements: {
        augustine: { row: 0, column: 1 },
        bernard: { row: 0, column: 0 },
        thomas: { row: 0, column: 4 },
        anselm: { row: 1, column: 3 },
        beatrice: { row: 4, column: 0 },
        stephen: { row: 4, column: 3 },
      },
      murdererId: 'bernard',
    },
  },

  // CASE 007: The Botanical Conservatory (beginner)
  {
    id: 'case-007',
    title: 'The Botanical Conservatory',
    subtitle: 'Poison among the rare orchids',
    description: "Sir Humphrey Vance was found dead in the tropical palm house before the royal exhibition. Five botanists and patrons were exploring the botanical gardens. Deduce everyone's location and discover who was alone with Sir Humphrey.",
    difficulty: 'beginner',
    areas: standardAreas(
      ['Palm House', 'Fern Grotto', 'Rose Parterre', 'Bonsai Pavilion'],
      ['palm_house', 'fern_grotto', 'rose_parterre', 'bonsai_pavilion']
    ),
    objects: [
      { id: 'iron_fountain', type: 'fountain', label: 'Cast Iron Fountain', position: { row: 1, column: 1 } },
      { id: 'waterfall', type: 'display_case', label: 'Grotto Pool', position: { row: 1, column: 4 } },
      { id: 'stone_sundial', type: 'clock', label: 'Stone Sundial', position: { row: 4, column: 1 } },
      { id: 'marble_bench', type: 'couch', label: 'Marble Bench', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'humphrey', name: 'Sir Humphrey Vance', role: 'victim', description: 'Director of the Royal Botanic Gardens.' },
      { id: 'florence', name: 'Florence Croft', role: 'suspect', description: 'An ambitious orchid specialist passed over for promotion.' },
      { id: 'basil', name: 'Dr. Basil Thorn', role: 'suspect', description: 'A poisonous plant researcher with secretive habits.' },
      { id: 'dahlia', name: 'Lady Dahlia Sterling', role: 'suspect', description: 'A wealthy patron of exotic flora.' },
      { id: 'arthur_b', name: 'Arthur Finch', role: 'suspect', description: 'The senior landscape designer.' },
      { id: 'clara_h', name: 'Clara Hayes', role: 'suspect', description: 'The head greenhouse caretaker.' },
    ],
    clues: [
      { id: 'c7-1', text: 'Sir Humphrey was seated at row 0, column 1 admiring the imperial orchids.', constraint: { type: 'character_at_position', characterId: 'humphrey', position: { row: 0, column: 1 } } },
      { id: 'c7-2', text: 'Florence was in the Palm House.', constraint: { type: 'character_in_area', characterId: 'florence', areaId: 'palm_house' } },
      { id: 'c7-3', text: 'Florence was directly adjacent to Sir Humphrey.', constraint: { type: 'character_adjacent_to_character', characterId: 'florence', targetCharacterId: 'humphrey' } },
      { id: 'c7-4', text: 'Florence was in column 0.', constraint: { type: 'character_in_column', characterId: 'florence', column: 0 } },
      { id: 'c7-5', text: 'Dr. Basil Thorn and Lady Dahlia were both exploring the Fern Grotto.', constraint: { type: 'characters_same_area', characterId: 'basil', targetCharacterId: 'dahlia' } },
      { id: 'c7-6', text: 'Dr. Basil Thorn was in the Fern Grotto.', constraint: { type: 'character_in_area', characterId: 'basil', areaId: 'fern_grotto' } },
      { id: 'c7-7', text: 'Basil stood directly beside the Grotto Pool.', constraint: { type: 'character_adjacent_to_object', characterId: 'basil', objectId: 'waterfall' } },
      { id: 'c7-8', text: 'Basil was in row 0.', constraint: { type: 'character_in_row', characterId: 'basil', row: 0 } },
      { id: 'c7-9', text: 'Lady Dahlia stood directly beside the Grotto Pool.', constraint: { type: 'character_adjacent_to_object', characterId: 'dahlia', objectId: 'waterfall' } },
      { id: 'c7-10', text: 'Lady Dahlia was in column 5.', constraint: { type: 'character_in_column', characterId: 'dahlia', column: 5 } },
      { id: 'c7-11', text: 'Arthur Finch was the only person in the Rose Parterre.', constraint: { type: 'character_alone_in_area', characterId: 'arthur_b' } },
      { id: 'c7-12', text: 'Arthur Finch was in the Rose Parterre.', constraint: { type: 'character_in_area', characterId: 'arthur_b', areaId: 'rose_parterre' } },
      { id: 'c7-13', text: 'Arthur stood directly beside the Stone Sundial.', constraint: { type: 'character_adjacent_to_object', characterId: 'arthur_b', objectId: 'stone_sundial' } },
      { id: 'c7-14', text: 'Arthur was in column 0.', constraint: { type: 'character_in_column', characterId: 'arthur_b', column: 0 } },
      { id: 'c7-15', text: 'Clara Hayes was the only person in the Bonsai Pavilion.', constraint: { type: 'character_alone_in_area', characterId: 'clara_h' } },
      { id: 'c7-16', text: 'Clara Hayes was in the Bonsai Pavilion.', constraint: { type: 'character_in_area', characterId: 'clara_h', areaId: 'bonsai_pavilion' } },
      { id: 'c7-17', text: 'Clara stood directly beside the Marble Bench.', constraint: { type: 'character_adjacent_to_object', characterId: 'clara_h', objectId: 'marble_bench' } },
      { id: 'c7-18', text: 'Clara was in row 3.', constraint: { type: 'character_in_row', characterId: 'clara_h', row: 3 } },
    ],
    victimId: 'humphrey',
    solution: {
      placements: {
        humphrey: { row: 0, column: 1 },
        florence: { row: 0, column: 0 },
        basil: { row: 0, column: 4 },
        dahlia: { row: 1, column: 5 },
        arthur_b: { row: 4, column: 0 },
        clara_h: { row: 3, column: 4 },
      },
      murdererId: 'florence',
    },
  },

  // CASE 008: The Gilded Casino (easy)
  {
    id: 'case-008',
    title: 'The Gilded Casino',
    subtitle: 'A high-stakes gamble that ended in murder',
    description: "Baron Montefiore collapsed over his champagne in the High Limit Salon. Five players and staff were scattered across the private gaming floor. Deduce everyone's location and discover who was alone with the Baron.",
    difficulty: 'easy',
    areas: standardAreas(
      ['High Limit Salon', 'Roulette Wing', 'Baccarat Lounge', 'Cashier Vault'],
      ['high_limit', 'roulette_wing', 'baccarat_lounge', 'cashier_vault']
    ),
    objects: [
      { id: 'poker_table', type: 'billiard_table', label: 'Velvet Poker Table', position: { row: 1, column: 1 } },
      { id: 'roulette_wheel', type: 'clock', label: 'Mahogany Wheel', position: { row: 1, column: 4 } },
      { id: 'bar_counter', type: 'desk', label: 'Marble Bar', position: { row: 4, column: 1 } },
      { id: 'iron_safe', type: 'safe', label: 'Reinforced Safe', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'montefiore', name: 'Baron Montefiore', role: 'victim', description: 'A lavish nobleman burdened with clandestine debts.' },
      { id: 'nadia_c', name: 'Countess Nadia', role: 'suspect', description: 'A sharp-witted card counter who lost a fortune to the Baron.' },
      { id: 'luc', name: 'Luc Duvall', role: 'suspect', description: 'The discreet head croupier.' },
      { id: 'orlov', name: 'General Orlov', role: 'suspect', description: 'A decorated officer nursing his cognac.' },
      { id: 'vanessa', name: 'Vanessa Valmont', role: 'suspect', description: 'A glamorous lounge singer with eagle eyes.' },
      { id: 'vance_det', name: 'Inspector Vance', role: 'suspect', description: 'An off-duty detective watching the tables.' },
    ],
    clues: [
      { id: 'c8-1', text: 'Baron Montefiore was sitting at row 0, column 1.', constraint: { type: 'character_at_position', characterId: 'montefiore', position: { row: 0, column: 1 } } },
      { id: 'c8-2', text: 'Countess Nadia was in the High Limit Salon.', constraint: { type: 'character_in_area', characterId: 'nadia_c', areaId: 'high_limit' } },
      { id: 'c8-3', text: 'Countess Nadia was directly adjacent to Baron Montefiore.', constraint: { type: 'character_adjacent_to_character', characterId: 'nadia_c', targetCharacterId: 'montefiore' } },
      { id: 'c8-4', text: 'Countess Nadia was in column 2.', constraint: { type: 'character_in_column', characterId: 'nadia_c', column: 2 } },
      { id: 'c8-5', text: 'Luc Duvall and General Orlov were both in the Roulette Wing.', constraint: { type: 'characters_same_area', characterId: 'luc', targetCharacterId: 'orlov' } },
      { id: 'c8-6', text: 'Luc Duvall was in the Roulette Wing.', constraint: { type: 'character_in_area', characterId: 'luc', areaId: 'roulette_wing' } },
      { id: 'c8-7', text: 'Luc stood directly beside the Mahogany Wheel.', constraint: { type: 'character_adjacent_to_object', characterId: 'luc', objectId: 'roulette_wheel' } },
      { id: 'c8-8', text: 'Luc was in row 0.', constraint: { type: 'character_in_row', characterId: 'luc', row: 0 } },
      { id: 'c8-9', text: 'General Orlov stood directly beside the Mahogany Wheel.', constraint: { type: 'character_adjacent_to_object', characterId: 'orlov', objectId: 'roulette_wheel' } },
      { id: 'c8-10', text: 'General Orlov was in column 3.', constraint: { type: 'character_in_column', characterId: 'orlov', column: 3 } },
      { id: 'c8-11', text: 'Vanessa Valmont was the only person in the Baccarat Lounge.', constraint: { type: 'character_alone_in_area', characterId: 'vanessa' } },
      { id: 'c8-12', text: 'Vanessa was in the Baccarat Lounge.', constraint: { type: 'character_in_area', characterId: 'vanessa', areaId: 'baccarat_lounge' } },
      { id: 'c8-13', text: 'Vanessa stood directly beside the Marble Bar.', constraint: { type: 'character_adjacent_to_object', characterId: 'vanessa', objectId: 'bar_counter' } },
      { id: 'c8-14', text: 'Vanessa was in column 0.', constraint: { type: 'character_in_column', characterId: 'vanessa', column: 0 } },
      { id: 'c8-15', text: 'Inspector Vance was the only person in the Cashier Vault.', constraint: { type: 'character_alone_in_area', characterId: 'vance_det' } },
      { id: 'c8-16', text: 'Inspector Vance was in the Cashier Vault.', constraint: { type: 'character_in_area', characterId: 'vance_det', areaId: 'cashier_vault' } },
      { id: 'c8-17', text: 'Inspector Vance stood directly beside the Reinforced Safe.', constraint: { type: 'character_adjacent_to_object', characterId: 'vance_det', objectId: 'iron_safe' } },
      { id: 'c8-18', text: 'Inspector Vance was in row 3.', constraint: { type: 'character_in_row', characterId: 'vance_det', row: 3 } },
    ],
    victimId: 'montefiore',
    solution: {
      placements: {
        montefiore: { row: 0, column: 1 },
        nadia_c: { row: 0, column: 2 },
        luc: { row: 0, column: 4 },
        orlov: { row: 1, column: 3 },
        vanessa: { row: 4, column: 0 },
        vance_det: { row: 3, column: 4 },
      },
      murdererId: 'nadia_c',
    },
  },

  // CASE 009: The Clockwork Workshop (easy)
  {
    id: 'case-009',
    title: 'The Clockwork Workshop',
    subtitle: 'Chimes at midnight, silence at dawn',
    description: "Master Horologist Elias Vance was found dead inside his private Gear Vault. Five associates and apprentices were scattered across the workshop floors. Deduce everyone's location and discover who was alone with Master Vance.",
    difficulty: 'easy',
    areas: standardAreas(
      ['Gear Vault', 'Assembly Hall', 'Furnace Room', 'Drafting Studio'],
      ['gear_vault', 'assembly_hall', 'furnace_room', 'drafting_studio']
    ),
    objects: [
      { id: 'master_clock', type: 'clock', label: 'Grand Astronomical Clock', position: { row: 1, column: 1 } },
      { id: 'workbench', type: 'desk', label: 'Jeweler Workbench', position: { row: 1, column: 4 } },
      { id: 'smelting_kiln', type: 'fireplace', label: 'Brass Furnace', position: { row: 4, column: 1 } },
      { id: 'drafting_table', type: 'bookshelf', label: 'Blueprint Table', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'elias', name: 'Elias Vance', role: 'victim', description: 'Master clockmaker renowned across the continent.' },
      { id: 'tobias', name: 'Tobias Webb', role: 'suspect', description: 'A disgruntled rival horologist.' },
      { id: 'nora', name: 'Nora Sterling', role: 'suspect', description: "Elias's gifted but overlooked daughter." },
      { id: 'leo', name: 'Leo Baxter', role: 'suspect', description: 'The nervous first-year apprentice.' },
      { id: 'croft', name: 'Inspector Croft', role: 'suspect', description: 'A city official inquiring about municipal contracts.' },
      { id: 'brigitte', name: 'Madame Brigitte', role: 'suspect', description: 'A wealthy patron awaiting her bespoke chronometer.' },
    ],
    clues: [
      { id: 'c9-1', text: 'Elias Vance was inspecting gears at row 0, column 1.', constraint: { type: 'character_at_position', characterId: 'elias', position: { row: 0, column: 1 } } },
      { id: 'c9-2', text: 'Tobias Webb was in the Gear Vault.', constraint: { type: 'character_in_area', characterId: 'tobias', areaId: 'gear_vault' } },
      { id: 'c9-3', text: 'Tobias Webb stood directly adjacent to the Grand Astronomical Clock.', constraint: { type: 'character_adjacent_to_object', characterId: 'tobias', objectId: 'master_clock' } },
      { id: 'c9-4', text: 'Tobias was in column 0.', constraint: { type: 'character_in_column', characterId: 'tobias', column: 0 } },
      { id: 'c9-5', text: 'Nora Sterling and Leo Baxter were both working in the Assembly Hall.', constraint: { type: 'characters_same_area', characterId: 'nora', targetCharacterId: 'leo' } },
      { id: 'c9-6', text: 'Nora was in the Assembly Hall.', constraint: { type: 'character_in_area', characterId: 'nora', areaId: 'assembly_hall' } },
      { id: 'c9-7', text: 'Nora stood directly beside the Jeweler Workbench.', constraint: { type: 'character_adjacent_to_object', characterId: 'nora', objectId: 'workbench' } },
      { id: 'c9-8', text: 'Nora was in row 0.', constraint: { type: 'character_in_row', characterId: 'nora', row: 0 } },
      { id: 'c9-9', text: 'Leo Baxter was in the Assembly Hall.', constraint: { type: 'character_in_area', characterId: 'leo', areaId: 'assembly_hall' } },
      { id: 'c9-10', text: 'Leo stood directly beside the Jeweler Workbench.', constraint: { type: 'character_adjacent_to_object', characterId: 'leo', objectId: 'workbench' } },
      { id: 'c9-11', text: 'Leo was in column 5.', constraint: { type: 'character_in_column', characterId: 'leo', column: 5 } },
      { id: 'c9-12', text: 'Inspector Croft was the only person in the Furnace Room.', constraint: { type: 'character_alone_in_area', characterId: 'croft' } },
      { id: 'c9-13', text: 'Inspector Croft was in the Furnace Room.', constraint: { type: 'character_in_area', characterId: 'croft', areaId: 'furnace_room' } },
      { id: 'c9-14', text: 'Inspector Croft stood directly beside the Brass Furnace.', constraint: { type: 'character_adjacent_to_object', characterId: 'croft', objectId: 'smelting_kiln' } },
      { id: 'c9-15', text: 'Inspector Croft was in row 3.', constraint: { type: 'character_in_row', characterId: 'croft', row: 3 } },
      { id: 'c9-16', text: 'Madame Brigitte was the only person in the Drafting Studio.', constraint: { type: 'character_alone_in_area', characterId: 'brigitte' } },
      { id: 'c9-17', text: 'Madame Brigitte was in the Drafting Studio.', constraint: { type: 'character_in_area', characterId: 'brigitte', areaId: 'drafting_studio' } },
      { id: 'c9-18', text: 'Madame Brigitte stood directly beside the Blueprint Table.', constraint: { type: 'character_adjacent_to_object', characterId: 'brigitte', objectId: 'drafting_table' } },
      { id: 'c9-19', text: 'Madame Brigitte was in column 3.', constraint: { type: 'character_in_column', characterId: 'brigitte', column: 3 } },
    ],
    victimId: 'elias',
    solution: {
      placements: {
        elias: { row: 0, column: 1 },
        tobias: { row: 1, column: 0 },
        nora: { row: 0, column: 4 },
        leo: { row: 1, column: 5 },
        croft: { row: 3, column: 1 },
        brigitte: { row: 4, column: 3 },
      },
      murdererId: 'tobias',
    },
  },

  // CASE 010: The Nile Steamer (easy)
  {
    id: 'case-010',
    title: 'The Nile Steamer',
    subtitle: 'A royal cruise shadowed by murder',
    description: "Antiquarian Lord Sterling was discovered poisoned in the Pharaoh Suite aboard the S.S. Karnak. Five passengers and crew were scattered across the riverboat deck. Deduce everyone's location and discover who was alone with Lord Sterling.",
    difficulty: 'easy',
    areas: standardAreas(
      ['Pharaoh Suite', 'Observation Deck', 'Engine Casing', 'Saloon Lounge'],
      ['pharaoh_suite', 'observation_deck', 'engine_casing', 'saloon_lounge']
    ),
    objects: [
      { id: 'canopy_bed', type: 'couch', label: 'Gilded Divan', position: { row: 1, column: 1 } },
      { id: 'telescope', type: 'globe', label: 'Brass Telescope', position: { row: 1, column: 4 } },
      { id: 'paddle_shaft', type: 'steam_engine', label: 'Steam Boiler', position: { row: 4, column: 1 } },
      { id: 'gramophone', type: 'display_case', label: 'Mahogany Bar', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'sterling_lord', name: 'Lord Sterling', role: 'victim', description: 'Eccentric British collector of ancient relics.' },
      { id: 'farouk', name: 'Captain Farouk', role: 'suspect', description: 'The stern river captain harboring a family secret.' },
      { id: 'lady_margaret', name: 'Lady Margaret', role: 'suspect', description: 'A high-society traveler with a keen ear for gossip.' },
      { id: 'carter', name: 'Dr. Howard Carter', role: 'suspect', description: "A rival archaeologist eyeing Sterling's papyri." },
      { id: 'davies', name: 'Miss Evelyn Davies', role: 'suspect', description: "Lord Sterling's private secretary." },
      { id: 'tariq', name: 'Steward Tariq', role: 'suspect', description: 'The attentive cabin steward who served the evening tea.' },
    ],
    clues: [
      { id: 'c10-1', text: 'Lord Sterling was resting at row 1, column 0 in the Pharaoh Suite.', constraint: { type: 'character_at_position', characterId: 'sterling_lord', position: { row: 1, column: 0 } } },
      { id: 'c10-2', text: 'Captain Farouk was in the Pharaoh Suite.', constraint: { type: 'character_in_area', characterId: 'farouk', areaId: 'pharaoh_suite' } },
      { id: 'c10-3', text: 'Captain Farouk was directly adjacent to Lord Sterling.', constraint: { type: 'character_adjacent_to_character', characterId: 'farouk', targetCharacterId: 'sterling_lord' } },
      { id: 'c10-4', text: 'Captain Farouk was in row 0.', constraint: { type: 'character_in_row', characterId: 'farouk', row: 0 } },
      { id: 'c10-5', text: 'Lady Margaret and Dr. Carter were both on the Observation Deck.', constraint: { type: 'characters_same_area', characterId: 'lady_margaret', targetCharacterId: 'carter' } },
      { id: 'c10-6', text: 'Lady Margaret was on the Observation Deck.', constraint: { type: 'character_in_area', characterId: 'lady_margaret', areaId: 'observation_deck' } },
      { id: 'c10-7', text: 'Lady Margaret stood directly beside the Brass Telescope.', constraint: { type: 'character_adjacent_to_object', characterId: 'lady_margaret', objectId: 'telescope' } },
      { id: 'c10-8', text: 'Lady Margaret was in row 0.', constraint: { type: 'character_in_row', characterId: 'lady_margaret', row: 0 } },
      { id: 'c10-9', text: 'Dr. Carter was on the Observation Deck.', constraint: { type: 'character_in_area', characterId: 'carter', areaId: 'observation_deck' } },
      { id: 'c10-10', text: 'Dr. Carter stood directly beside the Brass Telescope.', constraint: { type: 'character_adjacent_to_object', characterId: 'carter', objectId: 'telescope' } },
      { id: 'c10-11', text: 'Dr. Carter was in column 5.', constraint: { type: 'character_in_column', characterId: 'carter', column: 5 } },
      { id: 'c10-12', text: 'Steward Tariq was the only person in the Engine Casing.', constraint: { type: 'character_alone_in_area', characterId: 'tariq' } },
      { id: 'c10-13', text: 'Steward Tariq was in the Engine Casing.', constraint: { type: 'character_in_area', characterId: 'tariq', areaId: 'engine_casing' } },
      { id: 'c10-14', text: 'Steward Tariq stood directly beside the Steam Boiler.', constraint: { type: 'character_adjacent_to_object', characterId: 'tariq', objectId: 'paddle_shaft' } },
      { id: 'c10-15', text: 'Steward Tariq was in row 3.', constraint: { type: 'character_in_row', characterId: 'tariq', row: 3 } },
      { id: 'c10-16', text: 'Miss Davies was the only person in the Saloon Lounge.', constraint: { type: 'character_alone_in_area', characterId: 'davies' } },
      { id: 'c10-17', text: 'Miss Davies was in the Saloon Lounge.', constraint: { type: 'character_in_area', characterId: 'davies', areaId: 'saloon_lounge' } },
      { id: 'c10-18', text: 'Miss Davies stood directly beside the Mahogany Bar.', constraint: { type: 'character_adjacent_to_object', characterId: 'davies', objectId: 'gramophone' } },
      { id: 'c10-19', text: 'Miss Davies was in column 5.', constraint: { type: 'character_in_column', characterId: 'davies', column: 5 } },
    ],
    victimId: 'sterling_lord',
    solution: {
      placements: {
        sterling_lord: { row: 1, column: 0 },
        farouk: { row: 0, column: 0 },
        lady_margaret: { row: 0, column: 4 },
        carter: { row: 1, column: 5 },
        tariq: { row: 3, column: 1 },
        davies: { row: 4, column: 5 },
      },
      murdererId: 'farouk',
    },
  },

  // CASE 011: The Alchemist's Laboratory (medium)
  {
    id: 'case-011',
    title: "The Alchemist's Laboratory",
    subtitle: 'Secrets turned to ashes in the crucible',
    description: "Master Alchemist Paracelsus Kane was found poisoned in the Transmutation Chamber. Five guild members and scholars were trapped inside the fortified laboratory. Deduce everyone's location and discover who was alone with Master Kane.",
    difficulty: 'medium',
    areas: standardAreas(
      ['Transmutation Chamber', 'Distillery Wing', 'Arcane Library', 'Furnace Vault'],
      ['transmutation', 'distillery', 'arcane_library', 'furnace_vault']
    ),
    objects: [
      { id: 'great_athanor', type: 'fireplace', label: 'Athanor Furnace', position: { row: 1, column: 1 } },
      { id: 'alembic', type: 'display_case', label: 'Glass Alembic', position: { row: 1, column: 4 } },
      { id: 'grimoire_shelf', type: 'bookshelf', label: 'Locked Grimoire Shelf', position: { row: 4, column: 1 } },
      { id: 'mercury_vat', type: 'fountain', label: 'Mercury Vat', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'paracelsus', name: 'Paracelsus Kane', role: 'victim', description: 'The enigmatic Master Alchemist.' },
      { id: 'cornelius', name: 'Cornelius Blackwood', role: 'suspect', description: "Kane's jealous former apprentice." },
      { id: 'ursula', name: 'Ursula Vance', role: 'suspect', description: 'A botanical toxicologist seeking the formula.' },
      { id: 'silas_a', name: 'Silas Drake', role: 'suspect', description: 'The silent laboratory assistant.' },
      { id: 'hawke', name: 'Guildmaster Hawke', role: 'suspect', description: 'The guild inspector auditing the gold registers.' },
      { id: 'genevieve', name: 'Lady Genevieve', role: 'suspect', description: "A royal patron demanding her philosopher's stone." },
    ],
    clues: [
      { id: 'c11-1', text: 'Paracelsus was in the Transmutation Chamber.', constraint: { type: 'character_in_area', characterId: 'paracelsus', areaId: 'transmutation' } },
      { id: 'c11-2', text: 'Paracelsus was standing directly adjacent to the Athanor Furnace.', constraint: { type: 'character_adjacent_to_object', characterId: 'paracelsus', objectId: 'great_athanor' } },
      { id: 'c11-3', text: 'Paracelsus was in row 0.', constraint: { type: 'character_in_row', characterId: 'paracelsus', row: 0 } },
      { id: 'c11-4', text: 'Cornelius was in the Transmutation Chamber.', constraint: { type: 'character_in_area', characterId: 'cornelius', areaId: 'transmutation' } },
      { id: 'c11-5', text: 'Cornelius was standing directly adjacent to the Athanor Furnace.', constraint: { type: 'character_adjacent_to_object', characterId: 'cornelius', objectId: 'great_athanor' } },
      { id: 'c11-6', text: 'Cornelius was in column 0.', constraint: { type: 'character_in_column', characterId: 'cornelius', column: 0 } },
      { id: 'c11-7', text: 'Ursula and Lady Genevieve were both inside the Distillery Wing.', constraint: { type: 'characters_same_area', characterId: 'ursula', targetCharacterId: 'genevieve' } },
      { id: 'c11-8', text: 'Ursula was in the Distillery Wing.', constraint: { type: 'character_in_area', characterId: 'ursula', areaId: 'distillery' } },
      { id: 'c11-9', text: 'Ursula stood directly adjacent to the Glass Alembic.', constraint: { type: 'character_adjacent_to_object', characterId: 'ursula', objectId: 'alembic' } },
      { id: 'c11-10', text: 'Ursula was in row 0.', constraint: { type: 'character_in_row', characterId: 'ursula', row: 0 } },
      { id: 'c11-11', text: 'Lady Genevieve was in column 5.', constraint: { type: 'character_in_column', characterId: 'genevieve', column: 5 } },
      { id: 'c11-12', text: 'Lady Genevieve stood directly adjacent to the Glass Alembic.', constraint: { type: 'character_adjacent_to_object', characterId: 'genevieve', objectId: 'alembic' } },
      { id: 'c11-13', text: 'Silas Drake was the only person in the Arcane Library.', constraint: { type: 'character_alone_in_area', characterId: 'silas_a' } },
      { id: 'c11-14', text: 'Silas was in the Arcane Library.', constraint: { type: 'character_in_area', characterId: 'silas_a', areaId: 'arcane_library' } },
      { id: 'c11-15', text: 'Silas stood directly adjacent to the Locked Grimoire Shelf.', constraint: { type: 'character_adjacent_to_object', characterId: 'silas_a', objectId: 'grimoire_shelf' } },
      { id: 'c11-16', text: 'Silas was in column 0.', constraint: { type: 'character_in_column', characterId: 'silas_a', column: 0 } },
      { id: 'c11-17', text: 'Guildmaster Hawke was the only person in the Furnace Vault.', constraint: { type: 'character_alone_in_area', characterId: 'hawke' } },
      { id: 'c11-18', text: 'Guildmaster Hawke was in the Furnace Vault.', constraint: { type: 'character_in_area', characterId: 'hawke', areaId: 'furnace_vault' } },
      { id: 'c11-19', text: 'Guildmaster Hawke was in row 3.', constraint: { type: 'character_in_row', characterId: 'hawke', row: 3 } },
      { id: 'c11-20', text: 'Guildmaster Hawke stood directly adjacent to the Mercury Vat.', constraint: { type: 'character_adjacent_to_object', characterId: 'hawke', objectId: 'mercury_vat' } },
    ],
    victimId: 'paracelsus',
    solution: {
      placements: {
        paracelsus: { row: 0, column: 1 },
        cornelius: { row: 1, column: 0 },
        ursula: { row: 0, column: 4 },
        genevieve: { row: 1, column: 5 },
        silas_a: { row: 4, column: 0 },
        hawke: { row: 3, column: 4 },
      },
      murdererId: 'cornelius',
    },
  },

  // CASE 012: The Imperial Opera House (medium)
  {
    id: 'case-012',
    title: 'The Imperial Opera House',
    subtitle: 'The final curtain for Maestro Leopold',
    description: "Maestro Leopold Weiss was found dead in the Conductor's Dressing Room just before the third act. Six singers and stagehands were in the theater wings. Trace everyone's location and deduce who was alone with the Maestro.",
    difficulty: 'medium',
    areas: standardAreas(
      ["Conductor's Dressing Room", 'Royal Box', 'Stage Wings', 'Prop Vault'],
      ['dressing_room', 'royal_box', 'stage_wings', 'prop_vault']
    ),
    objects: [
      { id: 'grand_piano', type: 'billiard_table', label: 'Grand Piano', position: { row: 1, column: 1 } },
      { id: 'velvet_curtain', type: 'curtain', label: 'Velvet Drapery', position: { row: 1, column: 4 } },
      { id: 'costume_rack', type: 'prop_trunk', label: 'Costume Trunk', position: { row: 4, column: 1 } },
      { id: 'iron_chandelier', type: 'clock', label: 'Stage Winch', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'leopold', name: 'Maestro Leopold', role: 'victim', description: 'The autocratic chief conductor.' },
      { id: 'rosa', name: 'Prima Donna Rosa', role: 'suspect', description: 'The temperamental soprano whom Leopold threatened to replace.' },
      { id: 'antonio', name: 'Tenor Antonio', role: 'suspect', description: 'A rising star fighting for the lead role.' },
      { id: 'otto', name: 'Otto the Stage Manager', role: 'suspect', description: 'The meticulous overseer of backstage logistics.' },
      { id: 'helena', name: 'Baroness Helena', role: 'suspect', description: "The opera's chief benefactress." },
      { id: 'giselle', name: 'Giselle Moreau', role: 'suspect', description: 'The ambitious understudy waiting in the wings.' },
      { id: 'meyer', name: 'Herr Meyer', role: 'suspect', description: 'The union representative locked in contract disputes.' },
    ],
    clues: [
      { id: 'c12-1', text: 'Maestro Leopold was in the Conductor\'s Dressing Room.', constraint: { type: 'character_in_area', characterId: 'leopold', areaId: 'dressing_room' } },
      { id: 'c12-2', text: 'Maestro Leopold was standing directly adjacent to the Grand Piano.', constraint: { type: 'character_adjacent_to_object', characterId: 'leopold', objectId: 'grand_piano' } },
      { id: 'c12-3', text: 'Maestro Leopold was in row 0.', constraint: { type: 'character_in_row', characterId: 'leopold', row: 0 } },
      { id: 'c12-4', text: 'Rosa was in the Conductor\'s Dressing Room.', constraint: { type: 'character_in_area', characterId: 'rosa', areaId: 'dressing_room' } },
      { id: 'c12-5', text: 'Rosa was standing directly adjacent to Maestro Leopold.', constraint: { type: 'character_adjacent_to_character', characterId: 'rosa', targetCharacterId: 'leopold' } },
      { id: 'c12-6', text: 'Rosa was in column 0.', constraint: { type: 'character_in_column', characterId: 'rosa', column: 0 } },
      { id: 'c12-7', text: 'Antonio and Baroness Helena were both seated in the Royal Box.', constraint: { type: 'characters_same_area', characterId: 'antonio', targetCharacterId: 'helena' } },
      { id: 'c12-8', text: 'Antonio was in the Royal Box.', constraint: { type: 'character_in_area', characterId: 'antonio', areaId: 'royal_box' } },
      { id: 'c12-9', text: 'Antonio was in row 0 and stood directly adjacent to the Velvet Drapery.', constraint: { type: 'character_adjacent_to_object', characterId: 'antonio', objectId: 'velvet_curtain' } },
      { id: 'c12-10', text: 'Antonio was in row 0.', constraint: { type: 'character_in_row', characterId: 'antonio', row: 0 } },
      { id: 'c12-11', text: 'Baroness Helena was in column 5 and stood directly adjacent to the Velvet Drapery.', constraint: { type: 'character_adjacent_to_object', characterId: 'helena', objectId: 'velvet_curtain' } },
      { id: 'c12-12', text: 'Baroness Helena was in column 5.', constraint: { type: 'character_in_column', characterId: 'helena', column: 5 } },
      { id: 'c12-13', text: 'Otto and Giselle were both working in the Stage Wings.', constraint: { type: 'characters_same_area', characterId: 'otto', targetCharacterId: 'giselle' } },
      { id: 'c12-14', text: 'Otto was in the Stage Wings.', constraint: { type: 'character_in_area', characterId: 'otto', areaId: 'stage_wings' } },
      { id: 'c12-15', text: 'Otto was in row 3 and stood directly adjacent to the Costume Trunk.', constraint: { type: 'character_adjacent_to_object', characterId: 'otto', objectId: 'costume_rack' } },
      { id: 'c12-16', text: 'Otto was in row 3.', constraint: { type: 'character_in_row', characterId: 'otto', row: 3 } },
      { id: 'c12-17', text: 'Giselle was in column 0 and stood directly adjacent to the Costume Trunk.', constraint: { type: 'character_adjacent_to_object', characterId: 'giselle', objectId: 'costume_rack' } },
      { id: 'c12-18', text: 'Giselle was in column 0.', constraint: { type: 'character_in_column', characterId: 'giselle', column: 0 } },
      { id: 'c12-19', text: 'Herr Meyer was the only person in the Prop Vault.', constraint: { type: 'character_alone_in_area', characterId: 'meyer' } },
      { id: 'c12-20', text: 'Herr Meyer was in the Prop Vault.', constraint: { type: 'character_in_area', characterId: 'meyer', areaId: 'prop_vault' } },
      { id: 'c12-21', text: 'Herr Meyer stood directly adjacent to the Stage Winch.', constraint: { type: 'character_adjacent_to_object', characterId: 'meyer', objectId: 'iron_chandelier' } },
      { id: 'c12-22', text: 'Herr Meyer was in column 5.', constraint: { type: 'character_in_column', characterId: 'meyer', column: 5 } },
    ],
    victimId: 'leopold',
    solution: {
      placements: {
        leopold: { row: 0, column: 1 },
        rosa: { row: 0, column: 0 },
        antonio: { row: 0, column: 4 },
        helena: { row: 1, column: 5 },
        otto: { row: 3, column: 1 },
        giselle: { row: 4, column: 0 },
        meyer: { row: 4, column: 5 },
      },
      murdererId: 'rosa',
    },
  },

  // CASE 013: The Highclere Observatory (medium)
  {
    id: 'case-013',
    title: 'The Highclere Observatory',
    subtitle: 'A midnight gaze silenced forever',
    description: "Royal Astronomer Dr. Thaddeus Vance was discovered dead beside the Great Refractor telescope. Six visiting scholars and technicians were scattered across the mountaintop dome. Deduce everyone's location and discover who was alone with Dr. Vance.",
    difficulty: 'medium',
    areas: standardAreas(
      ['Celestial Rotunda', 'Spectroscopy Lab', 'Chronometer Room', 'Transit Circle'],
      ['celestial_rotunda', 'spectroscopy_lab', 'chronometer_room', 'transit_circle']
    ),
    objects: [
      { id: 'refractor', type: 'steam_engine', label: 'Great Refractor', position: { row: 1, column: 1 } },
      { id: 'prism_spectroscope', type: 'display_case', label: 'Quartz Spectrograph', position: { row: 1, column: 4 } },
      { id: 'pendulum_regulator', type: 'clock', label: 'Master Sidereal Clock', position: { row: 4, column: 1 } },
      { id: 'celestial_globe', type: 'globe', label: 'Brass Star Globe', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'thaddeus', name: 'Dr. Thaddeus Vance', role: 'victim', description: 'The pioneering astronomer discovering a new comet.' },
      { id: 'lyra', name: 'Lyra Sterling', role: 'suspect', description: 'His brilliant calculating assistant denied credit.' },
      { id: 'brandt_prof', name: 'Professor Brandt', role: 'suspect', description: 'A visiting German astrophysicist.' },
      { id: 'clive', name: 'Clive Hawkins', role: 'suspect', description: 'The dome mechanical technician.' },
      { id: 'iris', name: 'Iris Finch', role: 'suspect', description: 'A star cartographer recording photographic plates.' },
      { id: 'roland', name: 'Roland Cross', role: 'suspect', description: 'The royal society auditor.' },
      { id: 'aris', name: 'Dr. Aris Thorne', role: 'suspect', description: 'The meteorological officer.' },
    ],
    clues: [
      { id: 'c13-1', text: 'Dr. Thaddeus Vance was in the Celestial Rotunda.', constraint: { type: 'character_in_area', characterId: 'thaddeus', areaId: 'celestial_rotunda' } },
      { id: 'c13-2', text: 'Dr. Thaddeus Vance stood directly adjacent to the Great Refractor.', constraint: { type: 'character_adjacent_to_object', characterId: 'thaddeus', objectId: 'refractor' } },
      { id: 'c13-3', text: 'Dr. Thaddeus Vance was in row 0.', constraint: { type: 'character_in_row', characterId: 'thaddeus', row: 0 } },
      { id: 'c13-4', text: 'Lyra Sterling was in the Celestial Rotunda.', constraint: { type: 'character_in_area', characterId: 'lyra', areaId: 'celestial_rotunda' } },
      { id: 'c13-5', text: 'Lyra Sterling stood directly adjacent to the Great Refractor.', constraint: { type: 'character_adjacent_to_object', characterId: 'lyra', objectId: 'refractor' } },
      { id: 'c13-6', text: 'Lyra Sterling was in column 0.', constraint: { type: 'character_in_column', characterId: 'lyra', column: 0 } },
      { id: 'c13-7', text: 'Professor Brandt and Iris Finch were both in the Spectroscopy Lab.', constraint: { type: 'characters_same_area', characterId: 'brandt_prof', targetCharacterId: 'iris' } },
      { id: 'c13-8', text: 'Professor Brandt was in row 0 and stood directly adjacent to the Quartz Spectrograph.', constraint: { type: 'character_adjacent_to_object', characterId: 'brandt_prof', objectId: 'prism_spectroscope' } },
      { id: 'c13-9', text: 'Professor Brandt was in row 0.', constraint: { type: 'character_in_row', characterId: 'brandt_prof', row: 0 } },
      { id: 'c13-10', text: 'Iris Finch was in column 5 and stood directly adjacent to the Quartz Spectrograph.', constraint: { type: 'character_adjacent_to_object', characterId: 'iris', objectId: 'prism_spectroscope' } },
      { id: 'c13-11', text: 'Iris Finch was in column 5.', constraint: { type: 'character_in_column', characterId: 'iris', column: 5 } },
      { id: 'c13-12', text: 'Clive Hawkins and Roland Cross were both in the Chronometer Room.', constraint: { type: 'characters_same_area', characterId: 'clive', targetCharacterId: 'roland' } },
      { id: 'c13-13', text: 'Clive Hawkins was in row 3 and stood directly adjacent to the Master Sidereal Clock.', constraint: { type: 'character_adjacent_to_object', characterId: 'clive', objectId: 'pendulum_regulator' } },
      { id: 'c13-14', text: 'Clive Hawkins was in row 3.', constraint: { type: 'character_in_row', characterId: 'clive', row: 3 } },
      { id: 'c13-15', text: 'Roland Cross was in column 0 and stood directly adjacent to the Master Sidereal Clock.', constraint: { type: 'character_adjacent_to_object', characterId: 'roland', objectId: 'pendulum_regulator' } },
      { id: 'c13-16', text: 'Roland Cross was in column 0.', constraint: { type: 'character_in_column', characterId: 'roland', column: 0 } },
      { id: 'c13-17', text: 'Dr. Aris Thorne was the only person in the Transit Circle.', constraint: { type: 'character_alone_in_area', characterId: 'aris' } },
      { id: 'c13-18', text: 'Dr. Aris Thorne was in the Transit Circle.', constraint: { type: 'character_in_area', characterId: 'aris', areaId: 'transit_circle' } },
      { id: 'c13-19', text: 'Dr. Aris Thorne was in column 5 and stood directly adjacent to the Brass Star Globe.', constraint: { type: 'character_adjacent_to_object', characterId: 'aris', objectId: 'celestial_globe' } },
      { id: 'c13-20', text: 'Dr. Aris Thorne was in column 5.', constraint: { type: 'character_in_column', characterId: 'aris', column: 5 } },
    ],
    victimId: 'thaddeus',
    solution: {
      placements: {
        thaddeus: { row: 0, column: 1 },
        lyra: { row: 1, column: 0 },
        brandt_prof: { row: 0, column: 4 },
        iris: { row: 1, column: 5 },
        clive: { row: 3, column: 1 },
        roland: { row: 4, column: 0 },
        aris: { row: 4, column: 5 },
      },
      murdererId: 'lyra',
    },
  },

  // CASE 014: The Sunken Galleon Salvage (medium)
  {
    id: 'case-014',
    title: 'The Sunken Galleon Salvage',
    subtitle: "A pirate's treasure claimed by blood",
    description: "Expedition Leader Captain Hawke was found strangled inside the Captain's Cabin aboard the salvage vessel Neptune. Six crew members were at their diving posts. Deduce everyone's location and discover who was alone with Captain Hawke.",
    difficulty: 'medium',
    areas: standardAreas(
      ["Captain's Cabin", 'Dive Deck', 'Pump Hold', 'Winch Station'],
      ['captains_cabin', 'dive_deck', 'pump_hold', 'winch_station']
    ),
    objects: [
      { id: 'chart_desk', type: 'desk', label: 'Navigation Chart Desk', position: { row: 1, column: 1 } },
      { id: 'diving_suit', type: 'display_case', label: 'Brass Diving Helmet', position: { row: 1, column: 4 } },
      { id: 'bilge_pump', type: 'steam_engine', label: 'Steam Bilge Pump', position: { row: 4, column: 1 } },
      { id: 'iron_capstan', type: 'nautical_wheel', label: 'Heavy Iron Capstan', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'hawke_capt', name: 'Captain Hawke', role: 'victim', description: 'Ruthless salvage captain obsessed with gold doubloons.' },
      { id: 'mateo', name: 'Mateo Cruz', role: 'suspect', description: 'The deep diver who found the Spanish chest.' },
      { id: 'silas_q', name: 'Silas Drake', role: 'suspect', description: 'The grizzled quartermaster.' },
      { id: 'eleanor', name: 'Eleanor Vance', role: 'suspect', description: 'The maritime historian deciphering the wreck map.' },
      { id: 'rory', name: 'Rory Quinn', role: 'suspect', description: 'The young deckhand anxious for his cut.' },
      { id: 'greta', name: 'Greta Lind', role: 'suspect', description: "The ship's chief mechanic." },
      { id: 'bram', name: 'Bram Thorne', role: 'suspect', description: 'The crane operator guarding the cargo.' },
    ],
    clues: [
      { id: 'c14-1', text: 'Captain Hawke was in the Captain\'s Cabin.', constraint: { type: 'character_in_area', characterId: 'hawke_capt', areaId: 'captains_cabin' } },
      { id: 'c14-2', text: 'Captain Hawke stood directly adjacent to the Navigation Chart Desk.', constraint: { type: 'character_adjacent_to_object', characterId: 'hawke_capt', objectId: 'chart_desk' } },
      { id: 'c14-3', text: 'Captain Hawke was in row 0.', constraint: { type: 'character_in_row', characterId: 'hawke_capt', row: 0 } },
      { id: 'c14-4', text: 'Mateo Cruz was in the Captain\'s Cabin.', constraint: { type: 'character_in_area', characterId: 'mateo', areaId: 'captains_cabin' } },
      { id: 'c14-5', text: 'Mateo Cruz stood directly adjacent to Captain Hawke.', constraint: { type: 'character_adjacent_to_character', characterId: 'mateo', targetCharacterId: 'hawke_capt' } },
      { id: 'c14-6', text: 'Mateo Cruz was in column 0.', constraint: { type: 'character_in_column', characterId: 'mateo', column: 0 } },
      { id: 'c14-7', text: 'Silas Drake and Eleanor Vance were both stationed on the Dive Deck.', constraint: { type: 'characters_same_area', characterId: 'silas_q', targetCharacterId: 'eleanor' } },
      { id: 'c14-8', text: 'Silas Drake was in row 0 and stood directly adjacent to the Brass Diving Helmet.', constraint: { type: 'character_adjacent_to_object', characterId: 'silas_q', objectId: 'diving_suit' } },
      { id: 'c14-9', text: 'Silas Drake was in row 0.', constraint: { type: 'character_in_row', characterId: 'silas_q', row: 0 } },
      { id: 'c14-10', text: 'Eleanor Vance was in column 5 and stood directly adjacent to the Brass Diving Helmet.', constraint: { type: 'character_adjacent_to_object', characterId: 'eleanor', objectId: 'diving_suit' } },
      { id: 'c14-11', text: 'Eleanor Vance was in column 5.', constraint: { type: 'character_in_column', characterId: 'eleanor', column: 5 } },
      { id: 'c14-12', text: 'Greta Lind and Rory Quinn were both working in the Pump Hold.', constraint: { type: 'characters_same_area', characterId: 'greta', targetCharacterId: 'rory' } },
      { id: 'c14-13', text: 'Greta Lind was in row 3 and stood directly adjacent to the Steam Bilge Pump.', constraint: { type: 'character_adjacent_to_object', characterId: 'greta', objectId: 'bilge_pump' } },
      { id: 'c14-14', text: 'Greta Lind was in row 3.', constraint: { type: 'character_in_row', characterId: 'greta', row: 3 } },
      { id: 'c14-15', text: 'Rory Quinn was in column 0 and stood directly adjacent to the Steam Bilge Pump.', constraint: { type: 'character_adjacent_to_object', characterId: 'rory', objectId: 'bilge_pump' } },
      { id: 'c14-16', text: 'Rory Quinn was in column 0.', constraint: { type: 'character_in_column', characterId: 'rory', column: 0 } },
      { id: 'c14-17', text: 'Bram Thorne was the only person at the Winch Station.', constraint: { type: 'character_alone_in_area', characterId: 'bram' } },
      { id: 'c14-18', text: 'Bram Thorne was at the Winch Station.', constraint: { type: 'character_in_area', characterId: 'bram', areaId: 'winch_station' } },
      { id: 'c14-19', text: 'Bram Thorne was in column 5 and stood directly adjacent to the Heavy Iron Capstan.', constraint: { type: 'character_adjacent_to_object', characterId: 'bram', objectId: 'iron_capstan' } },
      { id: 'c14-20', text: 'Bram Thorne was in column 5.', constraint: { type: 'character_in_column', characterId: 'bram', column: 5 } },
    ],
    victimId: 'hawke_capt',
    solution: {
      placements: {
        hawke_capt: { row: 0, column: 1 },
        mateo: { row: 0, column: 0 },
        silas_q: { row: 0, column: 4 },
        eleanor: { row: 1, column: 5 },
        greta: { row: 3, column: 1 },
        rory: { row: 4, column: 0 },
        bram: { row: 4, column: 5 },
      },
      murdererId: 'mateo',
    },
  },

  // CASE 015: The Royal Antiquities Vault (hard)
  {
    id: 'case-015',
    title: 'The Royal Antiquities Vault',
    subtitle: 'A subterranean heist sealed in blood',
    description: "Chief Archivist Percival Graves was found dead inside the Gold Reliquary Vault deep beneath the museum. Six experts and guards were trapped behind the pneumatic blast doors. Deduce everyone's location and discover who was alone with Percival Graves.",
    difficulty: 'hard',
    areas: standardAreas(
      ['Gold Reliquary', 'Papyrus Archive', 'Lapidary Vault', 'Guard Post'],
      ['gold_reliquary', 'papyrus_archive', 'lapidary_vault', 'guard_post']
    ),
    objects: [
      { id: 'pharaoh_coffin', type: 'sarcophagus', label: 'Golden Sarcophagus', position: { row: 1, column: 1 } },
      { id: 'scroll_rack', type: 'bookshelf', label: 'Cedar Scroll Rack', position: { row: 1, column: 4 } },
      { id: 'gem_cabinet', type: 'display_case', label: 'Ruby Display Cabinet', position: { row: 4, column: 1 } },
      { id: 'alarm_console', type: 'telegraph', label: 'Pneumatic Console', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'percival', name: 'Percival Graves', role: 'victim', description: "The venerable Chief Archivist guarding the museum's secrets." },
      { id: 'morgan', name: 'Dr. Morgan Blake', role: 'suspect', description: 'The senior conservator secretly forging provenance papers.' },
      { id: 'drake_sec', name: 'Drake Holloway', role: 'suspect', description: 'The head of museum security holding the master keys.' },
      { id: 'vivienne', name: 'Lady Vivienne', role: 'suspect', description: 'A wealthy patron claiming an heirloom inside the vault.' },
      { id: 'kenneth', name: 'Kenneth Shaw', role: 'suspect', description: 'The gemological appraiser assessing the crown rubies.' },
      { id: 'maeve', name: 'Maeve Sinclair', role: 'suspect', description: 'The assistant scribe cataloging ancient scrolls.' },
      { id: 'silas_j', name: 'Silas Vance', role: 'suspect', description: 'The vault custodian.' },
    ],
    clues: [
      { id: 'c15-1', text: 'Percival Graves was in the Gold Reliquary.', constraint: { type: 'character_in_area', characterId: 'percival', areaId: 'gold_reliquary' } },
      { id: 'c15-2', text: 'Percival was standing directly adjacent to the Golden Sarcophagus.', constraint: { type: 'character_adjacent_to_object', characterId: 'percival', objectId: 'pharaoh_coffin' } },
      { id: 'c15-3', text: 'Percival was in row 0.', constraint: { type: 'character_in_row', characterId: 'percival', row: 0 } },
      { id: 'c15-4', text: 'Dr. Morgan Blake was in the Gold Reliquary.', constraint: { type: 'character_in_area', characterId: 'morgan', areaId: 'gold_reliquary' } },
      { id: 'c15-5', text: 'Morgan was standing directly adjacent to the Golden Sarcophagus.', constraint: { type: 'character_adjacent_to_object', characterId: 'morgan', objectId: 'pharaoh_coffin' } },
      { id: 'c15-6', text: 'Morgan was in column 0.', constraint: { type: 'character_in_column', characterId: 'morgan', column: 0 } },
      { id: 'c15-7', text: 'Maeve Sinclair and Lady Vivienne were both inside the Papyrus Archive.', constraint: { type: 'characters_same_area', characterId: 'maeve', targetCharacterId: 'vivienne' } },
      { id: 'c15-8', text: 'Maeve was in row 0 and stood directly adjacent to the Cedar Scroll Rack.', constraint: { type: 'character_adjacent_to_object', characterId: 'maeve', objectId: 'scroll_rack' } },
      { id: 'c15-9', text: 'Maeve was in row 0.', constraint: { type: 'character_in_row', characterId: 'maeve', row: 0 } },
      { id: 'c15-10', text: 'Lady Vivienne was in column 5 and stood directly adjacent to the Cedar Scroll Rack.', constraint: { type: 'character_adjacent_to_object', characterId: 'vivienne', objectId: 'scroll_rack' } },
      { id: 'c15-11', text: 'Lady Vivienne was in column 5.', constraint: { type: 'character_in_column', characterId: 'vivienne', column: 5 } },
      { id: 'c15-12', text: 'Kenneth Shaw and Silas Vance were both inside the Lapidary Vault.', constraint: { type: 'characters_same_area', characterId: 'kenneth', targetCharacterId: 'silas_j' } },
      { id: 'c15-13', text: 'Kenneth was in row 3 and stood directly adjacent to the Ruby Display Cabinet.', constraint: { type: 'character_adjacent_to_object', characterId: 'kenneth', objectId: 'gem_cabinet' } },
      { id: 'c15-14', text: 'Kenneth was in row 3.', constraint: { type: 'character_in_row', characterId: 'kenneth', row: 3 } },
      { id: 'c15-15', text: 'Silas Vance was in column 0 and stood directly adjacent to the Ruby Display Cabinet.', constraint: { type: 'character_adjacent_to_object', characterId: 'silas_j', objectId: 'gem_cabinet' } },
      { id: 'c15-16', text: 'Silas Vance was in column 0.', constraint: { type: 'character_in_column', characterId: 'silas_j', column: 0 } },
      { id: 'c15-17', text: 'Security Chief Drake Holloway was the only person in the Guard Post.', constraint: { type: 'character_alone_in_area', characterId: 'drake_sec' } },
      { id: 'c15-18', text: 'Drake was in the Guard Post.', constraint: { type: 'character_in_area', characterId: 'drake_sec', areaId: 'guard_post' } },
      { id: 'c15-19', text: 'Drake was in column 5 and stood directly adjacent to the Pneumatic Console.', constraint: { type: 'character_adjacent_to_object', characterId: 'drake_sec', objectId: 'alarm_console' } },
      { id: 'c15-20', text: 'Drake was in column 5.', constraint: { type: 'character_in_column', characterId: 'drake_sec', column: 5 } },
    ],
    victimId: 'percival',
    solution: {
      placements: {
        percival: { row: 0, column: 1 },
        morgan: { row: 1, column: 0 },
        maeve: { row: 0, column: 4 },
        vivienne: { row: 1, column: 5 },
        kenneth: { row: 3, column: 1 },
        silas_j: { row: 4, column: 0 },
        drake_sec: { row: 4, column: 5 },
      },
      murdererId: 'morgan',
    },
  },

  // CASE 016: The Venice Masquerade (hard)
  {
    id: 'case-016',
    title: 'The Venice Masquerade',
    subtitle: 'Masks and daggers along the Grand Canal',
    description: "Duca Bernardo Contarini was discovered poisoned in the Mirror Gallery of Palazzo Bellini during the Carnevale gala. Six masked guests and attendants were in the adjoining halls. Deduce everyone's location and discover who was alone with the Duca.",
    difficulty: 'hard',
    areas: standardAreas(
      ['Mirror Gallery', 'Music Salon', 'Gondola Terrace', 'Casanova Lounge'],
      ['mirror_gallery', 'music_salon', 'gondola_terrace', 'casanova_lounge']
    ),
    objects: [
      { id: 'venetian_chandelier', type: 'clock', label: 'Murano Chandelier', position: { row: 1, column: 1 } },
      { id: 'harpsichord', type: 'billiard_table', label: 'Gilded Harpsichord', position: { row: 1, column: 4 } },
      { id: 'terrace_fountain', type: 'fountain', label: 'Lion Head Fountain', position: { row: 4, column: 1 } },
      { id: 'velvet_canopy', type: 'couch', label: 'Carnival Divan', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'bernardo', name: 'Duca Bernardo', role: 'victim', description: 'The ruthless Venetian patriarch of Palazzo Bellini.' },
      { id: 'francesca', name: 'Contessa Francesca', role: 'suspect', description: 'His estranged cousin seeking restoration of family estates.' },
      { id: 'matteo_g', name: 'Gondolier Matteo', role: 'suspect', description: 'A private boatman carrying secret letters.' },
      { id: 'armand', name: 'Diplomat Armand', role: 'suspect', description: 'A French ambassador embroiled in sovereign espionage.' },
      { id: 'lucia', name: 'Lucia the Maskmaker', role: 'suspect', description: 'Artisan who crafted the carnival costumes.' },
      { id: 'silvio', name: 'Silvio Moretti', role: 'suspect', description: 'A wealthy merchant who bet heavily on spice shipments.' },
      { id: 'cosima', name: 'Cosima Bellini', role: 'suspect', description: 'The prima ballerina scheduled to perform the midnight dance.' },
    ],
    clues: [
      { id: 'c16-1', text: 'Duca Bernardo was standing in the Mirror Gallery.', constraint: { type: 'character_in_area', characterId: 'bernardo', areaId: 'mirror_gallery' } },
      { id: 'c16-2', text: 'Duca Bernardo stood directly adjacent to the Murano Chandelier.', constraint: { type: 'character_adjacent_to_object', characterId: 'bernardo', objectId: 'venetian_chandelier' } },
      { id: 'c16-3', text: 'Duca Bernardo was in row 0.', constraint: { type: 'character_in_row', characterId: 'bernardo', row: 0 } },
      { id: 'c16-4', text: 'Contessa Francesca was in the Mirror Gallery.', constraint: { type: 'character_in_area', characterId: 'francesca', areaId: 'mirror_gallery' } },
      { id: 'c16-5', text: 'Contessa Francesca was directly adjacent to Duca Bernardo.', constraint: { type: 'character_adjacent_to_character', characterId: 'francesca', targetCharacterId: 'bernardo' } },
      { id: 'c16-6', text: 'Contessa Francesca was in column 0.', constraint: { type: 'character_in_column', characterId: 'francesca', column: 0 } },
      { id: 'c16-7', text: 'Diplomat Armand and Cosima Bellini were both in the Music Salon.', constraint: { type: 'characters_same_area', characterId: 'armand', targetCharacterId: 'cosima' } },
      { id: 'c16-8', text: 'Diplomat Armand was in row 0 and stood directly adjacent to the Gilded Harpsichord.', constraint: { type: 'character_adjacent_to_object', characterId: 'armand', objectId: 'harpsichord' } },
      { id: 'c16-9', text: 'Diplomat Armand was in row 0.', constraint: { type: 'character_in_row', characterId: 'armand', row: 0 } },
      { id: 'c16-10', text: 'Cosima Bellini was in column 5 and stood directly adjacent to the Gilded Harpsichord.', constraint: { type: 'character_adjacent_to_object', characterId: 'cosima', objectId: 'harpsichord' } },
      { id: 'c16-11', text: 'Cosima Bellini was in column 5.', constraint: { type: 'character_in_column', characterId: 'cosima', column: 5 } },
      { id: 'c16-12', text: 'Gondolier Matteo and Lucia the Maskmaker were both on the Gondola Terrace.', constraint: { type: 'characters_same_area', characterId: 'matteo_g', targetCharacterId: 'lucia' } },
      { id: 'c16-13', text: 'Gondolier Matteo was in row 3 and stood directly adjacent to the Lion Head Fountain.', constraint: { type: 'character_adjacent_to_object', characterId: 'matteo_g', objectId: 'terrace_fountain' } },
      { id: 'c16-14', text: 'Gondolier Matteo was in row 3.', constraint: { type: 'character_in_row', characterId: 'matteo_g', row: 3 } },
      { id: 'c16-15', text: 'Lucia the Maskmaker was in column 0 and stood directly adjacent to the Lion Head Fountain.', constraint: { type: 'character_adjacent_to_object', characterId: 'lucia', objectId: 'terrace_fountain' } },
      { id: 'c16-16', text: 'Lucia the Maskmaker was in column 0.', constraint: { type: 'character_in_column', characterId: 'lucia', column: 0 } },
      { id: 'c16-17', text: 'Silvio Moretti was the only person in the Casanova Lounge.', constraint: { type: 'character_alone_in_area', characterId: 'silvio' } },
      { id: 'c16-18', text: 'Silvio Moretti was in the Casanova Lounge.', constraint: { type: 'character_in_area', characterId: 'silvio', areaId: 'casanova_lounge' } },
      { id: 'c16-19', text: 'Silvio Moretti was in column 5 and stood directly adjacent to the Carnival Divan.', constraint: { type: 'character_adjacent_to_object', characterId: 'silvio', objectId: 'velvet_canopy' } },
      { id: 'c16-20', text: 'Silvio Moretti was in column 5.', constraint: { type: 'character_in_column', characterId: 'silvio', column: 5 } },
    ],
    victimId: 'bernardo',
    solution: {
      placements: {
        bernardo: { row: 0, column: 1 },
        francesca: { row: 0, column: 0 },
        armand: { row: 0, column: 4 },
        cosima: { row: 1, column: 5 },
        matteo_g: { row: 3, column: 1 },
        lucia: { row: 4, column: 0 },
        silvio: { row: 4, column: 5 },
      },
      murdererId: 'francesca',
    },
  },

  // CASE 017: The Fogbound Depot (hard)
  {
    id: 'case-017',
    title: 'The Fogbound Depot',
    subtitle: 'A midnight whistle silenced by murder',
    description: "Yardmaster Archibald Reed was discovered dead in the Signal Tower at Blackfriars Depot under a dense London smog. Six railway workers and inspectors were scattered across the switching yards. Deduce everyone's location and discover who was alone with Archibald Reed.",
    difficulty: 'hard',
    areas: standardAreas(
      ['Signal Tower', 'Freight Shed', 'Turntable Bay', 'Lamp Room'],
      ['signal_tower', 'freight_shed', 'turntable_bay', 'lamp_room']
    ),
    objects: [
      { id: 'signal_interlock', type: 'telegraph', label: 'Mechanical Interlock', position: { row: 1, column: 1 } },
      { id: 'cargo_scales', type: 'desk', label: 'Heavy Freight Scales', position: { row: 1, column: 4 } },
      { id: 'locomotive_boiler', type: 'steam_engine', label: 'Shunting Locomotive', position: { row: 4, column: 1 } },
      { id: 'paraffin_station', type: 'fireplace', label: 'Lantern Test Bench', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'archibald', name: 'Archibald Reed', role: 'victim', description: 'The uncompromising depot yardmaster.' },
      { id: 'sean', name: 'Switchman Sean', role: 'suspect', description: 'A veteran switchman threatened with dismissal.' },
      { id: 'clara_d', name: 'Clara Briggs', role: 'suspect', description: 'The nighttime telegraph dispatcher.' },
      { id: 'hank', name: 'Hank Miller', role: 'suspect', description: 'A coal stoker with a fiery temper.' },
      { id: 'inspector_m', name: 'Inspector Miller', role: 'suspect', description: 'The railway police detective checking manifests.' },
      { id: 'donald', name: 'Donald Pike', role: 'suspect', description: 'A warehouse porter suspected of pilfering goods.' },
      { id: 'greg', name: 'Foreman Greg', role: 'suspect', description: 'The engine house foreman.' },
    ],
    clues: [
      { id: 'c17-1', text: 'Archibald Reed was in the Signal Tower.', constraint: { type: 'character_in_area', characterId: 'archibald', areaId: 'signal_tower' } },
      { id: 'c17-2', text: 'Archibald Reed stood directly adjacent to the Mechanical Interlock.', constraint: { type: 'character_adjacent_to_object', characterId: 'archibald', objectId: 'signal_interlock' } },
      { id: 'c17-3', text: 'Archibald Reed was in row 0.', constraint: { type: 'character_in_row', characterId: 'archibald', row: 0 } },
      { id: 'c17-4', text: 'Switchman Sean was in the Signal Tower.', constraint: { type: 'character_in_area', characterId: 'sean', areaId: 'signal_tower' } },
      { id: 'c17-5', text: 'Switchman Sean stood directly adjacent to the Mechanical Interlock.', constraint: { type: 'character_adjacent_to_object', characterId: 'sean', objectId: 'signal_interlock' } },
      { id: 'c17-6', text: 'Switchman Sean was in column 0.', constraint: { type: 'character_in_column', characterId: 'sean', column: 0 } },
      { id: 'c17-7', text: 'Clara Briggs and Donald Pike were both in the Freight Shed.', constraint: { type: 'characters_same_area', characterId: 'clara_d', targetCharacterId: 'donald' } },
      { id: 'c17-8', text: 'Clara Briggs was in row 0 and stood directly adjacent to the Heavy Freight Scales.', constraint: { type: 'character_adjacent_to_object', characterId: 'clara_d', objectId: 'cargo_scales' } },
      { id: 'c17-9', text: 'Clara Briggs was in row 0.', constraint: { type: 'character_in_row', characterId: 'clara_d', row: 0 } },
      { id: 'c17-10', text: 'Donald Pike was in column 5 and stood directly adjacent to the Heavy Freight Scales.', constraint: { type: 'character_adjacent_to_object', characterId: 'donald', objectId: 'cargo_scales' } },
      { id: 'c17-11', text: 'Donald Pike was in column 5.', constraint: { type: 'character_in_column', characterId: 'donald', column: 5 } },
      { id: 'c17-12', text: 'Hank Miller and Foreman Greg were both stationed in the Turntable Bay.', constraint: { type: 'characters_same_area', characterId: 'hank', targetCharacterId: 'greg' } },
      { id: 'c17-13', text: 'Hank Miller was in row 3 and stood directly adjacent to the Shunting Locomotive.', constraint: { type: 'character_adjacent_to_object', characterId: 'hank', objectId: 'locomotive_boiler' } },
      { id: 'c17-14', text: 'Hank Miller was in row 3.', constraint: { type: 'character_in_row', characterId: 'hank', row: 3 } },
      { id: 'c17-15', text: 'Foreman Greg was in column 0 and stood directly adjacent to the Shunting Locomotive.', constraint: { type: 'character_adjacent_to_object', characterId: 'greg', objectId: 'locomotive_boiler' } },
      { id: 'c17-16', text: 'Foreman Greg was in column 0.', constraint: { type: 'character_in_column', characterId: 'greg', column: 0 } },
      { id: 'c17-17', text: 'Inspector Miller was the only person in the Lamp Room.', constraint: { type: 'character_alone_in_area', characterId: 'inspector_m' } },
      { id: 'c17-18', text: 'Inspector Miller was in the Lamp Room.', constraint: { type: 'character_in_area', characterId: 'inspector_m', areaId: 'lamp_room' } },
      { id: 'c17-19', text: 'Inspector Miller was in column 5 and stood directly adjacent to the Lantern Test Bench.', constraint: { type: 'character_adjacent_to_object', characterId: 'inspector_m', objectId: 'paraffin_station' } },
      { id: 'c17-20', text: 'Inspector Miller was in column 5.', constraint: { type: 'character_in_column', characterId: 'inspector_m', column: 5 } },
    ],
    victimId: 'archibald',
    solution: {
      placements: {
        archibald: { row: 0, column: 1 },
        sean: { row: 1, column: 0 },
        clara_d: { row: 0, column: 4 },
        donald: { row: 1, column: 5 },
        hank: { row: 3, column: 1 },
        greg: { row: 4, column: 0 },
        inspector_m: { row: 4, column: 5 },
      },
      murdererId: 'sean',
    },
  },

  // CASE 018: The High-Alpine Sanitarium (hard)
  {
    id: 'case-018',
    title: 'The High-Alpine Sanitarium',
    subtitle: 'Clean mountain air, cold-blooded murder',
    description: "Sanitarium Director Dr. Victor Klaus was found poisoned in the Hydrotherapy Suite of Berghof Clavadel. Six doctors, staff, and patients were isolated by an overnight avalanche. Deduce everyone's location and discover who was alone with Dr. Klaus.",
    difficulty: 'hard',
    areas: standardAreas(
      ['Hydrotherapy Suite', 'Sun Terrace', 'Apothecary Store', 'Library Salon'],
      ['hydrotherapy', 'sun_terrace', 'apothecary_store', 'library_salon']
    ),
    objects: [
      { id: 'mineral_bath', type: 'fountain', label: 'Thermal Mineral Bath', position: { row: 1, column: 1 } },
      { id: 'deck_lounger', type: 'couch', label: 'Cure Lounger', position: { row: 1, column: 4 } },
      { id: 'medicine_safe', type: 'safe', label: 'Locked Narcotic Cabinet', position: { row: 4, column: 1 } },
      { id: 'tiled_stove', type: 'fireplace', label: 'Swiss Porcelain Stove', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'victor', name: 'Dr. Victor Klaus', role: 'victim', description: 'Director of Berghof Clavadel Sanitarium.' },
      { id: 'gretchen', name: 'Nurse Gretchen', role: 'suspect', description: "The head nurse privy to the clinic's experimental records." },
      { id: 'hans', name: 'Dr. Hans Meyer', role: 'suspect', description: 'A junior physician conducting unauthorized research.' },
      { id: 'sonja', name: 'Baroness Sonja', role: 'suspect', description: 'A long-term patient withholding substantial donations.' },
      { id: 'lucas', name: 'Lucas Vance', role: 'suspect', description: 'A restless convalescent roaming the corridors.' },
      { id: 'karl', name: 'Karl the Pharmacist', role: 'suspect', description: 'The dispensary keeper who mislaid toxic tinctures.' },
      { id: 'bruno', name: 'Bruno the Orderly', role: 'suspect', description: 'The night orderly guarding the exits.' },
    ],
    clues: [
      { id: 'c18-1', text: 'Dr. Victor Klaus was in the Hydrotherapy Suite.', constraint: { type: 'character_in_area', characterId: 'victor', areaId: 'hydrotherapy' } },
      { id: 'c18-2', text: 'Dr. Victor Klaus stood directly adjacent to the Thermal Mineral Bath.', constraint: { type: 'character_adjacent_to_object', characterId: 'victor', objectId: 'mineral_bath' } },
      { id: 'c18-3', text: 'Dr. Victor Klaus was in row 0.', constraint: { type: 'character_in_row', characterId: 'victor', row: 0 } },
      { id: 'c18-4', text: 'Nurse Gretchen was in the Hydrotherapy Suite.', constraint: { type: 'character_in_area', characterId: 'gretchen', areaId: 'hydrotherapy' } },
      { id: 'c18-5', text: 'Nurse Gretchen was directly adjacent to Dr. Klaus.', constraint: { type: 'character_adjacent_to_character', characterId: 'gretchen', targetCharacterId: 'victor' } },
      { id: 'c18-6', text: 'Nurse Gretchen was in column 0.', constraint: { type: 'character_in_column', characterId: 'gretchen', column: 0 } },
      { id: 'c18-7', text: 'Dr. Hans Meyer and Baroness Sonja were both resting on the Sun Terrace.', constraint: { type: 'characters_same_area', characterId: 'hans', targetCharacterId: 'sonja' } },
      { id: 'c18-8', text: 'Dr. Hans Meyer was in row 0 and stood directly adjacent to the Cure Lounger.', constraint: { type: 'character_adjacent_to_object', characterId: 'hans', objectId: 'deck_lounger' } },
      { id: 'c18-9', text: 'Dr. Hans Meyer was in row 0.', constraint: { type: 'character_in_row', characterId: 'hans', row: 0 } },
      { id: 'c18-10', text: 'Baroness Sonja was in column 5 and stood directly adjacent to the Cure Lounger.', constraint: { type: 'character_adjacent_to_object', characterId: 'sonja', objectId: 'deck_lounger' } },
      { id: 'c18-11', text: 'Baroness Sonja was in column 5.', constraint: { type: 'character_in_column', characterId: 'sonja', column: 5 } },
      { id: 'c18-12', text: 'Karl the Pharmacist and Lucas Vance were both in the Apothecary Store.', constraint: { type: 'characters_same_area', characterId: 'karl', targetCharacterId: 'lucas' } },
      { id: 'c18-13', text: 'Karl was in row 3 and stood directly adjacent to the Locked Narcotic Cabinet.', constraint: { type: 'character_adjacent_to_object', characterId: 'karl', objectId: 'medicine_safe' } },
      { id: 'c18-14', text: 'Karl was in row 3.', constraint: { type: 'character_in_row', characterId: 'karl', row: 3 } },
      { id: 'c18-15', text: 'Lucas Vance was in column 0 and stood directly adjacent to the Locked Narcotic Cabinet.', constraint: { type: 'character_adjacent_to_object', characterId: 'lucas', objectId: 'medicine_safe' } },
      { id: 'c18-16', text: 'Lucas Vance was in column 0.', constraint: { type: 'character_in_column', characterId: 'lucas', column: 0 } },
      { id: 'c18-17', text: 'Bruno the Orderly was the only person in the Library Salon.', constraint: { type: 'character_alone_in_area', characterId: 'bruno' } },
      { id: 'c18-18', text: 'Bruno was in the Library Salon.', constraint: { type: 'character_in_area', characterId: 'bruno', areaId: 'library_salon' } },
      { id: 'c18-19', text: 'Bruno was in column 5 and stood directly adjacent to the Swiss Porcelain Stove.', constraint: { type: 'character_adjacent_to_object', characterId: 'bruno', objectId: 'tiled_stove' } },
      { id: 'c18-20', text: 'Bruno was in column 5.', constraint: { type: 'character_in_column', characterId: 'bruno', column: 5 } },
    ],
    victimId: 'victor',
    solution: {
      placements: {
        victor: { row: 0, column: 1 },
        gretchen: { row: 0, column: 0 },
        hans: { row: 0, column: 4 },
        sonja: { row: 1, column: 5 },
        karl: { row: 3, column: 1 },
        lucas: { row: 4, column: 0 },
        bruno: { row: 4, column: 5 },
      },
      murdererId: 'gretchen',
    },
  },

  // CASE 019: The Sovereign Airship (expert)
  {
    id: 'case-019',
    title: 'The Sovereign Airship',
    subtitle: 'Murder at ten thousand feet',
    description: "Sky Marshall Alistair Thorne was discovered stabbed in the Navigation Bridge of the imperial zephyr Valkyrie over the North Sea. Six flight officers and passengers were trapped aloft. Trace everyone's position and discover who was alone with Marshall Thorne.",
    difficulty: 'expert',
    areas: standardAreas(
      ['Navigation Bridge', 'Chart Room', 'Radiotelegraph Cabin', 'Promenade Deck'],
      ['nav_bridge', 'chart_room', 'radiotelegraph', 'promenade_deck']
    ),
    objects: [
      { id: 'helm_wheel', type: 'nautical_wheel', label: 'Master Gyro-Helm', position: { row: 1, column: 1 } },
      { id: 'drafting_table', type: 'desk', label: 'Aeronautical Table', position: { row: 1, column: 4 } },
      { id: 'spark_transmitter', type: 'telegraph', label: 'Marconi Transmitter', position: { row: 4, column: 1 } },
      { id: 'panoramic_window', type: 'window', label: 'Observation Bay', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'thorne', name: 'Marshall Thorne', role: 'victim', description: 'Commander of the imperial air fleet.' },
      { id: 'victoria', name: 'First Officer Victoria', role: 'suspect', description: 'The senior navigator plotting an unsanctioned course.' },
      { id: 'baxter', name: 'Chief Engineer Baxter', role: 'suspect', description: 'The veteran engineer in charge of the gasbags.' },
      { id: 'ilona', name: 'Countess Ilona', role: 'suspect', description: 'An enigmatic foreign diplomat traveling incognito.' },
      { id: 'vance_pilot', name: 'Flight Lieutenant Vance', role: 'suspect', description: 'The junior pilot relieved of duty after an altercation.' },
      { id: 'knox', name: 'Radio Officer Knox', role: 'suspect', description: 'The operator decoding intercepted military cables.' },
      { id: 'jean', name: 'Steward Jean', role: 'suspect', description: "The chief purser who served the command crew's dinner." },
    ],
    clues: [
      { id: 'c19-1', text: 'Marshall Thorne was in the Navigation Bridge.', constraint: { type: 'character_in_area', characterId: 'thorne', areaId: 'nav_bridge' } },
      { id: 'c19-2', text: 'Marshall Thorne stood directly adjacent to the Master Gyro-Helm.', constraint: { type: 'character_adjacent_to_object', characterId: 'thorne', objectId: 'helm_wheel' } },
      { id: 'c19-3', text: 'Marshall Thorne was in row 0.', constraint: { type: 'character_in_row', characterId: 'thorne', row: 0 } },
      { id: 'c19-4', text: 'First Officer Victoria was in the Navigation Bridge.', constraint: { type: 'character_in_area', characterId: 'victoria', areaId: 'nav_bridge' } },
      { id: 'c19-5', text: 'First Officer Victoria stood directly adjacent to the Master Gyro-Helm.', constraint: { type: 'character_adjacent_to_object', characterId: 'victoria', objectId: 'helm_wheel' } },
      { id: 'c19-6', text: 'First Officer Victoria was in column 0.', constraint: { type: 'character_in_column', characterId: 'victoria', column: 0 } },
      { id: 'c19-7', text: 'Chief Engineer Baxter and Countess Ilona were both in the Chart Room.', constraint: { type: 'characters_same_area', characterId: 'baxter', targetCharacterId: 'ilona' } },
      { id: 'c19-8', text: 'Chief Engineer Baxter was in row 0 and stood directly adjacent to the Aeronautical Table.', constraint: { type: 'character_adjacent_to_object', characterId: 'baxter', objectId: 'drafting_table' } },
      { id: 'c19-9', text: 'Chief Engineer Baxter was in row 0.', constraint: { type: 'character_in_row', characterId: 'baxter', row: 0 } },
      { id: 'c19-10', text: 'Countess Ilona was in column 5 and stood directly adjacent to the Aeronautical Table.', constraint: { type: 'character_adjacent_to_object', characterId: 'ilona', objectId: 'drafting_table' } },
      { id: 'c19-11', text: 'Countess Ilona was in column 5.', constraint: { type: 'character_in_column', characterId: 'ilona', column: 5 } },
      { id: 'c19-12', text: 'Radio Officer Knox and Lieutenant Vance were both in the Radiotelegraph Cabin.', constraint: { type: 'characters_same_area', characterId: 'knox', targetCharacterId: 'vance_pilot' } },
      { id: 'c19-13', text: 'Knox was in row 3 and stood directly adjacent to the Marconi Transmitter.', constraint: { type: 'character_adjacent_to_object', characterId: 'knox', objectId: 'spark_transmitter' } },
      { id: 'c19-14', text: 'Knox was in row 3.', constraint: { type: 'character_in_row', characterId: 'knox', row: 3 } },
      { id: 'c19-15', text: 'Lieutenant Vance was in column 0 and stood directly adjacent to the Marconi Transmitter.', constraint: { type: 'character_adjacent_to_object', characterId: 'vance_pilot', objectId: 'spark_transmitter' } },
      { id: 'c19-16', text: 'Lieutenant Vance was in column 0.', constraint: { type: 'character_in_column', characterId: 'vance_pilot', column: 0 } },
      { id: 'c19-17', text: 'Steward Jean was the only person on the Promenade Deck.', constraint: { type: 'character_alone_in_area', characterId: 'jean' } },
      { id: 'c19-18', text: 'Steward Jean was on the Promenade Deck.', constraint: { type: 'character_in_area', characterId: 'jean', areaId: 'promenade_deck' } },
      { id: 'c19-19', text: 'Steward Jean was in column 5 and stood directly adjacent to the Observation Bay.', constraint: { type: 'character_adjacent_to_object', characterId: 'jean', objectId: 'panoramic_window' } },
      { id: 'c19-20', text: 'Steward Jean was in column 5.', constraint: { type: 'character_in_column', characterId: 'jean', column: 5 } },
    ],
    victimId: 'thorne',
    solution: {
      placements: {
        thorne: { row: 0, column: 1 },
        victoria: { row: 1, column: 0 },
        baxter: { row: 0, column: 4 },
        ilona: { row: 1, column: 5 },
        knox: { row: 3, column: 1 },
        vance_pilot: { row: 4, column: 0 },
        jean: { row: 4, column: 5 },
      },
      murdererId: 'victoria',
    },
  },

  // CASE 020: The Obsidian Citadel (expert)
  {
    id: 'case-020',
    title: 'The Obsidian Citadel',
    subtitle: "The high council's final decree",
    description: "High Chancellor Marcus Vane was found assassinated in the Obsidian Chamber during the winter conclave. Seven councilors and bodyguards remained sealed within the mountain fortress. Deduce everyone's location and discover who was alone with Chancellor Vane.",
    difficulty: 'expert',
    areas: standardAreas(
      ['Obsidian Chamber', 'High Council Room', 'Armory Hall', 'Archives Crypt'],
      ['obsidian_chamber', 'high_council', 'armory_hall', 'archives_crypt']
    ),
    objects: [
      { id: 'obsidian_throne', type: 'desk', label: 'Black Granite Throne', position: { row: 1, column: 1 } },
      { id: 'round_table', type: 'billiard_table', label: 'Council Round Table', position: { row: 1, column: 4 } },
      { id: 'weapon_rack', type: 'prop_trunk', label: 'Halberd Rack', position: { row: 4, column: 1 } },
      { id: 'iron_archive', type: 'safe', label: 'Sealed Treaty Chest', position: { row: 4, column: 4 } },
    ],
    characters: [
      { id: 'marcus_v', name: 'Chancellor Marcus Vane', role: 'victim', description: 'The iron-willed ruler of the High Marches.' },
      { id: 'vespera', name: 'Lady Vespera', role: 'suspect', description: 'The ambitious Shadow Councilor.' },
      { id: 'kael', name: 'General Kael', role: 'suspect', description: 'Commander of the Citadel Garrison.' },
      { id: 'lyanna', name: 'Spymaster Lyanna', role: 'suspect', description: "Keeper of the Citadel's whisper network." },
      { id: 'morath', name: 'Inquisitor Morath', role: 'suspect', description: 'The zealous guardian of orthodoxy.' },
      { id: 'zephyr', name: 'Envoy Zephyr', role: 'suspect', description: 'The ambassador from the Southern Kingdoms.' },
      { id: 'theresa', name: 'Archivist Theresa', role: 'suspect', description: 'The scholar who uncovered the forged treaty.' },
      { id: 'silas_guard', name: 'Commander Silas', role: 'suspect', description: "Captain of the Chancellor's personal guard." },
    ],
    clues: [
      { id: 'c20-1', text: 'Chancellor Marcus Vane was in the Obsidian Chamber.', constraint: { type: 'character_in_area', characterId: 'marcus_v', areaId: 'obsidian_chamber' } },
      { id: 'c20-2', text: 'Chancellor Marcus Vane stood directly adjacent to the Black Granite Throne.', constraint: { type: 'character_adjacent_to_object', characterId: 'marcus_v', objectId: 'obsidian_throne' } },
      { id: 'c20-3', text: 'Chancellor Marcus Vane was in row 0.', constraint: { type: 'character_in_row', characterId: 'marcus_v', row: 0 } },
      { id: 'c20-4', text: 'Lady Vespera was in the Obsidian Chamber.', constraint: { type: 'character_in_area', characterId: 'vespera', areaId: 'obsidian_chamber' } },
      { id: 'c20-5', text: 'Lady Vespera was directly adjacent to Chancellor Vane.', constraint: { type: 'character_adjacent_to_character', characterId: 'vespera', targetCharacterId: 'marcus_v' } },
      { id: 'c20-6', text: 'Lady Vespera was in column 0.', constraint: { type: 'character_in_column', characterId: 'vespera', column: 0 } },
      { id: 'c20-7', text: 'General Kael and Spymaster Lyanna were both in the High Council Room.', constraint: { type: 'characters_same_area', characterId: 'kael', targetCharacterId: 'lyanna' } },
      { id: 'c20-8', text: 'General Kael was in row 0 and stood directly adjacent to the Council Round Table.', constraint: { type: 'character_adjacent_to_object', characterId: 'kael', objectId: 'round_table' } },
      { id: 'c20-9', text: 'General Kael was in row 0.', constraint: { type: 'character_in_row', characterId: 'kael', row: 0 } },
      { id: 'c20-10', text: 'Spymaster Lyanna was in column 5 and stood directly adjacent to the Council Round Table.', constraint: { type: 'character_adjacent_to_object', characterId: 'lyanna', objectId: 'round_table' } },
      { id: 'c20-11', text: 'Spymaster Lyanna was in column 5.', constraint: { type: 'character_in_column', characterId: 'lyanna', column: 5 } },
      { id: 'c20-12', text: 'Inquisitor Morath and Commander Silas were both stationed in the Armory Hall.', constraint: { type: 'characters_same_area', characterId: 'morath', targetCharacterId: 'silas_guard' } },
      { id: 'c20-13', text: 'Inquisitor Morath was in row 3 and stood directly adjacent to the Halberd Rack.', constraint: { type: 'character_adjacent_to_object', characterId: 'morath', objectId: 'weapon_rack' } },
      { id: 'c20-14', text: 'Inquisitor Morath was in row 3.', constraint: { type: 'character_in_row', characterId: 'morath', row: 3 } },
      { id: 'c20-15', text: 'Commander Silas was in column 0 and stood directly adjacent to the Halberd Rack.', constraint: { type: 'character_adjacent_to_object', characterId: 'silas_guard', objectId: 'weapon_rack' } },
      { id: 'c20-16', text: 'Commander Silas was in column 0.', constraint: { type: 'character_in_column', characterId: 'silas_guard', column: 0 } },
      { id: 'c20-17', text: 'Envoy Zephyr and Archivist Theresa were both inspecting the Archives Crypt.', constraint: { type: 'characters_same_area', characterId: 'zephyr', targetCharacterId: 'theresa' } },
      { id: 'c20-18', text: 'Envoy Zephyr was in row 3 and stood directly adjacent to the Sealed Treaty Chest.', constraint: { type: 'character_adjacent_to_object', characterId: 'zephyr', objectId: 'iron_archive' } },
      { id: 'c20-19', text: 'Envoy Zephyr was in row 3.', constraint: { type: 'character_in_row', characterId: 'zephyr', row: 3 } },
      { id: 'c20-20', text: 'Archivist Theresa was in column 5 and stood directly adjacent to the Sealed Treaty Chest.', constraint: { type: 'character_adjacent_to_object', characterId: 'theresa', objectId: 'iron_archive' } },
      { id: 'c20-21', text: 'Archivist Theresa was in column 5.', constraint: { type: 'character_in_column', characterId: 'theresa', column: 5 } },
    ],
    victimId: 'marcus_v',
    solution: {
      placements: {
        marcus_v: { row: 0, column: 1 },
        vespera: { row: 0, column: 0 },
        kael: { row: 0, column: 4 },
        lyanna: { row: 1, column: 5 },
        morath: { row: 3, column: 1 },
        silas_guard: { row: 4, column: 0 },
        zephyr: { row: 3, column: 4 },
        theresa: { row: 4, column: 5 },
      },
      murdererId: 'vespera',
    },
  },
]

let allPassed = true

for (const c of cases) {
  const puzzle: Puzzle = {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    difficulty: c.difficulty,
    grid: { width: 6, height: 6 },
    areas: c.areas,
    objects: c.objects,
    characters: c.characters,
    clues: c.clues,
    victimId: c.victimId,
    solution: c.solution,
  }

  const result = validatePuzzle(puzzle)
  if (!result.valid) {
    console.error(`❌ Case ${c.id} failed validation:`)
    for (const e of result.errors) {
      console.error(`  - [${e.code}] ${e.message}`)
    }
    allPassed = false
  } else {
    console.log(`✓ Case ${c.id} validated! Solved uniquely: ${result.solveResult?.isUnique}`)
    const filePath = path.join(puzzlesDir, `${c.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(puzzle, null, 2) + '\n', 'utf-8')
  }
}

if (allPassed) {
  console.log('\nAll 15 cases created and passed validation successfully!')

  // Read all case files in order
  const allCaseFiles = fs.readdirSync(puzzlesDir).filter(f => f.startsWith('case-') && f.endsWith('.json')).sort()
  const metadataList = []
  for (const f of allCaseFiles) {
    const raw = JSON.parse(fs.readFileSync(path.join(puzzlesDir, f), 'utf-8'))
    const victim = raw.characters.find((ch: Character) => ch.role === 'victim')
    const suspects = raw.characters.filter((ch: Character) => ch.role === 'suspect')
    metadataList.push({
      id: raw.id,
      title: raw.title,
      subtitle: raw.subtitle,
      description: raw.description,
      difficulty: raw.difficulty,
      suspectCount: suspects.length,
      victimName: victim?.name,
    })
  }

  const indexPath = path.join(puzzlesDir, 'index.json')
  fs.writeFileSync(indexPath, JSON.stringify(metadataList, null, 2) + '\n', 'utf-8')
  console.log(`Updated index.json with ${metadataList.length} cases!`)
} else {
  console.error('\nSome cases failed validation.')
  process.exit(1)
}

