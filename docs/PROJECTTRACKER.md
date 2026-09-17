# VitalPulse Mobile — Project Tracker

**How to use this file:** update it as you go, not at the end of the day from memory. Flip a task's Status when it actually changes, and add a dated entry to the **Daily Log** at the bottom whenever something worth remembering happens — a decision made, a bug found, a scope change, a blocker. This mirrors how the original web app's own `VitalPulse_Plan_Tracker.md` was kept, and it's what lets either of you (or a session picking this back up cold) reconstruct _why_ something is the way it is, not just _that_ it's done.

**Status values:** `Not Started` · `In Progress` · `Blocked` · `Done` · `Cut` (moved to `ROADMAP.md` — scope deliberately removed, not abandoned silently)

Task IDs match the Gantt chart (`VitalPulse_Mobile_30Day_Gantt.xlsx`) exactly — if you need day-by-day visual scheduling, that's the file to open; this file is for status and notes.

---

## Week 1 — Foundation (Days 1–7)

### Foundation & Infrastructure

| ID  | Task                                                 | Owner | Days | Status      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ---------------------------------------------------- | ----- | ---- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Kickoff & requirements lock                          | Joint | 1    | Not Started |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2   | Fresh Firebase project setup                         | Randy | 1–2  | Not Started |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 3   | Repo scaffold: Expo + RN Web (3 targets)             | Randy | 1–2  | Done        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 4   | App Store / Play developer accounts verified         | Randy | 1–2  | Not Started |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 5   | CI/CD: lint, typecheck, tests on every PR            | Randy | 2–3  | Done        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 6   | SMS gateway evaluation & real deliverability test    | Randy | 2–5  | Not Started | Vendor decision blocks Week 3 — see `DEPENDENCIES.md` candidates                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 7   | Design system / component library                    | Mai   | 2–5  | Done        | `src/theme` tokens + `src/components` (AppText, Button, Card, Pill, StepperControl, etc.) shared across donor/hospital/admin screens.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8   | Role-routed navigation shells (Donor/Hospital/Admin) | Mai   | 3–5  | In Progress | `(donor)`, `(hospital)`, `(admin)` are now three mutually exclusive route subtrees, gated by root-level `Stack.Protected` guards keyed off `authStore.role` — one role's screens (tabs and pushed detail screens) can no longer mount in another role's session, closing the cross-role deep-link/data-leak gap this task previously had. Still missing: the actual auth-driven redirect that sets `role` from a verified identity — depends on task 10 (custom claims) landing first; `authStore.role` is a client-side, routing-only placeholder in the meantime (mirrors `users.role`'s "cosmetic only" status per `04SECURITY.md` §3; mechanism documented in `04SECURITY.md` §11). |
| 9   | Localization scaffolding (EN/FR)                     | Mai   | 4–5  | Done        | i18next wired with `auth`, `donor`, `hospital`, `admin` namespaces, full EN/FR parity.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### Security & Compliance (Week 1 portion)

| ID  | Task                                              | Owner | Days | Status      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ------------------------------------------------- | ----- | ---- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10  | Auth: phone OTP + custom claims scaffold          | Randy | 2–5  | In Progress | Custom-claims _consumption_ is fully built and tested: `functions/src/lib/authz.ts` (requireAuth/requireRole/requireOwnHospital), `grantRole`/`revokeRole` (set claims + `revokeRefreshTokens`), and every `firestore.rules` collection all key off `request.auth.token`. Still missing: real phone-OTP sign-in itself (`authService.ts` is still the stub) and a real Firebase project (task 2) to actually issue those claims against. |
| 11  | Firestore schema v1 + deny-by-default rules draft | Randy | 3–6  | Done        | `firestore.rules` covers all 6 collections in `03DATAMODEL.md` (`users`, `requests`, `broadcasts`, `notification_log`, `inventory`, `auditLogs`), deny-by-default root, hospital-scoped/role-scoped reads, self-role-elevation blocked on `users/{uid}`.                                                                                                                                                                                 |
| 12  | Firestore rules test suite (skeleton)             | Randy | 5–7  | Done        | `tests/rules/firestore.rules.test.ts` — 29 tests, all passing against the real Firestore emulator (`npm run test:rules`, wired into CI as its own job). Covers every collection × role, plus the hostile cases in `06TESTING.md` §2 (cross-hospital, self-role-elevation, donor impersonation, claims-less signed-in user, suspended-token denial).                                                                                      |

**Milestone — Day 7: Architecture & Foundation Complete** — `Not Started`

---

## Week 2 — Donor Core + Request Pipeline (Days 8–14)

### Donor Core Experience

| ID  | Task                                             | Owner | Days  | Status | Notes                                                                                                                    |
| --- | ------------------------------------------------ | ----- | ----- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| 15  | Donor profile UI (incl. unknown blood type flow) | Mai   | 8–10  | Done   | `ProfileScreen` + `profileSetupSchema` (allows `self_reported`/`unknown`, never `lab_confirmed` client-side).            |
| 16  | Request submission forms (directed / shortage)   | Mai   | 9–12  | Done   | `RequestBloodScreen` + `ReportShortageScreen`, both against `requestSchemas.ts`, stubbed `requestService.submitRequest`. |
| 17  | Notification preference center UI                | Mai   | 10–11 | Done   | `NotificationPreferencesScreen`.                                                                                         |
| 18  | Badges, points & tier UI                         | Mai   | 11–13 | Done   | `BadgesScreen` + `DonationHistoryScreen` + `BloodCompatibilityScreen`.                                                   |

### Request & Moderation Pipeline

| ID  | Task                                                  | Owner | Days  | Status      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | ----------------------------------------------------- | ----- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 19  | submitRequest Cloud Function (all sources)            | Randy | 8–10  | Done        | `functions/src/submitRequest.ts` — validates against the shared `submitRequestSchema` (`packages/shared-schemas`), donor/hospital-staff/hospital-admin/system_admin callable (lab_tech excluded per `04SECURITY.md`), always lands in `pending_review`, audit-logged. Unit-tested (success + role-rejection + invalid-payload paths). `hospital_direct` requestType isn't submittable from any built UI yet — no hospital-initiated request screen exists (flagged, not built, per scope discipline). |
| 20  | reviewRequest function + admin queue backend          | Randy | 9–11  | Done        | `functions/src/reviewRequest.ts` — `system_admin`-only, transactional (closes the double-accept race explicitly named in `06TESTING.md` §2), triggers nothing itself — see task 27. Unit-tested including the double-accept race and not-found cases.                                                                                                                                                                                                                                                 |
| 21  | Firestore rules for requests/notification_log + tests | Randy | 10–12 | Done        | Covered as part of task 11/12's full rules pass — `requests`/`notification_log` are both Cloud-Functions-only writes, read-scoped per role, with passing rules tests for both.                                                                                                                                                                                                                                                                                                                        |
| 22  | Push-on-new-request (FCM wiring)                      | Randy | 11–12 | Not Started | Depends on task 27 (broadcast fan-out) landing a real dispatcher first — `notification_log` rows are currently queued with `status: 'queued'` but nothing sends yet (see task 27's note).                                                                                                                                                                                                                                                                                                             |
| 23  | Integration test: submit → review → approve           | Joint | 13    | Done        | Exercised end-to-end across `functions/test/submitRequest.test.ts` + `reviewRequest.test.ts` + `broadcastRequest.test.ts` (the `pending_review -> approved -> broadcast` transition, PHI-minimized broadcast doc construction, notification_log queuing) — all against a real transactional in-memory Firestore fake, not just mocked calls. Not yet run against a live Firebase project (task 2 blocks that).                                                                                        |

**Milestone — Day 14: Request Pipeline Functional End-to-End** — `Not Started`

---

## Week 3 — Broadcast Infra + Hospital/Admin Ops (Days 15–21)

### Broadcast & Notification Infra

| ID  | Task                                     | Owner | Days  | Status      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ---------------------------------------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 24  | WhatsApp Business Cloud API integration  | Randy | 15–17 | Not Started |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 25  | SMS gateway integration (final vendor)   | Randy | 16–18 | Not Started |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 26  | Email provider integration               | Randy | 17–18 | Not Started |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 27  | broadcastRequest fan-out orchestrator    | Randy | 17–19 | In Progress | `functions/src/broadcastRequest.ts` — Firestore trigger (not separately callable, per `03DATAMODEL.md`) on the `pending_review -> approved` transition; builds the PHI-minimized `broadcasts` doc field-by-field (never spreads `requests`), matches eligible donors by blood type + enabled `notificationPrefs` channels, queues one `notification_log` row per donor per channel at `status: 'queued'`. Still missing: the actual dispatch (tasks 24–26, no vendor chosen/no secrets configured yet) that would move a queued row to `sent`/`delivered`/`failed` — this function deliberately stops at "queued" rather than inventing a fake send. |
| 28  | Delivery tracking + rate/cost guardrails | Randy | 18–20 | Not Started |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### Hospital & Admin Ops

| ID  | Task                                               | Owner | Days  | Status | Notes                                                                                                                                                                                                                                                                                                                                    |
| --- | -------------------------------------------------- | ----- | ----- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 29  | Hospital inventory screens (batch/lab-test status) | Mai   | 15–18 | Done   | `HospitalInventoryScreen` (per-blood-type list, low-stock flag) + `InventoryDetailScreen` (batch lab-test lifecycle, add/deduct stock). Stubbed against `inventorySchema.ts` / `inventoryService.ts`, matching `addInventoryStock`/`deductInventoryStock`/`resolveLabTest` contracts exactly. Built ahead of schedule alongside task 30. |
| 30  | Admin verification + activity log screens          | Mai   | 17–20 | Done   | `AdminReviewQueueScreen` + `AdminRequestDetailScreen` (approve/reject, `patientContext` shown admin-only) + `AdminActivityLogScreen`. Stubbed against `reviewSchema.ts` / `reviewService.ts`, matching `reviewRequest`'s contract exactly. Built ahead of schedule since donor-core UI (Week 2) finished early.                          |

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

## [Day N unknown] — 2026-09-17 (app-wide type scale increase)

**Done:**

- Bumped `src/theme/tokens.ts`'s `typeScale` — the shared token block every screen's text ultimately reads from via `AppText` — across the board: `bodyM` 14→17, `bodyS` 13→15, `caption` 11→13, `titleM` 22→24, `screenTitle` 17→19, `sectionLabel` 13→14, `displayL` 30→34, `displayXl` 40→44, `numeric` 30→34. Line heights scaled to match; letter-spacing kept the same spacing-to-size ratio the original Figma tokens used.
- Also bumped the handful of places that hardcode a `fontSize` instead of going through `AppText`/`typeScale`, so they don't fall out of step with the new baseline: `TextField.tsx` (16→17), `OtpDigitInput.tsx`'s digit boxes (20→24), `CountryPickerModal.tsx`'s search input (16→17) and flag glyph (22→24), `PhoneEntryScreen.tsx`'s dial-code chip and number input (20→22).
- Checked the shared component library (`Pill`, `StepperControl`, `Card`, etc.) for fixed-height containers that a larger font could clip — none found; sizing there is padding-driven, not fixed-height, so it absorbs the bump safely.
- Verified: `eslint .` and `tsc --noEmit` clean on every touched file, `prettier --check`/`--write` clean.

**Decisions made (and why):**

- The Figma-derived type scale (`02ARCHITECTURE.md`/`03DATAMODEL.md` don't govern this, but `tokens.ts`'s own header comment previously said "pulled from Figma") was explicitly called out by the team as a starting reference, not a target to match pixel-for-pixel — it read too small on a real device. Fixed at the token level rather than per-screen, since the four onboarding screens already got manual `variant` bumps in the previous pass (e.g. `titleM`→`displayL`) and hand-tuning every remaining screen individually would just drift out of sync with itself over time. This is a global, one-place change specifically because CLAUDE.md's coding conventions already centralize type in `src/theme` for exactly this reason.

**Blocked / needs a decision:**

- None new — this is a token value change, not a design decision requiring sign-off, though a real device/simulator pass across hospital/admin dense-data screens (mentioned in `02ARCHITECTURE.md` §5 as the "RN Web fighting the framework" trade-off area) is worth doing before calling this done, since those screens weren't visually re-checked here.

**Deviations from the plan (and why):**

- None — visual polish on already-built screens, not new Gantt-scheduled scope.

## [Day N unknown] — 2026-09-17 (donor onboarding visual pass: splash, welcome, notification primer, phone entry)

**Done:**

- Splash screen: auto-advance timer bumped from 1200ms to a flat 3000ms hold, with a comment flagging this is a placeholder for the planned connectivity-aware version (not built yet). Also added the `VitalPulseMark` logo above the wordmark, since it was previously just plain text.
- Welcome/onboarding screen (`OnboardingScreen.tsx`): replaced the flat concentric-circle placeholder with a real vector illustration (`WelcomeIllustration`, new `src/components/illustrations/`, built on `react-native-svg`), and restructured the layout so the hero content is vertically centered in the available space instead of clustering at the top with dead space below it. Bumped title to the `displayL` type scale and subtitle to `bodyM`.
- Notification primer screen (`NotificationPrimerScreen.tsx`): bumped title to `displayL`, subtitle/benefit rows to `bodyM`, enlarged the icon circle and benefit checkmarks. Confirmed (no logic change needed) that tapping "Enable notifications" already calls `expo-notifications`' `requestPermissionsAsync()`, which triggers the native OS permission prompt — this was already correct, just under-sized visually.
- Phone entry screen (`PhoneEntryScreen.tsx`): the biggest change of this pass.
  - Replaced the hardcoded `+237`-only, non-interactive dial-code chip with a real country picker (`CountryPickerModal`, new `src/features/donor/auth/components/`): every ISO country libphonenumber-js knows a calling code for, searchable by name/code/dial-code, flag rendered from the ISO code (no image assets needed), display name from the JS engine's built-in `Intl.DisplayNames` (no extra data package).
  - Added per-country phone-number-length enforcement (`src/features/donor/auth/utils/countries.ts`, wrapping `libphonenumber-js`'s `validatePhoneNumberLength`): typing past a country's valid length is blocked outright (the keystroke is rejected) rather than silently accepted, with an inline error; a too-short submit is also caught with its own message before hitting the network call.
  - Added the `PhoneIllustration` SVG (new `src/components/illustrations/`), bumped title to `displayL`, subtitle/label/terms/facility-link text up a step, and enlarged the phone-number input row (min height 64, 20px font) for a much less "empty" feel.
  - Updated the `AppLockupHeader` caption from the hardcoded "Cameroon"/"Cameroun" to a country-agnostic "Donor sign-in"/"Connexion donateur", since the field is no longer Cameroon-only.
- New pinned dependencies (checked against the npm registry / Expo's SDK 57 compatibility table, not memory — see `DEPENDENCIES.md`): `react-native-svg@15.15.4` (via `npx expo install`, Expo-compatible pin) and `libphonenumber-js@1.13.13` (plain `npm install`, then hand-pinned off the `^` range npm writes by default, per the project's no-caret-ranges rule).
- **Real bug found on-device, fixed:** after this landed, the physical test device hit `Unable to resolve module ./metadata.min.json` from `libphonenumber-js` at runtime (500 from the Metro dev server) — lint/typecheck/prettier had all passed because none of them actually bundle the app, so this only surfaced once someone opened the phone-entry screen for real. Root cause: Metro's package-exports-aware resolver (on by default, bundled with Expo SDK 57's Metro) can't resolve `libphonenumber-js`'s `package.json#exports` entry that points a subpath straight at a `.json` file — a known Metro bug class, not specific to this app or this fix. Added the project's first `metro.config.js`, setting `config.resolver.unstable_enablePackageExports = false`. Confirmed fixed with a full `npx expo export --platform android` static bundle (2300 modules, no resolution errors) — see `DEPENDENCIES.md` for the full note and the "future dependencies" caution this flag implies.
- Full verification: `eslint .` (0 errors, same 3 pre-existing warnings as before this change), `tsc --noEmit` (clean), `prettier --check` on every touched/new file (clean after one `--write` pass), `npm run test` (still 0 tests project-wide — pre-existing gap, not introduced here), plus the `expo export` bundle check above once the Metro issue surfaced.

**Decisions made (and why):**

- For the "add a perfect PNG image" asks on the welcome and phone-entry screens: no image-generation or image-editing tool is available in this environment, and fetching an unlicensed image off the web for a production PHI-adjacent app was ruled out. Asked the team, which chose a real SVG illustration library (`react-native-svg`) with hand-authored on-brand vector art over supplying PNG files or a stock-illustration package — avoids licensing risk and matches the app's "no image assets used in-app today except the logo" baseline.
- For the country picker: no such library existed in the repo. Team chose `libphonenumber-js` (dial codes + exact per-country length metadata, pure JS, ~13M weekly downloads) plus the JS engine's built-in `Intl.DisplayNames` for country names, over adding a second data-only package — one new dependency instead of two, and Intl.DisplayNames is standard, Hermes-supported, boring API rather than another npm package to carry.

**Blocked / needs a decision:**

- **Flagging, not fixing:** `src/schemas/authSchemas.ts` (phone/OTP/email schemas) is still a standalone file, not a re-export from `packages/shared-schemas` — unlike the five other schema files (`bloodType`, `profile`, `request`, `review`, `inventory`/`role`), which were already promoted to the shared workspace package per CLAUDE.md non-negotiable #8 (see the 2026-09-16 backend-phase entry below). This predates this session's changes; the new per-country length check added this pass is deliberately kept client-side-only (UX layer, not a competing format check) rather than touching the shared schema, since doing that properly means deciding whether Cloud Functions should also enforce per-country length — a real design decision, not something to invent silently mid-UI-pass. Needs a human call on whether/when to promote `authSchemas.ts` into `@vitalpulse/shared-schemas`.

**Deviations from the plan (and why):**

- None — this was a UI/UX polish pass on already-built onboarding screens, not new Gantt-scheduled scope.

## [Day N unknown] — 2026-09-17 (Expo SDK 54 → 57)

**Done:**

- Bumped the app from Expo SDK 54 to **SDK 57** after the team's physical test device's Expo Go app auto-updated (Play Store) past SDK 54, breaking the "Project is incompatible with this version of Expo Go" case. Standard flow: `npx expo install expo@57.0.23` then `npx expo install --fix`, plus manually pinning the four devDependencies `--fix` flagged (`typescript` ~6.0.3, `jest-expo` ~57.0.5, `eslint-config-expo` ~57.0.2, `@types/react` ~19.2.4) — full table in `DEPENDENCIES.md`.
- Also diagnosed (separately) a "Failed to download remote update" error as Metro/Expo advertising a LAN IP the phone couldn't reach, given several virtual network adapters on the dev machine (Hyper-V vEthernet, VirtualBox-style adapter, mobile-hotspot adapter) — fixed by using `npx expo start --tunnel` instead of default LAN mode.
- Fixed real fallout from the `typescript` 5.9.3 → 6.0.3 bump: `tests/rules/firestore.rules.test.ts` lost its ambient Jest globals (`describe`/`test`/`beforeAll`/...) under both the app's own `tsc --noEmit` and `ts-jest` (used by `npm run test:rules`), because Expo's SDK 57 `tsconfig.base` now sets `moduleResolution: "bundler"` / `module: "preserve"`, which resolves `@types/jest` differently than the old config did. Fixed by giving `tests/rules/` its own standalone `tsconfig.json` (same isolation pattern `functions/` already used) instead of inheriting the RN app's tsconfig — re-verified: 29/29 rules tests passing again against the real emulator.
- Re-ran the full verification matrix after the bump: app lint/typecheck/test, functions lint/typecheck/test (36/36) + build, rules tests (29/29) — all clean.

**Decisions made (and why):**

- Chose "upgrade the project to SDK 57" over "sideload an old SDK-54 Expo Go APK on the device" (both were offered; the team picked upgrade). Documented the actual reasoning for future reference: pinning the project backward to match one device's _current_ Expo Go build is a losing battle, since the Play Store keeps auto-updating Expo Go regardless of what the project targets — this exact cycle (pin to match device → device auto-updates → mismatch again) already happened once (2026-08-20 → 2026-09-17). Flagged a real fix for next time it recurs: build a real EAS development client instead of depending on the public Expo Go app, since a dev client pins its own SDK per build.

**Blocked / needs a decision:**

- None new from this pass — this was a mechanical dependency-compatibility fix, not a design decision.

**Deviations from the plan (and why):**

- Not Gantt-scheduled work — this was reactive (device-side Expo Go auto-update broke local dev), not part of any numbered task, and is logged here rather than against a task ID for that reason.

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
- Resolved an implicit contract gap: `users.bloodType`/`bloodTypeSource` self-report write path was never explicitly stated as direct-Firestore vs. Cloud-Functions-only. Decided direct-write, enforced in `firestore.rules` (not just the client form) — see `03DATAMODEL.md`'s updated client-writable list. Flagged two gaps found but _not_ silently resolved: no `suspendUser`/`unsuspendUser` function exists in the contract table, and `requests.hospitalId` being free-text (not a real hospital FK) means the hospital-scoped rules/reads are written against the intended contract but not yet exercisable end-to-end — both logged in `ISSUES.md`.
- `firebase-functions-test` was dropped after `npm install` surfaced a real peer-dependency conflict with `firebase-admin` 14.x (its peer range tops out at ^13). Not missed — v2's `onCall`/`onDocumentUpdated` both expose `.run()` for exactly this unit-testing use case.

**Blocked / needs a decision:**

- No real Firebase project exists yet (task 2) — everything above is verified against the local emulator and unit tests, not a live deploy. `authService.ts`/`requestService.ts`/`reviewService.ts`/`inventoryService.ts` on the client are still stubs; swapping them to real `httpsCallable()` calls is the next concrete step once a project exists.
- `suspendUser`/`unsuspendUser` contract needs a decision before Week 4's manual QA "suspend an account" case can be exercised (see `03DATAMODEL.md`).
- Real phone-OTP sign-in (the other half of task 10) still needs the reCAPTCHA-verifier-strategy decision noted in `authService.ts`'s own comment, independent of everything landed today.

**Deviations from the plan (and why):**

- Tasks 19–21, 23 (Week 2, Days 8–13) and task 27 (Week 3, Days 17–19) were pulled forward alongside tasks 10–12 (Week 1) in a single pass, because the request pipeline's Cloud Functions, its Firestore rules, and its rules tests are one coherent, mutually-dependent unit of work — splitting them across separate days would have meant either leaving rules untested against real functions or functions untested against real rules for longer than necessary. Tasks 24–26 (vendor integrations) were deliberately _not_ pulled forward — they need a real product/vendor decision, not just engineering time.

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
