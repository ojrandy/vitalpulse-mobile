# VitalPulse Mobile — Project Tracker

**How to use this file:** update it as you go, not at the end of the day from memory. Flip a task's Status when it actually changes, and add a dated entry to the **Daily Log** at the bottom whenever something worth remembering happens — a decision made, a bug found, a scope change, a blocker. This mirrors how the original web app's own `VitalPulse_Plan_Tracker.md` was kept, and it's what lets either of you (or a session picking this back up cold) reconstruct _why_ something is the way it is, not just _that_ it's done.

**Status values:** `Not Started` · `In Progress` · `Blocked` · `Done` · `Cut` (moved to `ROADMAP.md` — scope deliberately removed, not abandoned silently)

Task IDs match the Gantt chart (`VitalPulse_Mobile_30Day_Gantt.xlsx`) exactly — if you need day-by-day visual scheduling, that's the file to open; this file is for status and notes.

---

## Week 1 — Foundation (Days 1–7)

### Foundation & Infrastructure

| ID  | Task                                                 | Owner | Days | Status      | Notes                                                            |
| --- | ---------------------------------------------------- | ----- | ---- | ----------- | ---------------------------------------------------------------- |
| 1   | Kickoff & requirements lock                          | Joint | 1    | Not Started |                                                                  |
| 2   | Fresh Firebase project setup                         | Randy | 1–2  | Not Started |                                                                  |
| 3   | Repo scaffold: Expo + RN Web (3 targets)             | Randy | 1–2  | Done |                                                                  |
| 4   | App Store / Play developer accounts verified         | Randy | 1–2  | Not Started |                                                                  |
| 5   | CI/CD: lint, typecheck, tests on every PR            | Randy | 2–3  | Done |                                                                  |
| 6   | SMS gateway evaluation & real deliverability test    | Randy | 2–5  | Not Started | Vendor decision blocks Week 3 — see `DEPENDENCIES.md` candidates |
| 7   | Design system / component library                    | Mai   | 2–5  | Done | `src/theme` tokens + `src/components` (AppText, Button, Card, Pill, StepperControl, etc.) shared across donor/hospital/admin screens. |
| 8   | Role-routed navigation shells (Donor/Hospital/Admin) | Mai   | 3–5  | In Progress | `(donor)`, `(hospital)`, `(admin)` are now three mutually exclusive route subtrees, gated by root-level `Stack.Protected` guards keyed off `authStore.role` — one role's screens (tabs and pushed detail screens) can no longer mount in another role's session, closing the cross-role deep-link/data-leak gap this task previously had. Still missing: the actual auth-driven redirect that sets `role` from a verified identity — depends on task 10 (custom claims) landing first; `authStore.role` is a client-side, routing-only placeholder in the meantime (mirrors `users.role`'s "cosmetic only" status per `04SECURITY.md` §3; mechanism documented in `04SECURITY.md` §11). |
| 9   | Localization scaffolding (EN/FR)                     | Mai   | 4–5  | Done | i18next wired with `auth`, `donor`, `hospital`, `admin` namespaces, full EN/FR parity. |

### Security & Compliance (Week 1 portion)

| ID  | Task                                              | Owner | Days | Status      | Notes |
| --- | ------------------------------------------------- | ----- | ---- | ----------- | ----- |
| 10  | Auth: phone OTP + custom claims scaffold          | Randy | 2–5  | In Progress | Custom-claims *consumption* is fully built and tested: `functions/src/lib/authz.ts` (requireAuth/requireRole/requireOwnHospital), `grantRole`/`revokeRole` (set claims + `revokeRefreshTokens`), and every `firestore.rules` collection all key off `request.auth.token`. Still missing: real phone-OTP sign-in itself (`authService.ts` is still the stub) and a real Firebase project (task 2) to actually issue those claims against. |
| 11  | Firestore schema v1 + deny-by-default rules draft | Randy | 3–6  | Done | `firestore.rules` covers all 6 collections in `03DATAMODEL.md` (`users`, `requests`, `broadcasts`, `notification_log`, `inventory`, `auditLogs`), deny-by-default root, hospital-scoped/role-scoped reads, self-role-elevation blocked on `users/{uid}`. |
| 12  | Firestore rules test suite (skeleton)             | Randy | 5–7  | Done | `tests/rules/firestore.rules.test.ts` — 29 tests, all passing against the real Firestore emulator (`npm run test:rules`, wired into CI as its own job). Covers every collection × role, plus the hostile cases in `06TESTING.md` §2 (cross-hospital, self-role-elevation, donor impersonation, claims-less signed-in user, suspended-token denial). |

**Milestone — Day 7: Architecture & Foundation Complete** — `Not Started`

---

## Week 2 — Donor Core + Request Pipeline (Days 8–14)

### Donor Core Experience

| ID  | Task                                             | Owner | Days  | Status      | Notes |
| --- | ------------------------------------------------ | ----- | ----- | ----------- | ----- |
| 15  | Donor profile UI (incl. unknown blood type flow) | Mai   | 8–10  | Done | `ProfileScreen` + `profileSetupSchema` (allows `self_reported`/`unknown`, never `lab_confirmed` client-side). |
| 16  | Request submission forms (directed / shortage)   | Mai   | 9–12  | Done | `RequestBloodScreen` + `ReportShortageScreen`, both against `requestSchemas.ts`, stubbed `requestService.submitRequest`. |
| 17  | Notification preference center UI                | Mai   | 10–11 | Done | `NotificationPreferencesScreen`. |
| 18  | Badges, points & tier UI                         | Mai   | 11–13 | Done | `BadgesScreen` + `DonationHistoryScreen` + `BloodCompatibilityScreen`. |

### Request & Moderation Pipeline

| ID  | Task                                                  | Owner | Days  | Status      | Notes |
| --- | ----------------------------------------------------- | ----- | ----- | ----------- | ----- |
| 19  | submitRequest Cloud Function (all sources)            | Randy | 8–10  | Done | `functions/src/submitRequest.ts` — validates against the shared `submitRequestSchema` (`packages/shared-schemas`), donor/hospital-staff/hospital-admin/system_admin callable (lab_tech excluded per `04SECURITY.md`), always lands in `pending_review`, audit-logged. Unit-tested (success + role-rejection + invalid-payload paths). `hospital_direct` requestType isn't submittable from any built UI yet — no hospital-initiated request screen exists (flagged, not built, per scope discipline). |
| 20  | reviewRequest function + admin queue backend          | Randy | 9–11  | Done | `functions/src/reviewRequest.ts` — `system_admin`-only, transactional (closes the double-accept race explicitly named in `06TESTING.md` §2), triggers nothing itself — see task 27. Unit-tested including the double-accept race and not-found cases. |
| 21  | Firestore rules for requests/notification_log + tests | Randy | 10–12 | Done | Covered as part of task 11/12's full rules pass — `requests`/`notification_log` are both Cloud-Functions-only writes, read-scoped per role, with passing rules tests for both. |
| 22  | Push-on-new-request (FCM wiring)                      | Randy | 11–12 | Not Started | Depends on task 27 (broadcast fan-out) landing a real dispatcher first — `notification_log` rows are currently queued with `status: 'queued'` but nothing sends yet (see task 27's note). |
| 23  | Integration test: submit → review → approve           | Joint | 13    | Done | Exercised end-to-end across `functions/test/submitRequest.test.ts` + `reviewRequest.test.ts` + `broadcastRequest.test.ts` (the `pending_review -> approved -> broadcast` transition, PHI-minimized broadcast doc construction, notification_log queuing) — all against a real transactional in-memory Firestore fake, not just mocked calls. Not yet run against a live Firebase project (task 2 blocks that). |

**Milestone — Day 14: Request Pipeline Functional End-to-End** — `Not Started`

---

## Week 3 — Broadcast Infra + Hospital/Admin Ops (Days 15–21)

### Broadcast & Notification Infra

| ID  | Task                                     | Owner | Days  | Status      | Notes |
| --- | ---------------------------------------- | ----- | ----- | ----------- | ----- |
| 24  | WhatsApp Business Cloud API integration  | Randy | 15–17 | Not Started |       |
| 25  | SMS gateway integration (final vendor)   | Randy | 16–18 | Not Started |       |
| 26  | Email provider integration               | Randy | 17–18 | Not Started |       |
| 27  | broadcastRequest fan-out orchestrator    | Randy | 17–19 | In Progress | `functions/src/broadcastRequest.ts` — Firestore trigger (not separately callable, per `03DATAMODEL.md`) on the `pending_review -> approved` transition; builds the PHI-minimized `broadcasts` doc field-by-field (never spreads `requests`), matches eligible donors by blood type + enabled `notificationPrefs` channels, queues one `notification_log` row per donor per channel at `status: 'queued'`. Still missing: the actual dispatch (tasks 24–26, no vendor chosen/no secrets configured yet) that would move a queued row to `sent`/`delivered`/`failed` — this function deliberately stops at "queued" rather than inventing a fake send. |
| 28  | Delivery tracking + rate/cost guardrails | Randy | 18–20 | Not Started |       |

### Hospital & Admin Ops

| ID  | Task                                               | Owner | Days  | Status      | Notes |
| --- | -------------------------------------------------- | ----- | ----- | ----------- | ----- |
| 29  | Hospital inventory screens (batch/lab-test status) | Mai   | 15–18 | Done | `HospitalInventoryScreen` (per-blood-type list, low-stock flag) + `InventoryDetailScreen` (batch lab-test lifecycle, add/deduct stock). Stubbed against `inventorySchema.ts` / `inventoryService.ts`, matching `addInventoryStock`/`deductInventoryStock`/`resolveLabTest` contracts exactly. Built ahead of schedule alongside task 30. |
| 30  | Admin verification + activity log screens          | Mai   | 17–20 | Done | `AdminReviewQueueScreen` + `AdminRequestDetailScreen` (approve/reject, `patientContext` shown admin-only) + `AdminActivityLogScreen`. Stubbed against `reviewSchema.ts` / `reviewService.ts`, matching `reviewRequest`'s contract exactly. Built ahead of schedule since donor-core UI (Week 2) finished early. |

### Testing & Deployment (Week 3 portion)

| ID  | Task                                                 | Owner | Days  | Status      | Notes                                        |
| --- | ---------------------------------------------------- | ----- | ----- | ----------- | -------------------------------------------- |
| 31  | First real end-to-end broadcast test (internal list) | Joint | 20    | Not Started |                                              |
| 36  | TestFlight / Play internal testing submission prep   | Randy | 19–21 | Not Started | Risk mitigation — don't compress this buffer |

**Milestone — Day 21: Broadcast Infra Live (Internal Test)** — `Not Started`

---

## Week 4 — Hardening, Security Review, Launch (Days 22–30)

### Security & Compliance (Week 4 portion)

| ID  | Task                                          | Owner | Days  | Status      | Notes                  |
| --- | --------------------------------------------- | ----- | ----- | ----------- | ---------------------- |
| 13  | OWASP MASVS mobile security self-review       | Randy | 22–24 | Not Started | Hard gate — do not cut |
| 14  | Biometric lock + MFA for admin/hospital roles | Randy | 24–25 | Not Started |                        |

### Testing & QA (Week 4 portion)

| ID  | Task                                        | Owner | Days  | Status      | Notes                       |
| --- | ------------------------------------------- | ----- | ----- | ----------- | --------------------------- |
| 32  | Full Firestore rules test suite run + fixes | Randy | 22–23 | Not Started |                             |
| 33  | Load test broadcast fan-out                 | Randy | 23–24 | Not Started |                             |
| 34  | Localization QA pass (EN/FR)                | Mai   | 22–24 | Not Started |                             |
| 35  | Bug bash — donor-facing flows               | Joint | 24–26 | Not Started | Log findings in `ISSUES.md` |

### Deployment & Launch

| ID  | Task                                           | Owner | Days  | Status      | Notes |
| --- | ---------------------------------------------- | ----- | ----- | ----------- | ----- |
| 37  | App store listing assets (copy, screenshots)   | Mai   | 23–25 | Not Started |       |
| 38  | Staged rollout plan & final security sign-off  | Joint | 26–27 | Not Started |       |
| 39  | Submit to App Store                            | Randy | 26    | Not Started |       |
| 40  | Submit to Play Store                           | Randy | 27    | Not Started |       |
| 41  | Hypercare: monitor first production broadcasts | Joint | 28–30 | Not Started |       |

**Milestone — Day 30: VitalPulse Mobile Launch** — `Not Started`

---

## At-a-glance progress

| Week                 | Tasks | Done | In Progress | Blocked |
| -------------------- | ----- | ---- | ----------- | ------- |
| Week 1 (1–14)        | 12    | 6    | 2           | 0       |
| Week 2 (15–23)       | 9     | 8    | 0           | 0       |
| Week 3 (24–36)       | 9     | 2    | 1           | 0       |
| Week 4 (13,14,32–41) | 13    | 0    | 0           | 0       |

_(Update these counts by hand when you update task statuses above — no formulas here, this is a markdown file. For a live-calculating view, use `VitalPulse_Mobile_30Day_Gantt.xlsx` instead.)_

---

## Daily Log

Add a new entry at the top each time something worth recording happens. Keep entries factual: what changed, what was decided, what's still open — the same discipline as the security master plan's own change log (state what's done, what's deliberately parked, and what still needs a human decision).

### Template

```
## [Day N] — YYYY-MM-DD

**Done:**
-

**Decisions made (and why):**
-

**Blocked / needs a decision:**
-

**Deviations from the plan (and why):**
-
```

### Entries

## [Day N unknown] — 2026-09-16 (backend phase start)

**Done:**
- `packages/shared-schemas` (npm workspace, `@vitalpulse/shared-schemas`) — the actual shared Zod contracts (bloodType, profile, request, review, inventory, role/grantRole) now live in one place; `src/schemas/*.ts` became thin re-exports so no existing client import path changed. Closes CLAUDE.md non-negotiable #8 for real (previously the schemas were client-only with a comment promising future sharing).
- `functions/` — Firebase Cloud Functions (2nd gen, TypeScript) workspace: `submitRequest`, `reviewRequest`, `broadcastRequest` (Firestore trigger, not callable — matches `03DATAMODEL.md`'s "auto-triggered" contract), `addInventoryStock`, `deductInventoryStock`, `resolveLabTest`, `grantRole`, `revokeRole`. Every function re-checks auth/claims (`requireAuth`/`requireRole`/`requireOwnHospital`), validates against the shared schema, and calls `writeAudit()`.
- `firestore.rules` expanded from a `users`-only draft to all 6 `03DATAMODEL.md` collections — deny-by-default root kept, hospital/role scoping added, self-role-elevation blocked on `users/{uid}` writes.
- `tests/rules/firestore.rules.test.ts` — 29 tests, run against the real Firestore emulator (`npm run test:rules`), covering every collection × role plus the hostile cases `06TESTING.md` §2 names explicitly (cross-hospital, self-role-elevation, donor impersonation, claims-less signed-in user, suspended-token denial).
- `functions/test/*.test.ts` — 36 unit tests (success + auth-rejection paths per function, plus the double-accept race on `reviewRequest` and PHI-minimization check on `broadcastRequest`), using `onCall`/`onDocumentUpdated`'s built-in `.run()` test method and a small in-memory Firestore fake — no live project needed to run these.
- CI (`.github/workflows/ci.yml`) split into three jobs: app (unchanged), functions (lint/typecheck/test/build), and a rules-test job that boots the real emulator (`firebase emulators:exec`) — filled in the `functions/ doesn't exist yet` TODO left in the workflow.
- `firebase.json`, `firestore.indexes.json`, `.firebaserc.example` (real `.firebaserc` stays gitignored — no Firebase project exists yet, task 2).

**Decisions made (and why):**
- Chose npm workspaces over a same-shape-but-separately-maintained schema file in each project — `05DEVWORKFLOW.md` §5 already named `packages/shared-schemas` "or equivalent" as the intended structure; workspaces is what makes it an actual single source of truth instead of a convention someone has to remember to keep in sync by hand.
- `broadcastRequest` stops at writing `notification_log` rows with `status: 'queued'` — does not send WhatsApp/SMS/email. Tasks 24–26 (vendor selection/integration) are still Not Started and no secrets are configured; inventing a fake send would violate the "no secrets in client code, no unreviewed vendor path" spirit even though this is server-side, and would have to be ripped out and redone once a real vendor is chosen.
- Resolved an implicit contract gap: `users.bloodType`/`bloodTypeSource` self-report write path was never explicitly stated as direct-Firestore vs. Cloud-Functions-only. Decided direct-write, enforced in `firestore.rules` (not just the client form) — see `03DATAMODEL.md`'s updated client-writable list. Flagged two gaps found but *not* silently resolved: no `suspendUser`/`unsuspendUser` function exists in the contract table, and `requests.hospitalId` being free-text (not a real hospital FK) means the hospital-scoped rules/reads are written against the intended contract but not yet exercisable end-to-end — both logged in `ISSUES.md`.
- `firebase-functions-test` was dropped after `npm install` surfaced a real peer-dependency conflict with `firebase-admin` 14.x (its peer range tops out at ^13). Not missed — v2's `onCall`/`onDocumentUpdated` both expose `.run()` for exactly this unit-testing use case.

**Blocked / needs a decision:**
- No real Firebase project exists yet (task 2) — everything above is verified against the local emulator and unit tests, not a live deploy. `authService.ts`/`requestService.ts`/`reviewService.ts`/`inventoryService.ts` on the client are still stubs; swapping them to real `httpsCallable()` calls is the next concrete step once a project exists.
- `suspendUser`/`unsuspendUser` contract needs a decision before Week 4's manual QA "suspend an account" case can be exercised (see `03DATAMODEL.md`).
- Real phone-OTP sign-in (the other half of task 10) still needs the reCAPTCHA-verifier-strategy decision noted in `authService.ts`'s own comment, independent of everything landed today.

**Deviations from the plan (and why):**
- Tasks 19–21, 23 (Week 2, Days 8–13) and task 27 (Week 3, Days 17–19) were pulled forward alongside tasks 10–12 (Week 1) in a single pass, because the request pipeline's Cloud Functions, its Firestore rules, and its rules tests are one coherent, mutually-dependent unit of work — splitting them across separate days would have meant either leaving rules untested against real functions or functions untested against real rules for longer than necessary. Tasks 24–26 (vendor integrations) were deliberately *not* pulled forward — they need a real product/vendor decision, not just engineering time.

## [Day N unknown — Day 1 kickoff was never logged] — 2026-09-16

**Done:**
- Hospital role screens: `HospitalInventoryScreen` (per-blood-type stock list, low-stock flag) and `InventoryDetailScreen` (batch lab-test lifecycle: waiting_test/cleared/rejected, add/deduct stock), backed by `inventorySchema.ts` + stubbed `inventoryService.ts` matching `addInventoryStock`/`deductInventoryStock`/`resolveLabTest` exactly.
- Admin role screens: `AdminReviewQueueScreen`, `AdminRequestDetailScreen` (approve/reject with required rejection reason, `patientContext` shown admin-only), `AdminActivityLogScreen`, backed by `reviewSchema.ts` + stubbed `reviewService.ts` matching `reviewRequest` exactly.
- New `(hospital)` and `(admin)` tab route groups (mirroring the existing `(donor)` one), plus `HospitalProfileScreen` / `AdminProfileScreen`.
- `hospital` and `admin` i18n namespaces added with full EN/FR parity, registered in `src/i18n/index.ts`.
- Retroactively marked tasks 3, 5, 7, 9, 15–18, 29, 30 `Done` and task 8 `In Progress` above — the tracker hadn't been updated since scaffolding despite this work already existing.

**Decisions made (and why):**
- Gave `authStore` a `role` field, explicitly scoped as UI-routing-only (picks which tab group renders), never read for authorization — same status as `users.role` per `04SECURITY.md` §3. Real role-based redirect still needs Firebase Auth custom claims (task 10) before it can replace this.
- Hospital/admin screens reuse the exact same design system (`src/theme`, `src/components`) as the donor screens — no new components introduced — so the three role experiences read as one app.

**Blocked / needs a decision:**
- Task 8 isn't fully done: there's no automatic redirect yet from sign-in into `(donor)` / `(hospital)` / `(admin)`. That's a deliberate placeholder gap, not an oversight — wiring it for real means deciding the hospital/admin sign-in method (the already-stubbed `authService.signInWithEmail` suggests email/password, but that hasn't been confirmed) and waiting on custom claims (task 10).

**Deviations from the plan (and why):**
- Tasks 29–30 (originally Days 15–20, Week 3) were built now (Day-of-writing) because Week 2's donor-core UI (tasks 15–18) turned out to already be complete, and both are explicitly Day-1-must-ship scope per `02ARCHITECTURE.md` §7 — not fast-follow — so there was no reason to wait.

_(none before this — first entry above)_
