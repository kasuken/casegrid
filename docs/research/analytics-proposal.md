# Proposal: Optional Aggregate Instrumentation

Status: **for review only. Nothing here is implemented.** Adding any of it needs a separate product decision and any necessary privacy or legal authorization. It also needs an amendment to PRD section 62, which currently excludes analytics services and identifiers.

## Why it might be needed

Observation and follow-up cannot measure real-audience completion, referred case starts, Case of the Week participation, or population-level return. See the event dictionary. If those become decision-critical, the options below are the least invasive ways to learn them.

## Options, from least to most invasive

### A. No instrumentation (current)

Rely on moderated sessions and self-reported follow-up. There is no privacy cost, but the evidence is small and anecdotal.

### B. Static-host request logs

Azure Static Web Apps can report aggregate request counts per path. Counting requests for `/puzzles/case-00N.json` gives an upper bound on case loads, and `/case/case-00N/index.html` (the link-preview pages) roughly counts shared-link hits, including crawlers.

- **Pros:** no client code, no identifiers, and it runs on the existing hosting.
- **Cons:** cannot separate people from bots or repeat visits, and cannot see completion.

### C. Cookieless, aggregate event counts

Send a small, anonymous count on a few events: `case_start`, `case_complete`, `next_case_start`, `share_initiated`, and `referred_case_start`. The last one would need a spoiler-free `?from=share` marker on shared links, which PRD section 62 would have to allow. Events carry the case ID and nothing else: no user ID, no fingerprinting, no cross-site tracking.

- **Pros:** answers the funnel questions in aggregate.
- **Cons:** needs a collection endpoint, which PRD section 62 excludes today, plus a privacy notice and a vendor or self-hosted choice.

### D. Per-user analytics

Out of scope. It conflicts with the product's no-account, no-identifier stance.

## Recommendation

Stay on **A** until the baseline shows a question that sessions cannot answer. If one appears, try **B** first, because it needs no code. Consider **C** only with an explicit decision, a named owner, and a privacy review.
