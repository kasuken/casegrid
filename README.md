# CaseGrid

> **Solve the scene. Find the killer.**

CaseGrid is a browser-based spatial murder-mystery logic puzzle game. Each case presents a floor plan, rooms, environmental objects, a victim, suspects, and witness clues. Using spatial deduction, the player places every suspect into their correct location and deduces who was alone in the room with the victim.

The project is built as a static Single Page Application (SPA) deployable to Azure Static Web Apps, with an independent, pure TypeScript puzzle engine and deterministic backtracking solver.

---

## Architecture

The repository is structured as a lightweight pnpm monorepo:

```text
casegrid/
├── apps/
│   └── web/                  # React + TypeScript + Vite SPA
│       ├── public/
│       │   ├── puzzles/      # Bundled case JSON files and index.json
│       │   └── staticwebapp.config.json
│       ├── src/
│       │   ├── app/          # App root and React Router definitions
│       │   ├── components/   # UI components (board, tokens, clues, modals)
│       │   ├── pages/        # HomePage, CasePage, ResultPage, NotFoundPage
│       │   ├── services/     # Puzzle loader and localStorage persistence
│       │   ├── stores/       # Zustand game state store
│       │   └── styles/       # Tailwind CSS & mystery-board editorial theme
│       └── e2e/              # Playwright end-to-end critical journeys
│
├── packages/
│   └── puzzle-engine/        # Pure TypeScript domain logic & solver
│       ├── src/
│       │   ├── types.ts      # Strict domain models & discriminated union
│       │   ├── schemas.ts    # Zod schemas for runtime validation
│       │   ├── grid.ts       # Orthogonal adjacency, bounds, area lookups
│       │   ├── constraints.ts# Constraint evaluation & partial pruning
│       │   ├── solver.ts     # Deterministic backtracking solver with MRV
│       │   ├── validator.ts  # Rigorous schema, domain, and uniqueness validator
│       │   └── deduction.ts  # Authoring aid: step-by-step deduction path analysis
│       ├── scripts/          # CLI puzzle validation tool
│       └── tests/            # Vitest unit & integration tests
│
└── docs/                     # Product requirements, summaries, and asset docs
```

The puzzle engine has **zero dependencies** on React, Zustand, Tailwind, the DOM, or browser APIs. All game rules and spatial evaluations are handled by the pure engine.

---

## Core Product Invariants

1. **Pure Deduction**: Every bundled puzzle is deduction-solvable without guessing.
2. **Unique Solution**: Every puzzle has exactly one valid arrangement confirmed by the solver.
3. **No Overlaps**: One character occupies exactly one valid cell; environmental object cells are blocked.
4. **Orthogonal Adjacency**: Adjacency is strictly horizontal or vertical (diagonals never count).
5. **Murderer Derivation**: The murderer is the suspect alone in the victim's area.
6. **No Spoilers**: Solution verification occurs upon explicit submission, never after every move.

---

## Requirements

- **Node.js**: v22+ (tested on Node 26.8.1)
- **pnpm**: v11+ (or via corepack/mise)

---

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the local development server:**
   ```bash
   pnpm dev
   ```
   Open `http://localhost:5173` to play in your browser.

---

## Available Commands

| Command | Description |
|---|---|
| `pnpm dev` | Starts the Vite development server for `@casegrid/web` |
| `pnpm build` | Compiles TypeScript and builds production assets |
| `pnpm lint` | Runs `oxlint` across all workspaces |
| `pnpm typecheck` | Validates TypeScript in strict mode across workspaces |
| `pnpm test` | Runs Vitest unit & component test suites |
| `pnpm test:e2e` | Runs Playwright critical journeys (desktop & mobile) |
| `pnpm validate:puzzles` | Validates all bundled case JSON files and proves unique solutions |
| `pnpm audit:cases` | Prints per-case metrics and whether each case yields to step-by-step deduction (`-- --trace case-001` for one case) |

---

## Puzzle Format & Authoring

Case files are stored under `apps/web/public/puzzles/case-*.json`. Each case specifies:

- `id`: Unique identifier (e.g. `case-001`)
- `title`, `subtitle`, `description`: Narrative context
- `difficulty`: `'beginner' | 'easy' | 'medium' | 'hard' | 'expert'`
- `grid`: `{ width, height }` (zero-based coordinates)
- `areas`: Logical rooms/zones with `id`, `name`, and `cells`
- `objects`: Map elements with `id`, `type`, `label`, and `position`
- `characters`: `id`, `name`, `description`, `role` (`'suspect'` or `'victim'`)
- `clues`: Structured clues with display `text` and engine `constraint`
- `victimId`: ID of the victim
- `solution`: Declared placements and `murdererId`

Optional authored content (PRD section 62), validated by the engine:

- `resolution`: Ending text shown only after CASE CLOSED
- `deductions`: Ordered walkthrough steps (`text`, `clueIds`) shown behind "See the deductions" after completion
- `helpPrompts`: Ordered nudges (`id`, `text`, `clueIds`). They explain what evidence to combine and never name an answer cell
- `tutorial`: Onboarding steps (`id`, `title`, `text`, `advanceOn`), where `advanceOn` is `manual`, `select`, `place`, `exclude`, or `clue`

Clue text is presentation only, but it must quote coordinates 1-based (row 1 is the top row) to match what players see. A test enforces this.

### Authoring workflow

1. Edit or add `apps/web/public/puzzles/case-*.json` and its `index.json` entry.
2. Run `pnpm validate:puzzles` for schema, references, and uniqueness.
3. Run `pnpm audit:cases -- --trace <case-id>` to confirm the case yields to step-by-step deduction, then write its `deductions` walkthrough from the trace.
4. Run `pnpm test` to check deduction, uniqueness, and clue-text consistency for every case.
5. Record the case in `docs/content/case-audit.md` and playtest it before publishing.

### Supported Constraint Types

Constraints are represented as a discriminated union:

- `character_in_area` / `character_not_in_area`
- `character_at_position`
- `character_in_row` / `character_in_column`
- `character_adjacent_to_character` / `character_not_adjacent_to_character`
- `character_adjacent_to_object` / `character_not_adjacent_to_object`
- `characters_same_area` / `characters_different_area`
- `character_alone_in_area`
- `exactly_n_characters_in_area`

### Validating Puzzles

Run:
```bash
pnpm validate:puzzles
```
The validator checks:
1. Zod schema validation
2. Unique character, area, object, and clue IDs
3. Boundary checks and blocked-object cell exclusivity
4. Area cell exclusivity (no overlapping rooms)
5. Satisfaction of every clue by the declared solution
6. Murderer logic rule (alone with the victim in the victim's area)
7. Authored walkthroughs and nudges reference real clue IDs; nudge and tutorial IDs are unique
8. Independent backtracking solver verification proving **exactly 1 unique solution** matching the declared solution.

---

## Azure Static Web Apps Deployment

The web application compiles to pure static HTML/CSS/JS in `apps/web/dist`. It requires no backend, Node server, database, or container runtime.

Direct route navigation (e.g. `/case/case-001` or `/case/case-001/result`) is handled via `staticwebapp.config.json` with client-side SPA navigation fallback:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/puzzles/*", "*.{svg,png,jpg,ico,json}"]
  }
}
```

To deploy via Azure CLI or GitHub Actions:
- **App location**: `apps/web`
- **Output location**: `dist`
