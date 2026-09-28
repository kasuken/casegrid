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

## Player Controls

| Control | Behaviour |
|---|---|
| Home entry point | New players see "Solve your first mystery". Players with an active investigation see "Resume investigation" for the most recently saved case. Players who have only finished cases see their next unsolved case. The full catalog stays below. |
| Onboarding guide | Shown on the first case (authored `tutorial` steps) after Start Investigation. It advances as the player selects, places, takes notes, and marks clues, or with Next, and it never highlights answers. Skip or finish is remembered per case in `localStorage` (`casegrid_onboarding_v1`); corrupt data falls back to showing the skippable guide. Reopen it from Case File → "Show the guide again". |
| Result screen | Shown only once the case is closed. It shows the CASE CLOSED stamp, the authored `resolution`, and "See the deductions" (the authored walkthrough with clue numbers). "Open the next case" picks the next unsolved published case in catalog order, or "Resume case NN" if that case is already in progress; nothing is overwritten. Replay, browsing, time, mistakes, and best time remain. A direct visit to `/case/:id/result` for an unsolved case reveals nothing. |
| Case of the Week | Home shows the case scheduled in `public/puzzles/schedule.json` for the current week. Weeks switch at Monday 00:00 UTC. It uses the normal `/case/<id>` link and progress, and shows a fallback message when nothing is scheduled. See `docs/content/weekly-schedule.md` for the format, validation, and editorial checklist. |
| Challenge a friend | On a closed case, builds a spoiler-free share: case number and title, CASE CLOSED, time, mistakes, the nudge count when the case has nudges, "Can you solve this case?", and the canonical `/case/<id>` link with no parameters. A 1080×1080 card image is drawn on demand (the renderer is lazy-loaded) and has a text alternative. The Web Share API is used when available (with the image where supported). Copy and download are fallbacks. A cancelled share reports neither success nor error. A share is only a hand-off to the device's share sheet; it is **not** evidence of delivery, recipient play, or a verified score. |
| Case File | Re-read the briefing and How to play at any time during an investigation. |
| Keyboard | Tab to a portrait or cell. Enter selects a portrait or places the selected person. Space picks a portrait up for keyboard dragging (arrow keys, then Space or Enter to drop). |
| Place | Select a person, then tap an open cell, or drag them. Placing on an occupied cell sends its occupant back to the tray. |
| Exclude Note | Marks cells where the selected person cannot be. Notes are for the player only. |
| Clue marks | Tap a clue to tick it off. Also a note only. |
| Nudges ("Need a nudge?") | Optional, hand-authored `helpPrompts` shown one at a time, general to specific, in the clue panel. Each names the clues worth combining and never checks the board, names a wrong placement, or reveals a cell. Revealed nudges stay listed. The distinct count is saved as `revealedHelpIds` on progress; older saves without the field load as zero. It appears on the result screen as "Nudges Used" and is cleared by reset or replay. Cases without authored nudges hide the panel. |
| Undo (`Ctrl`/`⌘`+`Z`) | Reverts the last successful placement, move, removal, exclusion, or clue mark. Rejected actions (for example, placing on an object) are not recorded. Undo never touches submissions, accusations, mistakes, time, completion, or best times. History is **session-only**: it holds up to 100 steps, is cleared on case change, reset, replay, or a successful check, and is lost on refresh. The restored board itself is saved normally. The shortcut is ignored while typing in a text field. |

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
9. `schedule.json`: Monday-aligned, ascending weeks that feature only published cases.

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

Production is the Free-tier Static Web App `swa-casegrid` (resource group `rg-casegrid`, West Europe). `.github/workflows/deploy.yml` validates puzzles, builds, and uploads `apps/web/dist` on every push to `main`, using the `AZURE_STATIC_WEB_APPS_API_TOKEN` repository secret.
