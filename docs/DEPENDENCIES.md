# Dependencies — Pinned Versions

**Purpose of this file:** one place to check an exact version before installing anything, so nobody's local environment silently drifts from anyone else's and nobody triggers an unnecessary/unexpected download by running `npm install <pkg>` without a version, or `npm update`. **Always install with the exact version pinned here** (`npm install <pkg>@<version>`), and **always commit `package-lock.json`** — every teammate and CI run should resolve the identical dependency tree.

Versions below were checked against the npm registry directly (not from training-data memory) on **August 20, 2026**. Re-verify before Day 1 kickoff if kickoff is more than a few days after this was generated — pin whatever is current *then*, and update this file in the same commit.

**Rule for the whole project:** no bare `npm install <pkg>` (unpinned), no `npm update`, no `^`/`~` ranges added by hand in `package.json` beyond what the tooling itself writes. If a version needs to change, it's a deliberate, reviewed change to this file and `package.json` together.

## Runtime

| Tool | Pinned version | Notes |
|---|---|---|
| Node.js | **22.23.2 (Active LTS "Jod")** | Do not use Node 24 yet for this project — newer major, less ecosystem-wide validation against the Expo/Firebase tooling below at time of writing. Re-evaluate only if a dependency here requires it. Exact patch verified against `https://nodejs.org/dist/index.json` on 2026-08-21 for CI pinning (`.github/workflows/ci.yml`); re-check before bumping. |
| npm | bundled with Node 22 | Use `npm ci` for installs from an existing lockfile; `npm install` only when intentionally adding/changing a dependency. |

## Mobile app (React Native / Expo)

**SDK note:** the project was scaffolded on SDK 57 but moved to **SDK 54** on 2026-08-20 to match the Expo Go build (54.0.8) already installed on the team's physical test device — SDK 57 was too new for the Play Store's Expo Go release at the time. The rows below marked "unverified for SDK 54" still carry their original SDK-57-era pins and were **not installed in this pass**; re-check them against the npm registry (`npm view <pkg> versions`) at the time they're actually added, per the process below — don't carry the numbers forward blindly.

| Package | Pinned version | Notes |
|---|---|---|
| `expo` | **54.0.37** | SDK 54. Managed workflow. Not pinned to the Expo Go device build's exact 54.0.8 — Expo Go compatibility is SDK-major-scoped, not npm-patch-scoped, so `npx expo install --fix` resolving to the latest 54.x patch (54.0.37) is correct and gets 29 patches of fixes over 54.0.8 with no compatibility cost. |
| `react-native` | **0.81.5 (managed by Expo SDK 54)** | **Do not** install `react-native` independently — always use `npx expo install react-native` so the version stays the one SDK 54 was built and tested against. |
| `react` | **19.1.0** | What Expo SDK 54 (54.0.37) expects — confirmed via `npx expo install --check`, which reports "Dependencies are up to date" at this version. Install via `npx expo install react` when in doubt; re-verify per SDK bump, don't trust npm's "latest". |
| `react-dom` | **19.1.0** | Peer dependency of `react-native-web`; must stay in lockstep with the `react` version above. |
| `react-native-web` | **0.21.2** | The web target. |
| `@react-navigation/native` | **7.3.17** *(unverified for SDK 54)* | Plus the matching stack/tab navigator sub-packages at the same major. |
| `@react-navigation/native-stack` | **7.18.9** | Checked against npm registry 2026-08-20. |
| `@react-navigation/bottom-tabs` | **7.18.17** | Checked against npm registry 2026-08-20. |
| `@tanstack/react-query` | **5.101.4** *(unverified for SDK 54)* | Server state. |
| `zustand` | **5.0.15** *(unverified for SDK 54)* | Local/UI state. |
| `react-hook-form` | **7.85.0** *(unverified for SDK 54)* | Forms. |
| `zod` | **4.4.3** *(unverified for SDK 54)* | Shared client/server validation schemas — see `03-DATA-MODEL.md`. |
| `expo-router` | **unverified for SDK 54** | If using file-based routing; keep in lockstep with the `expo` version — install via `npx expo install expo-router` to get the SDK-54-compatible release. |
| `expo-notifications` | **unverified for SDK 54** | Push (FCM wiring) — install via `npx expo install`. |
| `expo-local-authentication` | **unverified for SDK 54** | Biometric app lock — install via `npx expo install`. |
| `expo-secure-store` | **unverified for SDK 54** | Secure on-device storage (tokens, sensitive local prefs) — install via `npx expo install`. |
| `expo-image` | **unverified for SDK 54** | Install via `npx expo install`. |
| `@react-native-async-storage/async-storage` | **3.1.1** *(unverified for SDK 54)* | |
| `i18next` | **26.4.0** | Localization — not Expo-SDK-coupled. |
| `react-i18next` | **17.0.12** | Not Expo-SDK-coupled. |
| `date-fns` | **4.4.0** | Date handling (eligibility countdowns, etc.) — not Expo-SDK-coupled. |

**All `expo-*` packages: always install via `npx expo install <package>`, never plain `npm install`** — the Expo CLI resolves the version compatible with your SDK automatically, which is what keeps this table meaningful instead of a guess.

## Firebase (client + backend)

| Package | Pinned version | Notes |
|---|---|---|
| `firebase` | **12.18.0** | Client SDK (Auth, Firestore, FCM, etc.). |
| `firebase-admin` | **14.3.0** | Cloud Functions runtime. |
| `firebase-functions` | **7.3.2** | 2nd-gen functions. |
| `firebase-tools` | **15.28.1** | CLI — install globally (`npm install -g firebase-tools@15.28.1`), used for emulators, deploy, and rules testing. |
| `@firebase/rules-unit-testing` | **5.0.2** | Firestore rules test suite (`06-TESTING.md`). |

## Notification channel integrations (Cloud Functions side)

Pick **one** SMS vendor and **one** email vendor per the Week 1 evaluation in the architecture plan — don't install more than one of each into the deployed functions package; the extras below are listed so whichever is chosen has a verified version ready, not so all of them get installed "just in case."

| Package | Pinned version | Notes |
|---|---|---|
| WhatsApp Business Cloud API | — (REST API, no SDK required) | Called via plain HTTPS from Cloud Functions; use `axios` below, no dedicated npm package needed. |
| `twilio` | **6.1.0** | Candidate SMS vendor — verify real Cameroon MTN/Orange deliverability before committing (see risk register). |
| `africastalking` | **0.8.3** | Candidate SMS vendor, Africa-focused — evaluate alongside Twilio in Week 1. |
| `@sendgrid/mail` | **8.1.6** | Candidate email vendor. |
| `resend` | **6.21.0** | Candidate email vendor. |
| `axios` | **1.19.0** | HTTP client for WhatsApp Cloud API calls and any vendor without a dedicated SDK. |

## Tooling (dev dependencies)

| Package | Pinned version | Notes |
|---|---|---|
| `typescript` | **verify before pinning — see note** | Registry shows a major-version jump (7.x) at time of writing; confirm compatibility with the Expo/Metro toolchain before adopting — if in doubt, pin the newest 5.x release your Expo SDK's own dependency tree resolves to instead, and revisit once ecosystem support catches up. |
| `eslint` | **10.8.1** | Confirm the Expo ESLint config (`eslint-config-expo`) supports this major before pinning; otherwise use whatever version that config's peer dependency requires. |
| `prettier` | **3.9.6** | |
| `jest` | **30.4.2** | |
| `jest-expo` | **57.0.4** | Must match the Expo SDK version (57). |
| `@testing-library/react-native` | **14.0.1** | |
| `husky` | **9.1.7** | Git hooks (pre-commit lint/typecheck). |
| `dotenv` | **17.4.2** | Local env loading where not handled by Expo's own `app.config.ts` mechanism. |

## CI/CD

| Tool | Pinned version | Notes |
|---|---|---|
| `eas-cli` | **22.2.0** | Install globally for local builds/testing; CI uses the same pinned version via the GitHub Actions Expo action. |

## Explicitly not installed at Day 1 (fast-follow only — don't add these without updating `02-ARCHITECTURE.md` first)

- Detox or any native E2E testing framework — evaluate only if schedule allows; not required for the Day-1 test plan in `06-TESTING.md`.
- Any WhatsApp bot/NLU framework (Dialogflow, Rasa, etc.) — the chatbot is fast-follow per the architecture doc.
- Apple HealthKit / Google Fit SDKs — fast-follow.
- Any analytics/crash-reporting SDK beyond what Firebase already provides — add deliberately if needed, not by default, to avoid an unreviewed third-party data path touching health-adjacent data.

## How to add a new dependency mid-project

1. Check the npm registry for the current version (`npm view <package> version`), not memory or a search result older than same-day.
2. Add it to the correct table above with the exact version, in the same PR that adds it to `package.json`.
3. Justify it in one line in the PR description — what it replaces or what gap it fills. If it duplicates something already in this file, that's a flag to reconsider, not a reason to add it anyway.
