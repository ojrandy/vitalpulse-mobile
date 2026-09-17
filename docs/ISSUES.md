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
- **Role-routed entry (task 8) is route-separated but still not auth-driven.** `(donor)`, `(hospital)`, and `(admin)` are now three mutually exclusive route subtrees — the root layout wraps each in `Stack.Protected guard={...}` keyed off `authStore.role`, so one role's screens (tabs and pushed detail screens alike) cannot mount in another role's session; see `04-SECURITY.md` §11 for the mechanism and its limits. `authStore.role` remains a client-side placeholder, explicitly never read for authorization (matches `users.role`'s "cosmetic/routing only" status, `04-SECURITY.md` §3) — the guard is a UX/defense-in-depth layer, not the security boundary. Still open: nothing yet sets `role` from a verified identity. `LoginScreen` hardcodes `role: 'hospital_staff'` for any email/password that passes the stub, and no screen or flow sets `role: 'system_admin'` at all, so `(admin)` is currently unreachable in the running app. Closing this needs real Firebase Auth sign-in wired into `authService.ts` (still stubbed — see below) and reading the resulting custom-claims `role` back into `authStore`.
- **`authService.ts`/`profileService.ts` are still stubbed — the client never calls the real Cloud Functions yet.** The backend phase (2026-09-16) built and verified `functions/` (submitRequest, reviewRequest, broadcastRequest, addInventoryStock, deductInventoryStock, resolveLabTest, grantRole, revokeRole — all with passing unit tests) and the full `firestore.rules` (29 passing rules tests against the real emulator), but no real Firebase project exists yet (task 2, still Not Started) to deploy them to, and `requestService.ts`/`reviewService.ts`/`inventoryService.ts` on the client still call their `STUB_DELAY_MS` mocks, not `httpsCallable(...)`. Swapping the client services over to real callable-function calls is straightforward once a project exists to point `src/lib/firebase.ts` at, but is explicitly not done yet — flagging so it isn't assumed to already be wired.
- **`suspendUser`/`unsuspendUser` has no Cloud Function contract yet.** `users.isSuspended` is documented as Cloud-Functions-only and `04-SECURITY.md` §10 assumes suspension is actionable, but the callable-function contract table in `03-DATA-MODEL.md` never listed one, and `grantRole`/`revokeRole` (now implemented) don't touch it either. Needs a decision before the Week 4 "suspend an account" manual QA case can be exercised — see `03-DATA-MODEL.md`'s "Known contract gap" note.
- **`requests.hospitalId` is free-text, not a real hospital directory FK.** `firestore.rules`' hospital-scoped read rule on `requests/{id}` (`isOwnHospital(resource.data.hospitalId)`) is written against the documented contract intent, but won't actually scope correctly for real hospital accounts until there's a real hospital directory/picker — donor-submitted requests currently store whatever hospital name text the donor typed (see `requestSchemas.ts`/`request.ts` in `packages/shared-schemas`). Not a security hole (it fails closed — a free-text mismatch just means nobody's hospital-scoped read matches, not that it over-grants), but the hospital read path is effectively unexercised until this lands.
- **`lab_tech` has no dedicated UI shell.** `04-SECURITY.md`'s role table has five roles; `src/stores/authStore.ts`'s `appRoleValues` (client-side routing enum) only has four — no `lab_tech` tab group exists to route into. The backend (`functions/src/lib/authz.ts`, `firestore.rules`, `grantRole`) all correctly model `lab_tech` as a distinct role with its own permissions (can `resolveLabTest`, cannot touch requests or stock counts); this is purely a missing client route group, not a backend gap.
