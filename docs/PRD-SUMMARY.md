# CaseGrid PRD Summary

## Product

CaseGrid is a mobile-friendly browser game that combines classic logic-grid deduction with a spatial murder mystery. Each case presents a grid-based map, rooms, environmental objects, a victim, suspects, and structured clues. The player places every character, checks the arrangement, and then accuses the suspect who was alone with the victim.

The intended session length is 5–15 minutes. The rules should be understandable in about one minute, and every case must be solvable without guessing.

## MVP outcome

The MVP is complete when a player can:

1. Choose from at least five original cases.
2. Read a case introduction and start the investigation.
3. Inspect a clear board-game-style map and its clues.
4. Place and move characters by drag-and-drop or click/tap.
5. Mark cells as excluded and clues as solved for note-taking.
6. Refresh without losing progress.
7. Submit the completed arrangement without receiving premature solution hints.
8. Accuse a suspect after the arrangement is correct.
9. See the case result, elapsed time, hints, and mistakes.
10. Replay the case or return to case selection.

## Core rules

- Every bundled puzzle has exactly one valid solution.
- A character occupies exactly one valid cell, and a cell holds at most one character.
- Environmental-object cells are blocked from character placement.
- Adjacency is orthogonal only; diagonals do not count.
- The declared JSON solution is independently verified by the solver.
- The murderer is the suspect who shares the victim's area alone.
- Player exclusions and solved-clue marks are notes only and do not affect validation.
- The hidden solution must not be checked after every move.

## Technology and architecture

- React, TypeScript, and Vite
- Tailwind CSS
- Zustand for game state
- dnd-kit for drag-and-drop
- Zod for puzzle-data validation
- Vitest and React Testing Library for unit/component tests
- Playwright for critical user journeys
- pnpm workspaces in a lightweight monorepo
- Static SPA deployment to Azure Static Web Apps
- No backend, authentication, database, server-side rendering, or cloud dependency

The repository should contain:

```text
apps/web/                 React application
packages/puzzle-engine/  Framework-independent TypeScript engine
docs/                    Product documentation
```

The puzzle engine must not depend on React, browser APIs, the DOM, Tailwind, Zustand, or UI components. Puzzle content belongs in JSON files, not application code.

## Puzzle engine

The engine owns domain types, constraint evaluation, placement validation, deterministic backtracking, solution counting, and full puzzle validation. It must stop after two solutions when only uniqueness matters.

Required constraint families include:

- Character in/not in an area
- Character at a position, row, or column
- Character adjacent/not adjacent to another character
- Character adjacent/not adjacent to an object
- Characters in the same/different areas
- Character alone in an area
- Exactly N characters in an area

Validation must reject malformed schemas, duplicate IDs, missing victim or murderer references, invalid positions, overlapping solution placements, clues contradicted by the declared solution, impossible puzzles, and ambiguous puzzles.

## Content

Ship at least five original cases with a beginner-to-medium progression. The first case doubles as a tutorial. A typical case has 5–8 characters, a 5×5 to 8×8 grid, 3–6 areas, 4–10 objects, and 6–15 clues.

Puzzle JSON files live under `apps/web/public/puzzles/`, with a lightweight `index.json` for case-selection metadata. A development command must validate every case and fail unless each one has exactly one solution matching its declared solution.

## Experience and visual direction

The map is the visual focus. The interface should feel like a warm, editorial, illustrated board game—not a corporate dashboard, generic SaaS template, neon cyberpunk product, or graphic horror experience. It must work from 320 px mobile screens through large desktop layouts.

Accessibility requirements include keyboard navigation, visible focus, adequate contrast, accessible labels, a non-drag placement path, and state indicators that do not rely on color alone.

## Persistence and routing

Use `localStorage` for active placements, exclusions, clue notes, status, elapsed time, mistakes, and best time. Handle corrupt stored data safely.

Required routes:

- `/` — case selection
- `/case/:caseId` — introduction and gameplay
- `/case/:caseId/result` — completed case result

Direct route navigation must work with Azure Static Web Apps SPA fallback configuration.

## Quality bar

- TypeScript strict mode
- Pure, tested puzzle-engine functions where possible
- Small focused React components
- No `any`, duplicated constraint logic, or game rules embedded in JSX
- Unit coverage for every constraint, solver outcome, and puzzle validator
- Automated uniqueness and declared-solution checks for every bundled puzzle
- Playwright coverage for the full winning flow, persistence after refresh, and mobile tap placement
- Successful lint, typecheck, test, puzzle validation, end-to-end test, and production build

The complete requirements and Definition of Done remain in [PRD.md](PRD.md).
