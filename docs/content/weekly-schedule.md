# Case of the Week: Editorial Schedule

Issue: #21 · Epic: #13 · Scope: PRD section 62

The Case of the Week gives returning players one shared case to play and discuss. It is a **weekly editorial pilot**, not a daily feature, and it never generates puzzles.

## How it works

- **Schedule file:** `apps/web/public/puzzles/schedule.json`, checked in and deployed with the static build.
- **Boundary:** one global boundary, **Monday 00:00 UTC**. Every visitor sees the same featured case from that instant until the next Monday 00:00 UTC, whatever their time zone. For example, Sunday 17:30 in Los Angeles is already the next week.
- **Selection:** `selectFeaturedCase(schedule, now)` in the puzzle engine. Tests cover the exact boundary instant, one millisecond before it, several UTC offsets, gaps, and exhaustion. They do not depend on the machine's time zone.
- **Links:** the featured case uses its normal canonical URL, `/case/<id>`. Nothing changes when the week ends; links shared during the week keep working.
- **Progress:** stored under the underlying case ID, so a featured case shows its true status (not started, in progress with Resume, or solved with best time), and it never resets.
- **Fallback:** if the schedule is missing, malformed, references an unknown or unpublished case, has not started, has a gap, or has run out, the home page says "No Case of the Week is scheduled right now" and points to the full catalog. It never presents an existing case as newly authored. The panel's copy says "Everyone playing this week gets the same case" and never "new".
- **Home layout:** first-time onboarding stays the primary action ("Solve your first mystery" or Resume). The weekly panel sits beneath it, and the featured card in the catalog carries a "Case of the Week" badge.

```json
{
  "weeks": [
    { "weekStart": "2026-09-21", "caseId": "case-002" }
  ]
}
```

`weekStart` is the Monday, as `YYYY-MM-DD`. `pnpm validate:puzzles` fails unless every week start is a real Monday, the weeks are strictly ascending, and every case ID exists in `index.json` with `availability` not `coming-soon`. The independent uniqueness validation still runs for every case.

## Pilot schedule

| Week (Monday 00:00 UTC) | Case | Why it was chosen |
|---|---|---|
| 2026-09-21 | case-002 The Grand Antiquary | Easy, distinct museum setting; nudges, walkthrough, and resolution authored |
| 2026-09-28 | case-003 The Midnight Express | Easy, strong atmosphere; uses "alone" clues that players can discuss |
| 2026-10-05 | case-004 The Saltmarsh Beacon | Medium; the only case with chained "beside a person" steps |
| 2026-10-12 | case-005 The Blackwood Playhouse | Medium; paired placements in two rooms |

All four were already published in the catalog. They were reviewed in `docs/content/case-audit.md`. After 2026-10-19 00:00 UTC the schedule is exhausted and the fallback shows until more weeks are added.

## Authoring, review, and release checklist

For each scheduled week:

1. **Pick a published case**, or publish one first: set its `availability` to `available` in `index.json`. Rework unpublished cases per the case audit before publishing them.
2. **Content pass:** a resolution, a `deductions` walkthrough, and 3–5 `helpPrompts` written from `pnpm audit:cases -- --trace <id>`. Clue text must match the constraints; the tests enforce 1-based coordinates.
3. **Validate:** run `pnpm validate:puzzles` and `pnpm test`.
4. **Playtest:** at least one unfamiliar player solves it from the briefing, following the session script in `docs/research/`. Record the time and any stalls in the case audit.
5. **Link preview:** run `pnpm --filter @casegrid/web generate:og` if the case was newly published or retitled.
6. **Schedule:** append `{ "weekStart": "<Monday>", "caseId": "<id>" }` in order. Keep at least four future weeks scheduled.
7. **Release:** merge and deploy before the Monday 00:00 UTC boundary. Check the home page after the boundary with the live site.

## Expected workload

These estimates are for planning, not measured yet.

| Task | Per week, with an existing validated case | Per week, when re-authoring an unpublished case |
|---|---|---|
| Content pass (resolution, walkthrough, nudges) | 1–2 hours | 1–2 hours |
| Clue re-authoring and validation (see case audit finding 1) | — | 3–6 hours |
| Playtest and notes | 1 hour | 1–2 hours |
| Schedule edit, link preview, release check | 30 minutes | 30 minutes |
| **Total** | **about 3 hours** | **about 6–10 hours** |

Only five cases are published today, and four are used by this pilot. Sustaining the feature past October 2026 means re-authoring the unpublished cases, the right-hand column above. At that rate, a weekly cadence is realistic for one editor. A daily cadence is not.

## Evaluation before any cadence change

Do **not** propose a daily cadence until the research plan in `docs/research/` has been run. The event dictionary lists Case of the Week participation as a measure that needs aggregate instrumentation, which does not exist. Until then, evaluate the pilot with moderated sessions and seven-day follow-ups: did participants notice the weekly case, start it, and give it as a reason to return? Record the outcome in `docs/research/release-validation.md`.
