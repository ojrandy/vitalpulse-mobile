# Dev Workflow

## 1. One-time machine setup

1. Install Node.js **22 LTS** (see `DEPENDENCIES.md` for why not a newer major).
2. Install the package manager pinned in `DEPENDENCIES.md` (npm — use `npm ci`, never `npm install`, on an existing lockfile).
3. Install the Expo/EAS CLI versions pinned in `DEPENDENCIES.md`: `npm install -g eas-cli@<pinned>`.
4. Install the Firebase CLI (`firebase-tools`, pinned version) and run `firebase login`.
5. Get added to the Firebase project (Randy grants access) and the Apple/Google developer accounts (see `07-DEPLOYMENT.md`).
6. Copy `.env.example` → `.env.local` and fill in your own Firebase config — **never commit `.env.local`**.
7. Run `firebase emulators:start` once to confirm the local emulator suite works before writing any Firestore-rules-dependent code.

## 2. Branching & PRs

- Two-tier branch model: `development` is the staging branch — all work lands there first. `main` is always deployable and only ever moves forward via a `development` → `main` promotion (merge/PR), never a direct push or commit.
- Branch naming: `feature/<short-desc>`, `fix/<short-desc>`, `security/<short-desc>`, branched off `development`.
- Open PRs against `development`, not `main`. One PR per task on the Gantt chart where practical — keeps review small and traceable.
- **Every PR must pass CI before merge:** lint, typecheck, unit tests, and — for anything touching `firestore.rules` or a Cloud Function — the rules test suite. See `06-TESTING.md`.
- PR description should link the Gantt task ID it corresponds to.
- Squash-merge preferred, so `development` history reads as one commit per completed task.
- Promote `development` → `main` deliberately (e.g. at a milestone or before a deploy per `07-DEPLOYMENT.md`), via its own PR — not as a side effect of merging a feature branch.

## 3. Who owns what (task-split principle, not a hard wall)

- **Randy:** Firebase project/config, Auth, Firestore rules, all Cloud Functions, WhatsApp/SMS/email integrations, broadcast orchestration, CI/CD, security review, store submission.
- **Mai:** UI screens, forms, navigation, design-system components, localization strings, read-heavy list/detail screens (hospital inventory view, admin logs view). Always builds against the contracts in `03-DATA-MODEL.md` — if a contract doesn't exist yet for what you're building, flag it to Randy before writing UI around a guess.
- Neither of you should be blocked waiting on the other for more than a day — if a contract is missing, that's a same-day conversation, not a blocker to work around silently.

## 4. Environment variables & secrets

- Client-side config (`.env.local`, loaded via `expo-constants`/`app.config.ts`): Firebase project config only — nothing secret. Firebase client config is not a secret by design, but keep it out of version control anyway to avoid per-developer project confusion.
- Server-side secrets (WhatsApp Business API token, SMS gateway key, email provider key): set via `firebase functions:config:set` or Cloud Functions environment config — **never** in client code, `.env` files that ship in the app bundle, or committed anywhere.
- Rotate any secret that touches a shared channel (Slack, screen share, etc.) even accidentally.

## 5. Code style

- TypeScript throughout — no new `.js` files in `src/`.
- ESLint + Prettier configs are checked in; run `npm run lint` and `npm run format` before pushing. CI fails the build on lint errors, not just warnings.
- Shared Zod schemas live in one package (`packages/shared-schemas` or equivalent) and are imported by both the client form layer and the Cloud Functions — this is what keeps `03-DATA-MODEL.md` true in code, not just on paper.

## 6. Daily rhythm (recommended, not mandatory)

Given the 30-day window and two-person team, a short daily sync (async message is fine) covering: what merged yesterday, what's blocked, what's landing today — beats a scheduled meeting. Use it specifically to catch Mai being blocked on a missing contract before it costs a full day.

## 7. Definition of done (per task)

A Gantt task is not "done" until: code merged to `main`, relevant tests passing in CI (see `06-TESTING.md`), and — for anything security-relevant — the rules test suite updated to cover the new surface, not just the happy path.
