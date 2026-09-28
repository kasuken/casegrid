# Event Dictionary and Denominators

These definitions describe the journey: **discover a case → start → close → share → return**. Each event lists the UI moment it maps to, and whether it can be measured by **observation**, **follow-up** (the participant's self-report), or only by **aggregate instrumentation**, which does not exist.

The UI mappings were checked against the current flows in `apps/web/src`, including the growth-release additions.

## Events

| Event | Definition | UI moment | Measurable by |
|---|---|---|---|
| `case_entry` | A visitor lands on a case URL or opens a case card | `/case/:caseId` renders the briefing, or resumes the board if progress exists | Observation |
| `first_case_cta` | A new visitor uses "Solve your first mystery" | Home page call to action | Observation |
| `resume_cta` | A returning visitor uses the resume call to action | Home page call to action | Observation |
| `case_start` | The player starts the investigation | "Start Investigation" pressed; the timer starts | Observation |
| `first_meaningful_placement` | The first placement the player justifies out loud with a clue | Board | Observation only. The app never judges correctness after a move. |
| `nudge_revealed` | A distinct nudge is revealed | "Need a nudge?" in the clue panel | Observation. The count is also stored locally per case. |
| `check_submitted` | The player submits the arrangement | "Check Solution" | Observation. Mistakes are stored locally. |
| `case_complete` | The correct suspect is accused | CASE CLOSED screen | Observation. Completion is stored locally. |
| `next_case_start` | A second case is started from the result screen or catalog | "Open the next case", then "Start Investigation" | Observation; follow-up |
| `share_initiated` | The player presses Share on a closed case | Result screen share panel | Observation |
| `share_outcome` | The share sheet reports completed, cancelled, or unsupported; or a fallback copies text or downloads the image | Share panel status message | Observation. See the limits below. |
| `referred_case_start` | A recipient of a shared link starts that case | The recipient's own device | **Aggregate instrumentation only.** Not measurable today. |
| `return_7d` | The participant opens CaseGrid again within 7 days of their first session | Their own device | Follow-up self-report only |

## Denominators

| Rate | Numerator | Denominator |
|---|---|---|
| First-meaningful-placement time | Median time for participants who made one | All participants who started a case |
| First-case completion (unaided) | Participants who closed the first case without moderator help | All participants who started the first case |
| Nudge reliance | Participants who opened at least one nudge | All participants who started the first case |
| Second-case start | Participants who started a second case in the session | Participants who closed the first case |
| Share initiation | Participants who pressed Share | Participants who closed a case, in the growth release only |
| Share completion (reported) | Share sheet reported "completed", or a fallback succeeded | Participants who pressed Share |
| Seven-day return (self-reported) | Follow-up respondents who say they returned | Follow-up respondents, not all participants. Report the response rate alongside it. |

Always report the raw counts, such as "6 of 11", next to any percentage.

## What these measures cannot establish

- **Local storage is per browser.** It shows what happened on one device. It cannot show population-level completion, retention, or referral, and clearing site data erases it.
- **A share "success" is not delivery.** The Web Share API reports that the share sheet closed after the user picked a target. It does not confirm the message was sent, received, or opened. Copying a link says even less.
- **Recipient play is invisible.** Without instrumentation, nobody can tell whether a shared link led to a case start. Treat any referral claim from sessions as anecdote.
- **Self-reported return is biased.** Participants tend to over-report intent and return. Use it for direction, not magnitude.

## When aggregate instrumentation would be needed

These questions cannot be answered by observation and follow-up alone:

- The share of real visitors who start and complete the first case.
- The rate at which shared links produce recipient case starts.
- Seven-day return across the whole audience.
- Participation in the Case of the Week.

If these become decision-critical, review [analytics-proposal.md](analytics-proposal.md) first. It needs a separate decision and any necessary authorization.
