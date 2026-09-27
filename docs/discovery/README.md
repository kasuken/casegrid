# Discovery Mini-Mysteries

Issue: #22 · Epic: #13

Three original mini-mysteries that people can solve inside a single post, each leading to a related full case. This folder holds **review materials only**. Nothing here has been published, and no creator or community has been contacted. External publishing and outreach need a separate decision.

| File | Purpose |
|---|---|
| `minis/*.json` | The three puzzles in the standard case format, with the answer explanation (`deductions`, `resolution`) and `linkedCaseId` |
| `storyboards.html` | Phone-width post and answer-slide layouts generated from the JSON. Open it in a browser; regenerate with `node docs/discovery/render-storyboards.mjs` |
| `../../packages/puzzle-engine/tests/discovery.test.ts` | Automated checks for every mini (below) |

## Status

| Concept | Solver check | Unfamiliar-tester check | Review | Published |
|---|---|---|---|---|
| The Stopped Clock | ✓ Unique, guess-free | **Pending** | Ready for review | No |
| The Night Ferry | ✓ Unique, guess-free | **Pending** | Ready for review | No |
| The Keeper's Stairs | ✓ Unique, guess-free | **Pending** | Ready for review | No |

Mark a concept "approved" only after an unfamiliar tester has solved it from the standalone storyboard and the phone-scale readability check below is recorded. Publishing is a separate row that stays "No" until outreach is authorized.

## Automated checks

`pnpm test` runs these for every mini:

- The engine's full validator passes and the independent solver finds **exactly one** answer.
- The deduction analyzer solves it clue by clue, with no trial and error.
- It has at most 6 clues and at most 8 cells, so it fits in one post.
- The killer is **not** signposted by a "beside the victim" clue. This avoids the pattern the case audit found in the published cases.
- The linked case is published, and neither puzzle shares a character name with the other, so the teaser cannot spoil the full case.

## Concepts

The promise on every post is **"Solve the scene. Find the killer."** Each one teaches one idea the full game relies on.

### 1. The Stopped Clock → Case 01, The Rosewood Parlor

- **Scene:** a 3×2 law office with a two-cell study and a hall. A stopped clock blocks one cell.
- **Teaches:** objects block cells, "beside" means sharing an edge, and the killer is found by elimination.
- **Post copy:** "Four people, two rooms, one stopped clock. Ambrose Quill never left his desk. Who was alone with him? Solve the scene. Find the killer."
- **Answer slide:** Iris Moss. The explanation is in the JSON and the storyboard.
- **Next-step copy:** "Liked that? The Rosewood Parlor is a full manor case with a short guide on the board: `/case/case-001`."
- **Why this link:** case 001 is the beginner tutorial case, so it is the right first stop for someone new.

### 2. The Night Ferry → Case 03, The Midnight Express

- **Scene:** a 4×2 ferry with a cabin and an open deck. A bench and a lifebuoy block cells.
- **Teaches:** diagonals never count. The killer's cell touches the victim's only at a corner, yet they are alone together.
- **Post copy:** "Fog, a night crossing, and three passengers. Only one of them was alone on deck with Cordelia Brisk. Can you tell who? Solve the scene. Find the killer."
- **Answer slide:** Rafe Dunmore.
- **Next-step copy:** "Another journey, a bigger cast: a luxury train stranded in the snow. `/case/case-003`."
- **Why this link:** a shared travel theme with a different vehicle, cast, and layout. Nothing carries over.

### 3. The Keeper's Stairs → Case 04, The Saltmarsh Beacon

- **Scene:** a 3×2 lighthouse with a lamp room above a stairwell. The great lens blocks the middle cell.
- **Teaches:** "different rooms" and "not beside" clues, the relational reasoning that case 004 uses most.
- **Post copy:** "The lamp room above, the stairs below. Hesper Grayle was found on the landing. Three visitors, one of them alone with her. Solve the scene. Find the killer."
- **Answer slide:** Bryony Fenn.
- **Next-step copy:** "Storm-bound on a full lighthouse island, with seven people to place: `/case/case-004`."
- **Why this link:** the same kind of setting at a larger scale. The characters and floor plan are different.

## Accessibility

- Every storyboard board has a text equivalent: rooms with their cells, and objects with their positions. It sits in the scene's `aria-label` and in the "Text equivalent" disclosure below each concept.
- Clues and the question are real text, never baked into an image.
- When posted as images on a platform, use the text equivalent as the image description and put the clues in the post body.

**Phone-scale check:** the storyboards were rendered at 390 px wide and every frame fits without horizontal scrolling. Record a real-device check here after review.

## Artwork needs

The storyboards use plain shaded rooms and labelled blocked cells. Original illustrated scenes for the three minis are listed as wanted in `docs/ASSETS.md`.

## Distribution experiment plan (for review, not authorized)

| Field | Plan |
|---|---|
| Hypothesis | A solvable mini-mystery with a direct link to a related case brings puzzle-minded people to **start** a full case. |
| Audience fit | Logic-puzzle and deduction communities, creators who post daily logic puzzles, and cosy-mystery readers. Pick each venue only after reading its rules. |
| Posting rules to confirm per venue | Whether self-promotion is allowed, how links are handled, whether answers must be spoiler-tagged, and the image and alt-text limits. |
| Format | The post image or text with the clues, the answer in a reply or second slide, and the next-step link in the answer only, so it never spoils the teaser. |
| Sample | One concept per venue, rotating concepts, over two weeks. |
| Meaningful outcome | **Recipient case starts** (someone presses Start Investigation on the linked case), not likes, impressions, or clicks. |
| Measurement | Under the current plan (#14), outcomes can only be observed anecdotally or through participant follow-up. Counting real case starts per campaign needs the separately reviewed aggregate option in `docs/research/analytics-proposal.md`. Until that is approved, report only what was observed. |
| Stop or continue | Continue only if follow-ups show people started or finished the linked case. |

## Attribution rules

- Clicks, impressions, reactions, and shares are **never** reported as completed or started investigations.
- No tracking parameters are added to links today, and the canonical `/case/<id>` links stay clean. If aggregate measurement is approved later, any campaign marker must stay spoiler-free and be documented in the event dictionary first.
- A share sheet or post "success" does not show that anyone saw or played the case.

## Validation before a concept moves to "approved"

1. An unfamiliar tester solves the concept from `storyboards.html` alone, without help. Record the time taken and any confusion.
2. Check that the tester's answer matches the resolution, and that the answer slide's explanation convinced them.
3. Open the linked case URL on a phone and confirm it lands on that case's briefing.
4. Record the result in the status table above.
