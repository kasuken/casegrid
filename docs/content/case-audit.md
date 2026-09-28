# Case Catalog Audit

Issue: #15 · Epic: #13 · Audited: 2026-09-27

This report reviews all 20 bundled cases for fairness, distinctiveness, difficulty progression, and a clear central deduction. It keeps **solver and tooling results** separate from **human playtest findings**. No blind playtests have been run yet, so the human column is empty until the sessions in `docs/research/` take place.

## Method

1. **Uniqueness and declared solution:** `pnpm validate:puzzles`, the independent solver, and the engine tests.
2. **Deduction path:** `analyzeDeductionPath` (engine) applies one clue at a time to each person's candidate cells, plus "one person per cell", until nothing changes. If it pins everyone, a player can solve the case by following clues without trial and error. Run it with `pnpm audit:cases`, or trace one case with `pnpm audit:cases -- --trace case-001`.
3. **Text consistency:** each clue's displayed row and column numbers are compared with its structured constraint. This is now an automated test.
4. **Editorial review:** setting, cast, clue patterns, originality, and the resolution's logic.

Passing propagation is a floor, not a ceiling. It shows a case needs no guessing, but it does not show the case is satisfying.

## Ranked findings

### 1. Every case is fair, but every case is shallow (high)

All 20 cases are unique. When audited, every one yielded to propagation in **two rounds**; since the finding 2 fix, case-004 takes three. In every case, each person is pinned by the intersection of their own clues: room, "beside" an object or person, and a row or column. No case requires combining two people's possibilities, counting a room's capacity, or reasoning by elimination across rooms. The only relational steps are "X is beside Y" where Y is already fixed, as in case-004.

**Consequence:** reasoning depth does not grow from beginner to expert. The "hard" and "expert" labels on cases 015–020 reflect a larger cast and more clues, not harder deductions. The issue warns against exactly this: equating difficulty with size.

**Recommendation:** keep cases 001–005 as the first growth release and treat them as beginner-to-easy. Before publishing 006–020, re-author their clue sets so later cases need relational and elimination steps. Examples include "not beside", "different rooms", "exactly N in a room", and alibis that only resolve once another person is placed. Re-label difficulty from observed playtest solve times.

### 2. The murderer was signposted by one clue shape (fixed in published cases)

In all five published cases, and in 11 of the 15 unpublished ones, the victim is fixed by an exact-cell clue. The **only** person clued as "directly beside the victim" was the murderer. Each murderer also had a clue naming the victim's room outright. Players who noticed either could accuse without deducing anything else.

**Fixed in 001–005.** Each murderer is now placed through an object, a row or column, and, in 002–005, a "different rooms" clue about another person. There is no clue that ties them to the victim or names the victim's room. The murderer only emerges once everyone else is placed.

- In 001, 004, and 005, the murderer is no longer even beside the victim; their cells touch only at a corner.
- In case 004, Mira is now found last, through a chain: Lydia, then Caleb, then Mira. The case now takes three propagation rounds.
- To avoid a new tell, "different rooms" clues were also given to innocent suspects in 002–005 (Sylvia, Otto, Eleanor, Vivian). In every published case, at least one innocent suspect also has no direct room clue.

The murderers' solution cells moved: Evelyn to r2c1, Nadia to r3c2, Dimitri to r4c2, Mira to r2c1, and Camilla to r4c5. The murderer and the victim's room are unchanged. A new engine test fails if a published case ties the murderer to the victim, names the victim's room for the murderer, or leaves the murderer as the only suspect without a room clue.

**Still open for unpublished cases:** apply the same rules when re-authoring 006–020.

### 3. One layout template across the catalog (medium)

Every case is a 6×6 grid with four rooms. Eighteen of the twenty use the same four 3×3 quadrants with objects at the room centres (r2c2, r2c5, r5c2, r5c5). Case-001 varies its object positions, and case-004 uses horizontal bands. The PRD content guidance calls for 5×5 to 8×8 grids, 3–6 areas, and 4–10 objects.

**Recommendation:** vary grid size, room shapes, and object counts in the re-authored cases. Irregular rooms and walls between neighbouring cells create the relational deductions that finding 1 asks for.

### 4. Clue text contradicted structured rules in cases 006–020 (fixed)

When the board switched to 1-based coordinates, only cases 001–005 were updated. The 101 row and column references in cases 006–020 still used 0-based numbers, so players would have read every coordinate clue one row or column off. All of them are corrected. A new engine test fails if a coordinate in clue text ever disagrees with its constraint.

Five clues in 001–005 also said "only person" or "working alone" while their constraint was just "in the room". The text was true, but it claimed more than the rule it displays. They now match their constraints; each case already has a separate "alone" clue where one is needed.

### 5. Originality (fixed in published cases, flagged elsewhere)

Fixed:

- case-004 "Eleanor Rigby" (a famous song title) is now **Eleanor Ashby**.
- case-005 "Dorian Gray" (a famous literary character) is now **Dorian Hale**.
- case-010 "Dr. Howard Carter" (a real historical person cast as a murder suspect) is now **Dr. Howard Callow**.
- Surnames repeated across the five published cases are now distinct. Professor Alistair Finch is **Pembroke**, Caleb Finch is **Morrow**, Vincent Sterling is **Harrow**, Julian Vance is **Marsh**, and Seraphina Cross is **Lane**.

Character IDs and portrait files are unchanged, so saved progress keeps working. Portrait `<title>` text and `docs/ASSETS.md` were updated to match.

Flagged for the editorial pass on unpublished cases:

- case-010's steamer "S.S. Karnak" shares its name with the riverboat in a famous Nile murder novel. Rename it before publishing.
- case-018's "Berghof" sanitarium echoes a well-known novel's sanatorium, and the word also carries unwanted historical associations. Rename it.
- The published case-003, "The Midnight Express" (a snowbound luxury train), shares its title with a well-known film and sits very close to a famous train mystery. It is original content, but consider a more distinctive title.
- Surnames repeat heavily across 006–020: Vance in 11 cases, Sterling in 6, Finch in 5, and Thorne and Drake in 3 each.
- Nine cases use poison as the method, which makes the settings blur together.

### 6. Redundant clues (low)

Propagation never needs 2–3 clues per case. These are usually "X and Y were both in room R" when both people already have their own room clue, or an "alone" clue that becomes implied. Redundancy is not unfair, and it can help beginners, but it pads later cases without adding reasoning.

### 7. Stale generator script (low)

`packages/puzzle-engine/scripts/create-cases.ts` generated cases 006–020, and it still contains the 0-based text and the old names. **Do not re-run it**, because it would overwrite the fixes above. The JSON files are the source of truth.

## Case-by-case summary

"Propagation rounds" is how many passes of single-clue reasoning pin everyone. "Unused" lists clue numbers the deduction never needs.

| Case | Title | Label | People / clues | Propagation rounds | Unused | Murderer signposted | Editorial notes | Recommendation |
|---|---|---|---|---|---|---|---|---|
| 001 | The Rosewood Parlor | beginner | 6 / 15 | 2 | — | fixed | Classic manor. The only case with varied object positions. Good tutorial. | **Publish** (first case, tutorial) |
| 002 | The Grand Antiquary | easy | 6 / 17 | 2 | 2, 5, 9 | fixed | Distinct museum scene. Easier than its label. | **Publish** (weekly pilot) |
| 003 | The Midnight Express | easy | 6 / 18 | 2 | 2, 5, 16 | fixed | Strong atmosphere. Title and premise are close to well-known works. | **Publish** (weekly pilot); consider retitling |
| 004 | The Saltmarsh Beacon | medium | 7 / 20 | 3 | 5, 11, 18 | fixed | Best current case: band-shaped rooms and a three-step chain that finds the murderer last. | **Publish** (weekly pilot) |
| 005 | The Blackwood Playhouse | medium | 7 / 20 | 2 | 2, 5, 11, 18 | fixed | Theatre scene. Same pattern as 002 with pairs. | **Publish** (weekly pilot) |
| 006 | The Whispering Cloister | beginner | 6 / 18 | 2 | 5, 11, 15 | yes | Quiet abbey. Near-copy of 001's structure. | Rework before publishing |
| 007 | The Botanical Conservatory | beginner | 6 / 18 | 2 | 5, 11, 15 | yes | Overlaps 001's conservatory. Reuses Vance, Sterling, Finch. | Rework; rename cast |
| 008 | The Gilded Casino | easy | 6 / 18 | 2 | 5, 11, 15 | yes | Fresh setting. Same template. | Rework |
| 009 | The Clockwork Workshop | easy | 6 / 19 | 2 | 5, 12, 16 | no | Fresh setting. The murderer is not signposted, so this is a better clue design. | Rework layout; keep clue idea |
| 010 | The Nile Steamer | easy | 6 / 19 | 2 | 5, 12, 16 | yes | Borrowed steamer name. Real-person suspect fixed. | Rework; rename vessel |
| 011 | The Alchemist's Laboratory | medium | 6 / 20 | 2 | 7, 13, 17 | no | The victim has no exact-cell clue, which is good. | Rework layout |
| 012 | The Imperial Opera House | medium | 7 / 22 | 2 | 7, 13, 19 | yes | Overlaps 005's theatre setting. | Rework or merge concept |
| 013 | The Highclere Observatory | medium | 7 / 20 | 2 | 7, 12, 17 | no | Reuses Vance, Sterling, Finch, Cross, Thorne. | Rework; rename cast |
| 014 | The Sunken Galleon Salvage | medium | 7 / 20 | 2 | 7, 12, 17 | yes | Fresh setting. Reuses surnames. | Rework |
| 015 | The Royal Antiquities Vault | hard | 7 / 20 | 2 | 7, 12, 17 | no | Overlaps 002's museum setting. Not harder than 001. | Rework to real hard difficulty |
| 016 | The Venice Masquerade | hard | 7 / 20 | 2 | 7, 12, 17 | yes | Distinct and memorable. Not harder than 001. | Rework to real hard difficulty |
| 017 | The Fogbound Depot | hard | 7 / 20 | 2 | 7, 12, 17 | no | Distinct. Not harder than 001. | Rework to real hard difficulty |
| 018 | The High-Alpine Sanitarium | hard | 7 / 20 | 2 | 7, 12, 17 | yes | Problematic institution name. Not harder than 001. | Rework; rename institution |
| 019 | The Sovereign Airship | expert | 7 / 20 | 2 | 7, 12, 17 | no | Distinct. Not harder than 001. | Rework to real expert difficulty |
| 020 | The Obsidian Citadel | expert | 8 / 21 | 2 | 7, 12, 17 | yes | Fantasy tone shifts from the catalog's period style. | Rework; confirm tone fits |

## First growth release selection

- **First case:** 001, The Rosewood Parlor. It has the onboarding tutorial, nudges, a walkthrough, and a resolution.
- **Case of the Week pilot:** 002, 003, 004, and 005. Each has nudges, a walkthrough, and a resolution. See `apps/web/public/puzzles/schedule.json`.

All five walkthroughs are stored in the case JSON (`deductions`) and shown only after a case is closed. They are reproduced in the appendix. The engine validates every referenced clue ID, and each walkthrough's final cells were cross-checked against the declared solutions.

## Difficulty metadata

No labels changed. The issue asks to adjust metadata from observed difficulty and completion ranges, and none exist yet. On structural evidence alone, 002–005 play closer to "easy" than their labels suggest. Revisit after the baseline sessions in #14.

## Blind playtest plan (pending)

Use the session script in `docs/research/session-script.md`. Test case 001, then one of 002–003 and one of 004–005. For each, record the time to the first correct placement, whether the player needed a nudge, where they stalled, and whether they noticed the "beside the victim" shortcut. Record results under "Human findings" below.

## Human findings

_None yet. Add anonymous observations after each session._

## Appendix: deduction walkthroughs

<!-- Generated from apps/web/public/puzzles/case-00{1..5}.json "deductions" -->

### case-001: The Rosewood Parlor

1. Lord Reginald is fixed at row 1, column 2 in the conservatory. _(clue 1)_
2. Evelyn stands beside the stone fountain. Lord Reginald has the cell above it, which leaves row 2, column 1, row 2, column 3, and row 3, column 2. Only row 2, column 1 is in column 1. _(clues 2, 3)_
3. Julian is in the billiard room beside the billiard table. Its only open neighbour in row 4 is row 4, column 2, and he has the room to himself. _(clues 4, 5, 6, 7)_
4. Arthur is in the library beside the antique globe. The globe’s neighbour in column 4 is row 2, column 4. _(clues 8, 9, 10)_
5. Clara joins Arthur in the library beside the oak bookshelf. The bookshelf’s open neighbours are row 1, column 5 and row 2, column 6; only the first is in row 1. _(clues 11, 12, 13)_
6. Beatrice stands beside the parlor fireplace in column 5, which leaves row 5, column 5. _(clues 14, 15)_
7. With everyone placed, Evelyn is the only suspect in the conservatory with Lord Reginald. She was never directly beside him: their cells touch only at a corner.

**Resolution:** Evelyn Rosewood was the only person in the conservatory with Lord Reginald. Julian had the billiard room to himself, Arthur and Clara were browsing the library, and Beatrice was tending the parlor fire. Her ambition for the estate gives the story its motive, but it was the placements that proved she was alone with him.

### case-002: The Grand Antiquary

1. Professor Pembroke is fixed at row 1, column 2 in the Fossil Hall. _(clue 1)_
2. Nadia stands beside the T-Rex skull. The professor has the cell above it, which leaves row 2, column 1, row 2, column 3, and row 3, column 2. Only row 3, column 2 is in row 3. _(clues 3, 4)_
3. Henry is alone in the Relic Gallery beside the sarcophagus, and in row 4 that means row 4, column 2. He stands right below Nadia, but across a wall, so they are in different rooms. _(clues 2, 5, 6, 7, 8)_
4. Marcus is in the Gem Vault beside the diamond showcase. Its neighbour in column 4 is row 2, column 4. _(clues 10, 11, 12)_
5. Elena shares the Gem Vault with Marcus and also stands beside the showcase. The only such cell in row 1 is row 1, column 5. _(clues 9, 13, 14)_
6. Sylvia stands beside the microscope bench in column 6: row 5, column 6, in the Restoration Lab, a different room from Henry. _(clues 15, 16, 17)_
7. With everyone placed, Nadia is the only suspect sharing the Fossil Hall with the professor.

**Resolution:** Dr. Nadia Rostova was the only person in the Fossil Hall with Professor Pembroke. Marcus and Elena were together at the diamond showcase, Henry was alone with the sarcophagus, and Sylvia never left her microscope bench. Her disputed fossil claims give the story its motive, but it was the placements that proved she was alone with him.

### case-003: The Midnight Express

1. The Baroness is fixed at row 5, column 1 in her sleeper cabin. _(clue 1)_
2. Dimitri stands beside the velvet berth bed. The Baroness has the cell to its left, which leaves row 4, column 2, row 6, column 2, and row 5, column 3. Only row 4, column 2 is in row 4. _(clues 3, 4)_
3. Viktor stands beside the grand piano in the Saloon Car. Its only neighbour in row 1 is row 1, column 2. _(clues 6, 7, 8)_
4. Charlotte shares the Saloon Car with Viktor and is also beside the piano, in column 3: row 2, column 3. That is a different car from Dimitri’s, as the clue says. _(clues 2, 5, 9, 10)_
5. Gwen has the Dining Car to herself, beside the bar counter in column 6: row 2, column 6. _(clues 11, 12, 13, 14)_
6. Otto is alone beside the freight crate in column 6: row 5, column 6, in the Baggage Car, a different car from Viktor. _(clues 15, 16, 17, 18)_
7. With everyone placed, Dimitri is the only suspect sharing the sleeper cabin with the Baroness.

**Resolution:** Dimitri Petrov was the only passenger in the sleeper cabin with the Baroness. Viktor and Charlotte were at the saloon piano, Gwen was alone at the dining bar, and Otto never left the baggage car. His gambling debts give the story its motive, but it was the snowbound seating chart that proved he was alone with her.

### case-004: The Saltmarsh Beacon

1. Captain Ward is fixed at row 1, column 2 on the lantern gallery. _(clue 1)_
2. Lydia is in the Radio Shack beside the radio unit. The cell below the radio belongs to the Engine Room, so in row 3 she can only be at row 3, column 2. _(clues 6, 7, 8)_
3. Caleb stands beside Lydia. The radio blocks the cell below her, and of her other neighbours only row 3, column 1 is in column 1. _(clues 5, 9, 10)_
4. Jonas is in the Living Quarters beside the stove, in row 3: row 3, column 5. _(clues 12, 13, 14)_
5. Samuel stands beside Jonas in column 6: row 3, column 6. _(clues 11, 15, 16)_
6. Eleanor is alone beside the generator in row 5: row 5, column 3, in the Engine Room, a different room from Jonas. _(clues 17, 18, 19, 20)_
7. Mira stands beside Caleb, in column 1. His neighbours in that column are row 2, column 1 and row 4, column 1. Row 4, column 1 is in the Radio Shack with Lydia, and Mira was in a different room from her, so Mira is at row 2, column 1 on the gallery. _(clues 2, 3, 4)_
8. With everyone placed, Mira is the only suspect on the lantern gallery with Captain Ward, although she was never directly beside him.

**Resolution:** Mira Gable was the only person on the lantern gallery with Captain Ward. Lydia and Caleb were huddled at the radio, Jonas and Samuel were by the stove, and Eleanor was alone with the generator. Her looming relief from duty gives the story its motive, but it was the storm-bound positions that left no one else on the gallery.

### case-005: The Blackwood Playhouse

1. Vincent is fixed at row 5, column 6 in the Dressing Rooms. _(clue 1)_
2. Camilla stands beside the vanity mirror. Vincent has the cell to its right, which leaves row 4, column 5, row 6, column 5, and row 5, column 4. Only row 4, column 5 is in row 4. _(clues 3, 4)_
3. Julian is on the Main Stage beside the trapdoor. Its only neighbour in row 1 is row 1, column 2. _(clues 6, 7, 8)_
4. Rowan shares the stage and the trapdoor. In column 3 that leaves row 2, column 3. _(clues 5, 9, 10)_
5. Seraphina is in the Orchestra Pit beside the concert grand piano, in column 6: row 2, column 6. _(clues 12, 13, 14)_
6. Dorian joins her beside the piano, in row 1: row 1, column 5. _(clues 11, 15, 16)_
7. Vivian is alone backstage beside the costume trunk, in column 1: row 5, column 1. That puts her in a different room from both Julian and Camilla. _(clues 2, 17, 18, 19, 20)_
8. With everyone placed, Camilla is the only suspect sharing the Dressing Rooms with Vincent, although she was never directly beside him.

**Resolution:** Camilla Fontaine was the only member of the company in the Dressing Rooms with Vincent Harrow. Julian and Rowan were at the trapdoor, Seraphina and Dorian were by the piano, and Vivian was alone with the costume trunk. The threat of being recast gives the story its motive, but it was the rehearsal positions that closed the case.
