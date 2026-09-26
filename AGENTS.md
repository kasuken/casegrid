# CaseGrid Agent Guide

This file gives AI coding agents the essential constraints for developing CaseGrid. Read `docs/PRD.md` before substantial product work. The PRD is authoritative; `docs/PRD-SUMMARY.md` is a convenience overview.

## Mission

Build a production-quality, static, browser-based spatial murder-mystery logic game. Prioritize a complete playable vertical slice over scaffolding or speculative infrastructure:

```text
Choose Case → Read Introduction → Start → Place Characters
→ Check Solution → Accuse Murderer → Case Closed
```

Continue from that slice until all five MVP cases and the PRD Definition of Done are satisfied.

## Product invariants

- Every published puzzle is deduction-solvable without guessing.
- Every bundled puzzle has exactly one valid placement solution.
- The solver must verify uniqueness independently of the solution stored in JSON.
- One character occupies one valid cell; no cell contains two characters.
- Object cells are blocked for character placement.
- Adjacency is horizontal or vertical only, never diagonal.
- The murderer is a suspect, never the victim.
- Correct placement is checked only when the player submits, not after each move.
- Player exclusions and clue completion marks are notes, not engine constraints.
- All cases, characters, maps, clues, terminology, and artwork must be original.

Do not weaken these rules to make content easier to author.

## MVP scope

Required:

- Responsive React application with case selection, introduction, gameplay, accusation, and result screens
- At least five original cases with difficulty progression
- Grid maps, logical areas, environmental objects, characters, and structured clues
- Drag-and-drop plus click/tap placement
- Cell exclusions and manual clue completion notes
- Timer, mistake tracking, restart, replay, and local progress persistence
- Independent puzzle engine, puzzle validator, and automated tests
- Static production build compatible with Azure Static Web Apps

Explicit non-goals:

- Backend, API server, database, authentication, accounts, or cloud save
- Multiplayer, leaderboards, payments, subscriptions, ads, or social features
- AI-generated puzzles or clues, LLM integration, procedural generation, or a puzzle editor
- Daily scheduling, notifications, achievements, XP, levels, or native apps

Do not add infrastructure for these non-goals.

## Required stack

- React + TypeScript + Vite
- Tailwind CSS
- Zustand
- dnd-kit
- Zod
- Vitest + React Testing Library
- Playwright
- pnpm workspaces

Use current stable versions when bootstrapping. Do not introduce Nx or another heavyweight monorepo framework. Avoid new dependencies unless they materially reduce complexity.

## Repository boundaries

Target structure:

```text
apps/web/                 UI, routing, state, persistence, puzzle loading
packages/puzzle-engine/  Pure TypeScript domain logic and solver
docs/                    Product documentation
```

The puzzle engine must have no dependency on React, Zustand, Tailwind, the DOM, or browser APIs. Do not put solving, constraint, or puzzle-validation logic in React components.

Puzzle content is JSON under `apps/web/public/puzzles/`. Load metadata from `index.json` and defer full case loading until needed.

## Domain model

Keep explicit strict TypeScript types for:

- `Puzzle`, `GridDefinition`, `Position`, `Area`, `MapObject`, and `Character`
- `PuzzleSolution` with placements and `murdererId`
- `Clue` with display text plus a structured `Constraint`
- `PuzzleProgress` with status, placements, exclusions, solved clues, elapsed time, mistakes, and best time

Use a discriminated union for constraints. Never parse natural-language clue text to determine game rules.

The engine API should expose equivalents of:

```ts
solvePuzzle(puzzle): SolveResult
validatePuzzle(puzzle): ValidationResult
```

`SolveResult` must report solution count, the solution when available, and uniqueness. When checking uniqueness, stop after finding two solutions.

## Puzzle validation

Reject a puzzle unless all of the following hold:

- JSON matches the Zod schema.
- Character, object, and area IDs are unique.
- Victim and murderer references exist; murderer is not the victim.
- All positions are within the grid.
- Solution placements do not overlap or occupy blocked object cells.
- The declared solution satisfies every structured clue.
- The solver finds exactly one solution.
- The solver's solution equals the declared solution.

Provide `pnpm validate:puzzles`, and fail it for malformed, impossible, ambiguous, or inconsistent content.

## UX requirements

- Treat mobile as first-class from 320 px upward.
- Keep the map as the visual focus and make area boundaries and labels clear.
- Support both drag-and-drop and select-character-then-select-cell placement.
- Let players experiment without revealing which specific placements are wrong.
- Pause the timer while the tab is hidden when practical.
- Persist in-progress state safely and recover from corrupt local storage without a blank screen.
- Confirm destructive puzzle reset.
- Handle invalid routes, missing/invalid puzzle JSON, and solver failures with useful UI states.

## Visual direction

Aim for a warm, approachable, editorial mystery-board aesthetic with strong typography and original illustrated character treatment. It should feel like a game, not a SaaS dashboard.

Avoid generic card grids, excessive gradients, glassmorphism, neon cyberpunk, overly dark horror styling, and gore.

Relevant repository skills are available under the platform-specific skill directories:

- `frontend-design` for new UI and substantial visual refinement
- `canvas-design` for original static visual assets
- `vercel-react-best-practices` when writing or reviewing React code

Follow a relevant skill when the task matches its description.

## Accessibility and performance

- Provide keyboard navigation and visible focus states.
- Use accessible names for controls and practical screen-reader labels.
- Do not require drag-and-drop.
- Do not encode state with color alone.
- Maintain sufficient contrast and responsive text.
- Target interaction latency below 100 ms and solver completion below 500 ms for bundled cases.
- Keep the initial load below 2 MB where practical and lazy-load puzzle data.

## Testing requirements

Write tests as engine behavior is implemented. Cover at minimum:

- Position and area utilities
- Orthogonal adjacency and object adjacency
- Every supported constraint type
- Backtracking and constraint pruning
- Unique, multiple, and impossible solution outcomes
- Full puzzle validation
- Every bundled puzzle's uniqueness and declared solution

Playwright must cover:

1. Complete Case 1, submit the correct arrangement, accuse the murderer, and reach `CASE CLOSED`.
2. Start a case, place characters, refresh, and retain progress.
3. Use a mobile viewport to select a character and tap a cell.

Before declaring a change complete, run the checks relevant to it. Before MVP delivery, all of these equivalent commands must pass:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:puzzles
pnpm test:e2e
pnpm build
```

## Implementation order

1. Workspace, React app, routing, styling, and page shells
2. Domain types, Zod schemas, grid utilities, and constraint union
3. Constraint evaluation, backtracking solver, validation, and tests
4. One uniquely solvable tutorial case
5. Complete playable UI and game flow
6. Persistence, reset, timer, and completion tracking
7. Four additional validated cases
8. Responsive, accessibility, error-state, and visual polish
9. Full test suite, production build, and Azure SPA configuration

## Working rules

- Keep TypeScript strict and avoid `any`.
- Prefer small focused components and pure engine functions.
- Do not duplicate constraint logic between the UI and engine.
- Do not hard-code puzzle content in application components.
- Preserve user work and unrelated changes in a dirty worktree.
- Run relevant tests after meaningful changes and fix failures before proceeding.
- Update documentation when architecture, commands, puzzle format, or scope changes.
- Do not stop after scaffolding when the requested milestone requires working behavior.
- When requirements are ambiguous, choose the simplest implementation that satisfies the PRD without expanding scope.
