# CaseGrid
## Product Requirements Document

**Version:** 0.1  
**Status:** MVP  
**Platform:** Web  
**Working Product Name:** CaseGrid  
**Primary Goal:** Build the first fully playable version of a spatial murder-mystery logic puzzle game.

---

# 1. Product Summary

CaseGrid is a browser-based logic puzzle game inspired by classic logic-grid puzzles, Sudoku-style deduction, and spatial mystery games.

Each puzzle presents:

- A map divided into grid cells and rooms/areas
- A victim
- Several suspects
- Environmental objects
- A set of clues
- One logically valid arrangement of all characters
- One murderer

The player must use the clues to determine where every suspect was located.

Once all deductions are complete, the player identifies which suspect was alone with the victim.

That suspect is the murderer.

The first version should focus entirely on making this core gameplay loop enjoyable.

Do not build accounts, multiplayer, payments, social features, AI-generated puzzles, or a backend in the MVP.

---

# 2. Product Vision

The long-term product could become a daily puzzle game similar in retention model to Wordle or Sudoku apps.

The eventual experience could include:

- Daily mysteries
- Puzzle packs
- Difficulty progression
- Procedurally generated puzzles
- Community-created puzzles
- Competitive solving times
- Shareable results
- Themed environments
- User progression

None of these are required for the first MVP unless explicitly described in this document.

---

# 3. Product Principles

The MVP must follow these principles.

| Principle | Meaning |
|---|---|
| Logic first | Puzzle correctness matters more than visual complexity |
| No guessing | Every puzzle must be solvable through deduction |
| One solution | Every published puzzle must have exactly one valid solution |
| Fast interaction | Moving suspects around must feel immediate |
| Mobile-friendly | The game must work well on phones and desktop |
| Offline-friendly | The core game should not require a backend |
| Content-driven | New puzzles should be JSON data rather than application code |
| Engine separated from UI | Puzzle logic must not depend on React |

---

# 4. Intellectual Property Requirement

The application may be inspired by physical spatial logic puzzle books, but it must have its own identity.

Do not copy:

- Existing puzzle names
- Existing characters
- Existing illustrations
- Existing maps
- Existing clue text
- Existing visual branding
- Existing layouts exactly

Create original maps, characters, themes, UI, terminology, and artwork.

---

# 5. Target User

Primary user:

A player who enjoys:

- Sudoku
- Logic puzzles
- Detective games
- Escape-room puzzles
- Deduction games
- Short daily brain games

Typical play session:

5 to 15 minutes.

The player should be able to understand the basic rules within approximately one minute.

---

# 6. Core Gameplay

The primary gameplay flow is:

```text
Home
  ↓
Choose Case
  ↓
Read Introduction
  ↓
Inspect Map
  ↓
Read Clues
  ↓
Place Suspects
  ↓
Refine Placements
  ↓
Submit Solution
  ↓
Choose Murderer
  ↓
Result
```

The puzzle is solved when:

1. Every character is correctly positioned.
2. The player identifies the suspect who was alone with the victim.

---

# 7. Example Puzzle

Example scenario:

## The Last Espresso

Marco, owner of a small café, has been found dead after closing time.

Six people were still inside the building.

Determine where everybody was standing and discover who was alone with Marco.

### Characters

| Character | Role |
|---|---|
| Marco | Victim |
| Anna | Suspect |
| James | Suspect |
| Sofia | Suspect |
| Leo | Suspect |
| Maya | Suspect |
| Daniel | Suspect |

### Example clues

- Anna was beside a window.
- James was somewhere in the kitchen.
- Sofia was not beside James.
- Leo was in column 4.
- Maya was beside a plant.
- Daniel was alone in a room.
- Marco shared his room with exactly one other person.

After satisfying every clue, exactly one suspect should share Marco's room.

That suspect is the murderer.

This example is illustrative only. Create original MVP cases.

---

# 8. MVP Scope

The MVP must contain:

| Feature | Required |
|---|---:|
| React web application | Yes |
| Responsive UI | Yes |
| Puzzle selection screen | Yes |
| At least 5 puzzles | Yes |
| Grid-based maps | Yes |
| Rooms/areas | Yes |
| Environmental objects | Yes |
| Suspect placement | Yes |
| Drag and drop | Yes |
| Tap/click placement alternative | Yes |
| Clue display | Yes |
| Placement validation | Yes |
| Final murderer accusation | Yes |
| Puzzle completion screen | Yes |
| Restart puzzle | Yes |
| Local progress persistence | Yes |
| Difficulty label | Yes |
| Puzzle engine | Yes |
| Automated tests | Yes |
| Backend | No |
| Authentication | No |
| Database | No |
| AI generation | No |
| Multiplayer | No |
| Payments | No |
| Leaderboards | No |

---

# 9. Technology Stack

Use the following stack unless there is a strong technical reason not to.

## Frontend

```text
React
TypeScript
Vite
```

Use current stable versions.

## Styling

Use:

```text
Tailwind CSS
```

Optional:

```text
shadcn/ui
```

Use shadcn/ui only where useful.

Do not turn the interface into a generic SaaS dashboard.

This is a game.

## State Management

Use:

```text
Zustand
```

Keep transient game state outside React component trees where reasonable.

## Drag and Drop

Use:

```text
dnd-kit
```

The application must also support placement without drag and drop.

## Validation

Use:

```text
Zod
```

Use it to validate puzzle JSON files.

## Testing

Use:

```text
Vitest
React Testing Library
Playwright
```

## Hosting

The application will ultimately be deployed to:

```text
Azure Static Web Apps
```

The MVP must therefore work as a static SPA.

No server dependency.

---

# 10. Repository Architecture

Use a monorepo-style structure even if the repository initially contains only one application.

Recommended structure:

```text
casegrid/

├── apps/
│   └── web/
│       ├── src/
│       ├── public/
│       └── package.json
│
├── packages/
│   └── puzzle-engine/
│       ├── src/
│       ├── tests/
│       └── package.json
│
├── package.json
├── README.md
└── .gitignore
```

Use npm workspaces, pnpm workspaces, or an equivalent lightweight workspace solution.

Prefer pnpm if no package manager already exists.

Do not introduce Nx or another heavyweight monorepo framework for this MVP.

---

# 11. Web Application Architecture

Recommended structure:

```text
apps/web/src/

├── app/
│   ├── App.tsx
│   └── router.tsx
│
├── components/
│   ├── game/
│   ├── grid/
│   ├── clues/
│   ├── characters/
│   └── common/
│
├── pages/
│   ├── HomePage.tsx
│   ├── CasePage.tsx
│   └── ResultPage.tsx
│
├── stores/
│   └── gameStore.ts
│
├── services/
│   ├── puzzleLoader.ts
│   └── progressStorage.ts
│
├── models/
│
├── hooks/
│
└── styles/
```

Do not place puzzle-solving logic inside React components.

---

# 12. Puzzle Engine Architecture

The puzzle engine must live in:

```text
packages/puzzle-engine
```

It must have no dependency on:

- React
- Browser APIs
- DOM
- Tailwind
- Zustand
- UI components

The engine should be usable independently.

Example:

```typescript
import { solvePuzzle } from "@casegrid/puzzle-engine";

const result = solvePuzzle(puzzle);

console.log(result.solutionCount);
console.log(result.solution);
```

Expected result shape:

```typescript
interface SolveResult {
  solutionCount: number;
  solution?: PuzzleSolution;
  isUnique: boolean;
}
```

---

# 13. Puzzle Domain Model

The core domain should contain the following concepts.

## Puzzle

```typescript
interface Puzzle {
  id: string;
  title: string;
  subtitle?: string;
  description: string;

  difficulty:
    | "beginner"
    | "easy"
    | "medium"
    | "hard"
    | "expert";

  grid: GridDefinition;

  areas: Area[];

  objects: MapObject[];

  characters: Character[];

  clues: Clue[];

  victimId: string;

  solution: PuzzleSolution;
}
```

---

# 14. Grid Model

Example:

```typescript
interface GridDefinition {
  width: number;
  height: number;
}
```

Coordinates should use:

```typescript
interface Position {
  row: number;
  column: number;
}
```

Use zero-based coordinates internally.

UI labels may use one-based coordinates where appropriate.

---

# 15. Areas

An area represents a logical room or zone.

Example:

```typescript
interface Area {
  id: string;
  name: string;

  cells: Position[];
}
```

Example:

```json
{
  "id": "kitchen",
  "name": "Kitchen",
  "cells": [
    { "row": 0, "column": 0 },
    { "row": 0, "column": 1 },
    { "row": 1, "column": 0 },
    { "row": 1, "column": 1 }
  ]
}
```

A grid cell must belong to zero or one area in the MVP.

---

# 16. Environmental Objects

Objects are static map elements.

Examples:

- Window
- Plant
- Table
- Bed
- Sofa
- Fireplace
- Bookshelf
- Piano
- Desk
- Fountain

Model:

```typescript
interface MapObject {
  id: string;
  type: string;
  label?: string;
  position: Position;
}
```

---

# 17. Characters

```typescript
interface Character {
  id: string;
  name: string;
  description?: string;

  role: "suspect" | "victim";

  avatar?: string;
}
```

Characters should have visually distinct avatars.

For the MVP, use original simple illustrated avatars or generated placeholders.

Do not rely on external image URLs.

---

# 18. Solution Model

```typescript
interface PuzzleSolution {
  placements: Record<string, Position>;
  murdererId: string;
}
```

Example:

```json
{
  "placements": {
    "anna": {
      "row": 1,
      "column": 3
    },
    "james": {
      "row": 4,
      "column": 2
    }
  },
  "murdererId": "james"
}
```

---

# 19. Constraint System

Represent clues internally as structured constraints.

Do not implement clue validation using natural-language parsing.

Natural language is presentation only.

Every clue should contain structured data.

Example:

```typescript
interface Clue {
  id: string;
  text: string;
  constraint: Constraint;
}
```

---

# 20. Initial Constraint Types

Implement at least the following constraint types.

```text
CharacterInArea
CharacterNotInArea

CharacterAtPosition

CharacterInRow
CharacterInColumn

CharacterAdjacentToCharacter
CharacterNotAdjacentToCharacter

CharacterAdjacentToObject
CharacterNotAdjacentToObject

CharactersSameArea
CharactersDifferentArea

CharacterAloneInArea

ExactlyNCharactersInArea
```

Recommended TypeScript discriminated union:

```typescript
type Constraint =
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
  | ExactlyNCharactersInAreaConstraint;
```

---

# 21. Adjacency Definition

For MVP purposes:

Adjacent means horizontally or vertically adjacent.

Diagonal cells are NOT adjacent.

For:

```text
A X
```

or:

```text
A
X
```

A and X are adjacent.

For:

```text
A .
. X
```

they are not adjacent.

Implement this behavior consistently.

---

# 22. Character Placement Rules

For the MVP:

- One character per grid cell
- Characters can occupy cells containing environmental objects only if explicitly allowed by future rules
- For now, object cells should be blocked from character placement
- Every character must occupy exactly one valid cell
- Every character must satisfy all applicable constraints

The engine must reject illegal placements.

---

# 23. Solver

Implement a deterministic constraint solver.

Recommended first implementation:

```text
Backtracking
+
Constraint pruning
```

Do not introduce an external constraint-solving framework unless necessary.

The puzzle sizes in the MVP should be small enough that a TypeScript backtracking solver performs well.

The solver must support:

```typescript
solvePuzzle(puzzle)
```

It must determine:

```typescript
solutionCount
```

Stop searching after finding at least 2 solutions if only uniqueness needs to be determined.

Conceptually:

```typescript
if (solutionCount === 0) {
  // invalid puzzle
}

if (solutionCount === 1) {
  // valid puzzle
}

if (solutionCount > 1) {
  // ambiguous puzzle
}
```

Every bundled puzzle must have:

```text
solutionCount === 1
```

---

# 24. Puzzle Validation

Add:

```typescript
validatePuzzle(puzzle)
```

Validation should verify:

- Puzzle schema is valid
- Every character ID is unique
- Every object ID is unique
- Every area ID is unique
- Victim exists
- Murderer exists
- Murderer is not the victim
- Placements are inside the grid
- No two solution characters occupy the same cell
- Solution satisfies every clue
- Puzzle has exactly one valid solution

---

# 25. Puzzle Storage

Store MVP puzzles as JSON.

Recommended location:

```text
apps/web/public/puzzles/
```

Example:

```text
puzzles/
├── index.json
├── case-001.json
├── case-002.json
├── case-003.json
├── case-004.json
└── case-005.json
```

`index.json` should contain puzzle metadata used on the home page.

Example:

```json
[
  {
    "id": "case-001",
    "title": "The Last Espresso",
    "difficulty": "beginner"
  }
]
```

The application should load the complete puzzle only when needed.

---

# 26. Required MVP Cases

Create at least five original cases.

Suggested progression:

| Case | Difficulty |
|---|---|
| Case 1 | Beginner |
| Case 2 | Easy |
| Case 3 | Easy |
| Case 4 | Medium |
| Case 5 | Medium |

The first puzzle should effectively function as a tutorial.

Each case should have approximately:

```text
5 to 8 characters
5x5 to 8x8 grid
3 to 6 areas
4 to 10 objects
6 to 15 clues
```

Adjust if necessary for good puzzle design.

---

# 27. Home Screen

The home screen should show:

```text
CaseGrid

Solve the scene.
Find the killer.
```

Below it display available cases.

Each case card should show:

- Case number
- Title
- Difficulty
- Completion state
- Best completion time if solved

Example:

```text
CASE 01

The Last Espresso

Beginner

Solved
04:32
```

Selecting the card opens the puzzle.

---

# 28. Case Introduction

Before gameplay starts, display:

- Case title
- Short story introduction
- Victim
- Number of suspects
- Difficulty

Example:

```text
THE LAST ESPRESSO

Marco Bellini was found dead shortly after
closing his café.

Six people remained inside.

Determine where everyone was standing and
discover who was alone with Marco.

[ Start Investigation ]
```

The timer should begin only after pressing Start Investigation.

---

# 29. Main Game Layout

Desktop layout:

```text
┌─────────────────────────────────────────────┐
│ Case title                    Timer  06:42  │
├───────────────┬─────────────────────────────┤
│               │                             │
│ SUSPECTS      │                             │
│               │                             │
│ Anna          │             MAP             │
│ James         │                             │
│ Sofia         │                             │
│ Leo           │                             │
│               │                             │
├───────────────┼─────────────────────────────┤
│ CLUES         │                             │
│               │                             │
│ 1. Anna ...   │                             │
│ 2. James ...  │                             │
│ 3. Sofia ...  │                             │
│               │                             │
└───────────────┴─────────────────────────────┘
```

The exact visual implementation may differ.

Do not make it look like a business dashboard.

The map must remain the visual focus.

---

# 30. Mobile Layout

Mobile is a first-class requirement.

Recommended structure:

```text
Case title / timer

MAP

Characters

CLUES

Actions
```

Characters may be horizontally scrollable.

Clues may appear in a collapsible drawer or bottom sheet.

The map must fit the viewport without requiring horizontal page scrolling.

---

# 31. Character Placement Interaction

Support two mechanisms.

## Drag and drop

Drag a character avatar onto a valid grid cell.

## Click/tap

1. Select a character.
2. Select a grid cell.
3. Place the selected character.

This makes the game usable on touch devices and improves accessibility.

Placed characters can be moved.

---

# 32. Character Tray

Characters not currently positioned should appear in a character tray.

Example:

```text
SUSPECTS

[ Anna ]
[ James ]
[ Sofia ]
[ Leo ]
```

After placing Anna:

```text
SUSPECTS

[ James ]
[ Sofia ]
[ Leo ]
```

Alternatively, keep Anna visible but visually marked as placed.

Choose whichever interaction is clearer.

---

# 33. Map Rendering

The map should feel like a board game, not a spreadsheet.

Each cell should clearly communicate:

- Room/area
- Environmental objects
- Character
- Selected state
- Valid drop state

Area boundaries should be visually stronger than normal cell boundaries.

Area names should be visible.

Example:

```text
┌─────────────┬───────────────┐
│             │               │
│  BEDROOM    │   BATHROOM    │
│             │               │
├─────────────┼───────────────┤
│                             │
│        LIVING ROOM          │
│                             │
├───────────────┬─────────────┤
│    STUDY      │   KITCHEN   │
└───────────────┴─────────────┘
```

---

# 34. Clue Panel

Display clues clearly.

Example:

```text
CLUES

01 Anna was beside a window.

02 James was somewhere in the kitchen.

03 Sofia was not beside James.

04 Leo was in column four.

05 Maya was beside a plant.
```

Players should be able to manually mark clues as:

```text
Unresolved
Solved
```

This marking is only a note-taking feature.

The application should not automatically reveal whether a clue has actually been solved.

---

# 35. Player Notes

The MVP should provide lightweight deduction assistance.

Allow the player to mark cells as impossible for a selected character.

Conceptually:

```text
Possible
Excluded
Confirmed
```

Do not build an excessively complex notes system.

At minimum allow:

```text
Character + Cell = Excluded
```

These marks should have no effect on puzzle validation.

They are player notes only.

---

# 36. Submit Solution

Provide:

```text
CHECK SOLUTION
```

Do not validate every character move immediately against the hidden solution.

Players are allowed to experiment.

When Check Solution is pressed:

### If incorrect

Show:

```text
Something is not quite right.

3 placements still conflict with the clues.
```

Do not reveal which characters are incorrect by default.

Allow the player to continue.

### If correct

Proceed to murderer accusation.

---

# 37. Murderer Accusation

Once the arrangement is correct:

```text
Everyone is in the right place.

Who murdered Marco?
```

Display all suspects.

The player selects one.

Then presses:

```text
ACCUSE
```

---

# 38. Winning State

If correct:

```text
CASE CLOSED

James was alone with Marco.

Time
06:42

Hints
0

Mistakes
1
```

Actions:

```text
Back to Cases
Replay Case
```

Do not implement social sharing yet.

---

# 39. Incorrect Accusation

If accusation is incorrect:

```text
That does not fit the evidence.

Review the scene and try again.
```

Return the player to the accusation screen.

Track the mistake count.

---

# 40. Timer

Start timing when the player begins the investigation.

Pause timing if the browser tab becomes hidden if practical.

Store elapsed time.

The timer does not need competitive-grade anti-cheat behavior.

---

# 41. Local Persistence

Use browser storage.

Recommended:

```text
localStorage
```

Persist:

```typescript
interface PuzzleProgress {
  puzzleId: string;

  status:
    | "not-started"
    | "in-progress"
    | "completed";

  placements: Record<string, Position>;

  exclusions: Record<string, Position[]>;

  solvedClueIds: string[];

  elapsedSeconds: number;

  mistakes: number;

  bestTime?: number;
}
```

Reloading the browser must not destroy active progress.

---

# 42. Reset

Provide a Reset Puzzle action.

Require confirmation.

Example:

```text
Reset this investigation?

Your current placements and notes will be removed.

Cancel
Reset
```

---

# 43. Visual Direction

The game should have a modern illustrated mystery-board aesthetic.

Desired characteristics:

- Warm
- Slightly playful
- Clear
- Editorial
- Board-game inspired
- Strong typography
- Illustrated characters
- Distinctive rooms

Avoid:

- Corporate dashboard aesthetics
- Excessive gradients
- Glassmorphism
- Generic SaaS cards everywhere
- Neon cyberpunk styling
- Overly dark horror styling

The murder theme should remain approachable rather than graphic.

No gore is required.

---

# 44. Accessibility

At minimum:

- Keyboard navigation
- Visible focus states
- Sufficient contrast
- Buttons must have accessible labels
- Do not require drag and drop
- Do not encode game state using color alone
- Responsive text
- Screen-reader labels where practical

---

# 45. Responsive Requirements

Target widths:

```text
Mobile: 320px+
Tablet: 768px+
Desktop: 1024px+
Large desktop: 1440px+
```

Primary test targets:

```text
iPhone-sized viewport
iPad-sized viewport
1440px desktop
```

---

# 46. Performance

Target:

```text
Initial load < 2 MB where practical
Interaction latency < 100 ms
Solver response < 500 ms for bundled puzzles
```

Avoid unnecessary large dependencies.

Lazy-load puzzle data where practical.

---

# 47. Routing

Recommended routes:

```text
/
```

Home / case selection.

```text
/case/:caseId
```

Gameplay.

```text
/case/:caseId/result
```

Completed case result.

Direct navigation to a valid case URL must work.

Azure Static Web Apps SPA fallback must be supported.

---

# 48. Error Handling

Handle:

- Missing puzzle
- Invalid JSON
- Invalid puzzle schema
- Invalid route
- Corrupt local storage
- Solver error

Do not crash into a blank page.

Provide useful developer logging in development mode.

---

# 49. Testing Requirements

The puzzle engine requires strong automated coverage.

At minimum test:

```text
Position validation
Area detection
Adjacency
Object adjacency
Same-area constraints
Different-area constraints
Row constraints
Column constraints
Alone-in-area constraints
Character count constraints
Backtracking
Unique solution detection
Multiple solution detection
Impossible puzzle detection
Puzzle validation
```

Every bundled puzzle should have an automated test:

```typescript
expect(solvePuzzle(puzzle).solutionCount).toBe(1);
```

Also verify:

```typescript
expect(solution).toEqual(puzzle.solution);
```

---

# 50. UI Tests

Playwright should cover at least:

### Flow 1

```text
Open home
Select first case
Start investigation
Place characters
Submit correct arrangement
Accuse murderer
See CASE CLOSED
```

### Flow 2

```text
Start case
Place characters
Refresh browser
Progress remains
```

### Flow 3

```text
Play mobile viewport
Select character
Tap cell
Character is placed
```

---

# 51. Puzzle Development Tooling

Add a development-only page or script that validates every puzzle.

Preferred command:

```bash
pnpm validate:puzzles
```

Expected output:

```text
case-001 ✓ valid, unique solution
case-002 ✓ valid, unique solution
case-003 ✓ valid, unique solution
case-004 ✓ valid, unique solution
case-005 ✓ valid, unique solution

5 puzzles validated.
```

Fail the process if any puzzle is:

- Invalid
- Impossible
- Ambiguous
- Inconsistent with its declared solution

---

# 52. Development Commands

The repository should support commands similar to:

```bash
pnpm install

pnpm dev

pnpm build

pnpm test

pnpm test:e2e

pnpm lint

pnpm typecheck

pnpm validate:puzzles
```

The exact commands may vary slightly but all equivalent capabilities must exist.

---

# 53. README

Create a useful README containing:

```text
What CaseGrid is
Screenshot placeholder
Architecture
Requirements
Development setup
Available commands
Puzzle format
How to create a puzzle
How to validate puzzles
How to run tests
How to build
Azure Static Web Apps deployment notes
```

---

# 54. Azure Static Web Apps

The production build must produce static assets suitable for Azure Static Web Apps.

Do not require:

```text
Node server
ASP.NET backend
SSR server
Database
Docker
```

Add an appropriate Azure Static Web Apps configuration if necessary for SPA routing.

For example, routes such as:

```text
/case/case-001
```

must resolve correctly when opened directly.

---

# 55. Non-Goals

Do NOT implement the following in this version:

```text
User accounts
OAuth
Backend API
Database
Cloud save
Multiplayer
Leaderboards
Friends
Comments
Ratings
Payments
Subscriptions
Puzzle packs
Advertising
Procedural puzzle generation
LLM integration
AI-written stories
AI-generated clues
Community puzzles
Puzzle editor
Admin dashboard
Notifications
Daily puzzle scheduling
Achievements
XP
Levels
Native mobile apps
```

Do not create infrastructure for hypothetical future requirements unless it naturally falls out of good architecture.

---

# 56. Important Architecture Rule

Do not over-engineer the MVP.

Prefer:

```text
React
+
TypeScript
+
Puzzle Engine
+
JSON Content
+
LocalStorage
```

over introducing unnecessary services.

The puzzle engine is the primary reusable domain component.

---

# 57. Suggested Implementation Order

Implement in this order:

### Phase 1: Foundation

```text
Repository
React app
Tailwind
Routing
Basic page layout
```

### Phase 2: Domain

```text
Puzzle models
Zod schemas
Constraint types
Grid utilities
```

### Phase 3: Engine

```text
Constraint evaluation
Backtracking solver
Solution counting
Puzzle validator
Tests
```

### Phase 4: First Puzzle

```text
One complete manually authored puzzle
Validate unique solution
```

### Phase 5: Gameplay

```text
Map
Characters
Placement
Clues
Notes
Validation
```

### Phase 6: Game Flow

```text
Introduction
Timer
Check solution
Accusation
Result
Restart
```

### Phase 7: Persistence

```text
LocalStorage
Resume game
Completion tracking
Best time
```

### Phase 8: Content

```text
Create remaining four puzzles
Validate all puzzles
```

### Phase 9: Polish

```text
Responsive UI
Accessibility
Animations
Error states
Mobile testing
```

### Phase 10: Delivery

```text
Tests
Production build
README
Azure SWA configuration
```

---

# 58. Definition of Done

The MVP is complete when all of the following are true.

A user can:

```text
Open the application
Choose among at least five cases
Read the mystery introduction
Start the investigation
See a visually understandable map
Read all clues
Place suspects using drag and drop
Place suspects using click/tap
Move already placed suspects
Mark impossible cells
Mark clues as solved
Refresh without losing progress
Complete the correct arrangement
Submit the arrangement
Accuse a suspect
Solve the murder
See completion statistics
Replay the case
Return to case selection
```

Technical requirements:

```text
All five puzzles have exactly one solution
Puzzle engine has automated tests
All puzzle data passes schema validation
TypeScript compiles without errors
Lint passes
Unit tests pass
E2E critical path passes
Production build succeeds
Application runs without backend infrastructure
Application can be deployed to Azure Static Web Apps
```

---

# 59. Coding Guidelines

Use:

```text
TypeScript strict mode
Functional React components
Small focused components
Explicit domain types
Discriminated unions for constraints
Pure functions inside puzzle-engine where possible
Tests for domain logic
```

Avoid:

```text
any
Huge React components
Business logic inside JSX
Global mutable state
Premature abstractions
Unnecessary design patterns
Unnecessary dependency injection
Backend code
Duplicated constraint logic
```

---

# 60. LLM Implementation Instructions

You are implementing the first MVP of CaseGrid.

Treat this PRD as the primary product specification.

When something is unclear:

1. Prefer the simplest solution that satisfies the PRD.
2. Do not expand the scope.
3. Do not add speculative infrastructure.
4. Keep puzzle logic separate from presentation.
5. Prioritize a working vertical slice over architectural sophistication.
6. Write tests while implementing the puzzle engine.
7. Ensure every included puzzle has exactly one solution.
8. Use original content and visual assets.
9. Optimize interactions for desktop and mobile.
10. Keep the application deployable as a static application.

Do not stop after generating scaffolding.

Continue until there is a working game.

The first major milestone should be:

```text
Open Case 1
→ Start
→ Solve map
→ Submit
→ Accuse murderer
→ Case Closed
```

Once that vertical slice works correctly, expand the same architecture to the remaining cases.

---

# 61. First Deliverable

The first implementation iteration should produce:

```text
Working repository
React + TypeScript application
Puzzle engine package
One fully playable puzzle
Automated engine tests
Responsive game UI
Local persistence
Production build
README
```

After the first puzzle is fully playable, implement the remaining four cases.

Do not build future product features before the complete MVP described here is working.
