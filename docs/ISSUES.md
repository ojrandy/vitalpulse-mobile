# VitalPulse Mobile — Issues Log

A lightweight, local bug/issue tracker in markdown — no external tool required for a two-person, 30-day project. If you outgrow this (a lot of concurrent issues, need for assignment/notifications), migrate to GitHub Issues and leave a pointer here; don't maintain two systems in parallel.

## How to log an issue

1. Copy the template below into the **Open Issues** table.
2. Assign the next sequential ID (`ISS-001`, `ISS-002`, ...).
3. Set severity using the same scale as the Gantt chart's risk register, so language stays consistent project-wide:
   - **Critical** — data exposure, security bypass, incorrect broadcast to donors, or anything touching PHI incorrectly. Stop and fix before continuing other work.
   - **Serious** — breaks a core flow (submit/review/broadcast, auth) but not a security or data-safety issue.
   - **Watch** — real but non-blocking; cosmetic, edge-case, or a known trade-off being monitored.
4. When resolved, move the row to **Resolved Issues** with the resolution and date — don't just delete it. A resolved-but-recorded issue is what stops the same bug from being "found" twice.

## Open Issues

| ID  | Title | Severity | Found By | Date | Description | Status |
| --- | ----- | -------- | -------- | ---- | ----------- | ------ |
|     |       |          |          |      |             |        |

_(empty — log issues here as they're found, including during the Day 24–26 bug bash per `06-TESTING.md`)_

## Resolved Issues

| ID  | Title | Severity | Resolution | Resolved Date |
| --- | ----- | -------- | ---------- | ------------- |
|     |       |          |            |               |

_(empty)_

---

## Known limitations carried forward from planning

These aren't bugs in code that doesn't exist yet — they're trade-offs made deliberately during architecture/security planning, recorded here so they don't get silently forgotten and so nobody "discovers" them mid-build as if they were new. Promote any of these to a real numbered issue if/when it needs active work.

- **Suspended-account token validity gap.** `revokeRefreshTokens` blocks future token refreshes, but an already-cached ID token stays valid for its ~1h natural expiry — a just-suspended account isn't blocked instantly. Two mitigation options are documented in `04-SECURITY.md` §10 (route suspend-sensitive actions through Cloud Functions with `checkRevoked=true`, or cross-check a live `isSuspended` field in rules at extra read cost). Decide before launch if this residual window is unacceptable for any specific action.
- **RN Web on dense hospital/admin screens is an open watch item, not a resolved decision.** See `02-ARCHITECTURE.md` §5 — reassess by Day 18 per the Gantt chart; the fallback (a thin React-DOM layer sharing the same backend) is scoped but not built unless needed.
- **SMS gateway deliverability into Cameroon (MTN/Orange) is unverified until the Week 1 test completes.** Don't assume any candidate vendor (Twilio, Africa's Talking) "just works" for this region — this is exactly why it's a Week 1 task and a risk-register item, not an afterthought.
- **No geographic radius matching — city-string equality only, inherited as a known gap from the legacy app's own audit.** If proximity-based donor matching is expected for the mobile app's Day-1 launch, this needs a real geo field and query, not just carrying the old exact-city-match behavior forward unexamined. Flag if this assumption is wrong.
