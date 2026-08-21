# VitalPulse Mobile

A ground-up React Native rebuild of VitalPulse — a blood donation coordination platform — targeting **iOS, Android, and Web from a single codebase**. Donors, hospitals, and admins all sign into this one app and are routed to the right experience by role.

This file is the front door. It doesn't repeat what the other six project docs already say — it tells you which one to open.

## Project docs map

| File                       | Read this when you need to...                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `01-README.md` (this file) | Orient yourself, find the right doc, run the app locally                                                     |
| `02-ARCHITECTURE.md`       | Understand the system design, tech stack, and _why_ each choice was made                                     |
| `03-DATA-MODEL.md`         | Look up a Firestore collection's fields, a Cloud Function's contract, or the request→broadcast state machine |
| `04-SECURITY.md`           | Implement or review anything touching auth, roles, Firestore rules, or PHI                                   |
| `05-DEV-WORKFLOW.md`       | Set up your machine, learn the branching/PR process, or see who owns what                                    |
| `06-TESTING.md`            | Know what tests are required before a PR merges, or run the test suite                                       |
| `07-DEPLOYMENT.md`         | Ship a build, submit to the stores, or roll back a bad release                                               |
| `DEPENDENCIES.md`          | Check an exact pinned package version before installing anything                                             |

## Team

- **Engr Ojong Randy** — React Native, security/architecture lead. Owns auth, Firestore rules, Cloud Functions, the broadcast/notification infrastructure, CI/CD, and store submission.
- **Engr Mai Randy** — delivery support. Owns UI screens, forms, and read-heavy views, built against data contracts Randy defines first (see `03-DATA-MODEL.md`).

## Timeline

30 days, ground-up rebuild. The current Firebase web app (`vitalpulse_app`) keeps running until this app is ready, then retires. See the project's Gantt chart (delivered separately) for the day-by-day schedule, and `07-DEPLOYMENT.md` for the launch-day checklist.

## Quick start

```bash
# 1. Clone and install (see DEPENDENCIES.md for exact pinned versions — do not run `npm update`)
git clone <repo-url> vitalpulse-mobile
cd vitalpulse-mobile
npm ci                     # uses package-lock.json — never `npm install` for a fresh clone

# 2. Copy environment template and fill in your own Firebase project config
cp .env.example .env.local

# 3. Start the dev server (Expo)
npx expo start

# 4. Run against the Firebase emulator suite (required for anything touching Firestore rules)
firebase emulators:start
```

Full setup, including Firebase project access and required accounts, is in `05-DEV-WORKFLOW.md`.

## Scope note

This is a **fresh codebase**, not a port. Feature scope for the 30-day launch is deliberately cut — see `02-ARCHITECTURE.md` §7 for the Day-1-launch vs. fast-follow split. If a feature isn't in that Day-1 list, it does not get built now, no matter how easy it looks — that's how a two-person team hits both the deadline and the security bar.
