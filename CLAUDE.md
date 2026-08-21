# CLAUDE.md

This file orients Claude (or any AI coding agent) working in the **VitalPulse Mobile** repository. Read this first, every session. It summarizes the eight project docs into the rules that matter for writing code here — the docs themselves are the source of truth for detail; this file is the fast-path so you don't have to re-derive them from scratch every time.

## Project snapshot

VitalPulse Mobile is a ground-up React Native (+ React Native Web) rebuild of a blood donation coordination platform, targeting iOS, Android, and Web from one codebase. Donors, hospitals, and admins all authenticate through this one app and are routed by role. It handles real human health data (blood type, donation history, patient requests) — security is a hard requirement on every change, not a follow-on pass.

**Team:** Engr Ojong Randy (React Native / security lead) and Engr Mai Randy (delivery support, UI/forms/read-heavy screens). Two people, 30-day build window. If you're generating a lot of code fast, remember a human still has to review and maintain all of it on this team size — favor clarity over cleverness.

**Timeline:** 30-day ground-up build. The legacy Firebase web app (`vitalpulse_app`) keeps running until this app launches, then retires — do not touch that repo from here.

## Doc map — read the relevant one before touching that area

| Doc                  | Read before...                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `01-README.md`       | Anything — orientation and quick start                                                                       |
| `02-ARCHITECTURE.md` | Changing tech stack, adding a major dependency, or working across the request→broadcast flow                 |
| `03-DATA-MODEL.md`   | Touching any Firestore collection or Cloud Function — **this is the contract, don't invent fields**          |
| `04-SECURITY.md`     | Touching auth, roles, `firestore.rules`, or anything PHI-adjacent — **non-negotiable, read this every time** |
| `05-DEV-WORKFLOW.md` | Branching, env vars, secrets handling, who owns what                                                         |
| `06-TESTING.md`      | Before marking any task done                                                                                 |
| `07-DEPLOYMENT.md`   | Builds, store submission, rollback                                                                           |
| `DEPENDENCIES.md`    | Installing or upgrading **any** package                                                                      |

## Non-negotiables (never violate these, regardless of what's asked)

1. **Deny by default.** Every Firestore collection is deny-by-default; every exception is explicit and covered by a rules test. If you add a collection without a rule + test, that's a bug, not a shortcut.
2. **No direct client writes to sensitive collections.** `requests`, `broadcasts`, `notification_log`, `inventory`, `users.role`/`isVerified`/`isSuspended`, `auditLogs` — all Cloud-Functions-only. See `03-DATA-MODEL.md` for the exact client-writable field list per collection (it's short, and it's the exception, not the default).
3. **Only `reviewRequest` (system_admin) can approve a request, and only approval triggers `broadcastRequest`.** No source — not even a hospital — gets an auto-publish path. If you're implementing anything that skips the moderation queue, stop and re-read `02-ARCHITECTURE.md` §4.
4. **PHI minimization is structural, not a filter.** `broadcasts` documents are built field-by-field from scratch in `broadcastRequest` — never by copying or redacting a `requests` doc. Adding a field to the broadcast payload is a deliberate, reviewable line of code, not a side effect of a spread operator.
5. **Every privileged Cloud Function calls `writeAudit()`.** If you write a new one that mutates role, verification, suspension, request status, or inventory and it doesn't audit-log, it's incomplete.
6. **Secrets never enter client code.** WhatsApp/SMS/email API keys are Cloud Functions environment config only. If you're about to put a key in `.env.local`, an `app.config.ts` value that ships in the bundle, or anywhere under the mobile app's source tree, stop.
7. **Blood type trust levels are load-bearing, not cosmetic.** `bloodTypeSource` (`self_reported`/`lab_confirmed`/`unknown`) must be checked anywhere urgent compatibility matching happens. Never treat an unverified self-report with the same confidence as a lab-confirmed type in code that feeds an emergency broadcast.
8. **Shared Zod schemas, not parallel validation.** Client form validation and Cloud Function input validation import the _same_ schema. If you write validation logic twice, you've already introduced future drift.
9. **No unpinned dependency installs.** Every package version is pinned in `DEPENDENCIES.md`. Never run a bare `npm install <pkg>` without a version, never `npm update`, never hand-edit a `^`/`~` range. If you need a new dependency, add it to `DEPENDENCIES.md` with a version checked against the live npm registry in the same change — don't rely on training data for a version number, package versions change constantly.
10. **Firestore rules changes require rules-test-suite changes in the same PR.** An untested rule is, for this project's purposes, an unverified rule — treat it as broken until proven otherwise.

## Architecture quick reference

- **Stack:** React Native + Expo (managed, EAS) + `react-native-web`; React Navigation; TanStack Query (server state) + Zustand (local state); React Hook Form + Zod; Firebase (Firestore, Auth, Cloud Functions 2nd gen, FCM); i18next (EN/FR). Full rationale in `02-ARCHITECTURE.md`.
- **Everything privileged is server-side.** The client is treated as fully compromised — every authorization decision is re-made in a Cloud Function or a Firestore rule, never trusted from the app.
- **The request pipeline is unified.** Hospital-created, donor-directed-patient, and donor-reported-shortage requests all use the same `requests` collection, same `submitRequest`/`reviewRequest` functions, same state machine. Don't create a parallel path for a new request source — extend `requestType`.
- **Hospital/admin dense-data screens may need a React-DOM escape hatch.** RN Web is the default target for everything; if a specific screen (data grids, verification queues) is fighting the framework, that's a known, discussed trade-off (`02-ARCHITECTURE.md` §5), not a reason to compromise the data layer — the backend/business-logic layer stays shared either way.

## Data model quick reference

See `03-DATA-MODEL.md` for full schemas. The shape to remember: `users`, `requests`, `broadcasts`, `notification_log`, `inventory`, `auditLogs`. State machine: `pending_review → approved → broadcast → fulfilled|expired`, or `pending_review → rejected`. Six Cloud Functions carry all privileged writes: `submitRequest`, `reviewRequest`, `broadcastRequest` (auto-triggered, not directly callable), `addInventoryStock`/`deductInventoryStock`, `resolveLabTest`, `grantRole`/`revokeRole`.

## Coding conventions

- TypeScript everywhere in `src/` — no new `.js` files.
- ESLint + Prettier configs are checked in and CI-enforced; run both before pushing.
- Shared validation schemas live in one package, imported by client and Cloud Functions alike.
- Prefer Excel-2007-era-equivalent stability in general: boring, well-supported APIs over bleeding-edge ones, given the two-person team has to carry whatever gets written.
- Branch naming: `feature/<desc>`, `fix/<desc>`, `security/<desc>`. One PR per task where practical, linked to its Gantt task ID.

## Testing expectations before you call anything done

- Lint + typecheck clean.
- Unit tests for any Cloud Function touched (success path + auth-rejection paths).
- Firestore rules tests for any change to `firestore.rules` or a collection schema — including hostile cases (cross-hospital access, self-elevation, unauthenticated/claims-less access).
- See `06-TESTING.md` for the full checklist, including the milestone-gated integration tests (Day 13 pipeline test, Day 20 broadcast test) and the manual QA checklist for donor-facing flows.

## Scope discipline

Feature scope is deliberately cut for the 30-day Day-1 launch — see `02-ARCHITECTURE.md` §7. **If asked to build something not on the Day-1 list (WhatsApp chatbot, full gamification, Apple Health/Google Fit, national dashboards, full offline sync, inter-hospital transfers, USSD), flag that it's fast-follow scope rather than building it silently.** Scope creep on a two-person, 30-day, security-first project is the single biggest risk on the Gantt chart's own risk register — don't be the source of it.

## When a contract is missing

If you're about to build UI or logic against a Firestore field, collection, or Cloud Function contract that isn't documented in `03-DATA-MODEL.md`, stop and flag it rather than inventing the shape and hoping it matches what the other engineer builds. Propose the addition to `03-DATA-MODEL.md` in the same PR that needs it.

## Quick commands (once the repo is scaffolded per `05-DEV-WORKFLOW.md`)

```bash
npm ci                          # install from lockfile — never bare `npm install` on a fresh clone
npx expo start                  # run the dev server
firebase emulators:start        # local Firestore/Auth/Functions emulators
npm run lint && npm run typecheck
npm run test                    # unit tests
firebase emulators:exec "npm run test:rules"   # Firestore rules test suite
eas build --profile <dev|staging|production> --platform all
```

Exact versions for everything invoked above: `DEPENDENCIES.md`. If a command here doesn't exist yet in `package.json`, that's a Week 1 scaffolding gap to fix, not a signal to improvise a different tool.
