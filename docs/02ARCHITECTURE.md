# Architecture

## 1. Guiding principles

1. **Deny by default, everywhere.** No permission is implicit; every read/write is an explicit, tested rule or server-side check.
2. **One pipeline, one truth.** Every blood request — hospital-created, donor-directed (on behalf of a patient), donor-reported shortage, and (later) WhatsApp-bot-submitted — flows through a single moderation queue. Nothing reaches the public without an admin's explicit approval.
3. **Guaranteed reach.** A broadcast must actually attempt delivery on every channel a donor has opted into (WhatsApp, SMS, email, push), with tracked status per channel — not a fire-and-hope client-side link.
4. **PHI minimization.** Admins see full patient/request context to judge legitimacy; the public broadcast only ever contains what a donor needs to act (blood type, city/hospital, urgency, units).
5. **Cut scope on purpose, not by accident.** See §7.

## 2. Tech stack

| Layer          | Choice                                                                                                                                         | Why                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| App framework  | React Native + Expo (managed, EAS) + `react-native-web` for the web target                                                                     | One codebase for iOS/Android/Web; EAS Build/Submit is the fastest realistic path to store artifacts for a 2-person, 30-day team. |
| Navigation     | React Navigation, role-based root navigator (donor / hospital / admin stacks)                                                                  | Standard, deep-link friendly.                                                                                                    |
| Server state   | TanStack Query                                                                                                                                 | Firestore listeners + async calls without Redux overhead.                                                                        |
| Local/UI state | Zustand                                                                                                                                        | Lightweight, no boilerplate.                                                                                                     |
| Forms          | React Hook Form + Zod resolver                                                                                                                 | Shared validation schema between client forms and Cloud Function input validation.                                               |
| Backend        | Firebase: Firestore, Auth, Cloud Functions (2nd gen), Cloud Messaging                                                                          | Team's existing security-rules/custom-claims experience carries over; serverless fits the 30-day window.                         |
| Auth           | Firebase Auth, **phone number as primary identity** (OTP), email optional/secondary                                                            | Phone is the anchor since WhatsApp/SMS are the core notification channels.                                                       |
| Push           | Firebase Cloud Messaging                                                                                                                       | One push layer for iOS + Android; web push where supported.                                                                      |
| WhatsApp       | WhatsApp Business Platform — Cloud API (direct from Meta)                                                                                      | Same integration point the future inbound chatbot will reuse.                                                                    |
| SMS            | Vendor TBD in Week 1 — evaluate against real Cameroon MTN/Orange deliverability before committing (see `04-SECURITY.md` and the risk register) | Twilio's Central African route reliability is not guaranteed; this needs a real test.                                            |
| Email          | SendGrid or Resend (pick one in Week 1)                                                                                                        | Third guaranteed-reach channel.                                                                                                  |
| Localization   | i18next + react-i18next                                                                                                                        | English/French from day one (Cameroon is bilingual).                                                                             |
| CI/CD          | EAS Build + GitHub Actions                                                                                                                     | Lint, typecheck, Firestore rules tests, unit tests on every PR — nothing merges without the rules suite passing.                 |

Exact pinned versions for all of the above: `DEPENDENCIES.md`.

## 3. High-level architecture

```
                       ┌─────────────────────────────┐
                       │   VitalPulse Mobile (RN)     │
                       │  iOS · Android · Web (RNW)   │
                       │  role-routed after login:    │
                       │   Donor · Hospital · Admin   │
                       └───────────────┬─────────────┘
                                        │ Firebase SDK (Auth, Firestore listeners)
                                        │ HTTPS callable functions (all writes)
                       ┌────────────────▼────────────────┐
                       │        Cloud Functions           │
                       │  - grantRole / revokeRole        │
                       │  - submitRequest (any source)    │
                       │  - reviewRequest (approve/reject)│
                       │  - broadcastRequest              │
                       │     → fan-out orchestrator        │
                       │  - inventory ops (add/deduct/etc)│
                       │  - writeAudit (every priv. write)│
                       └───┬───────────┬───────────┬──────┘
                           │           │           │
                 ┌─────────▼──┐  ┌─────▼─────┐ ┌───▼────────┐
                 │  Firestore │  │   FCM      │ │ WhatsApp / │
                 │  (rules =  │  │  (push)    │ │ SMS / Email│
                 │  deny-by-  │  │            │ │  gateways  │
                 │  default)  │  │            │ │            │
                 └────────────┘  └────────────┘ └────────────┘
```

Nothing writes to Firestore's sensitive collections directly from the client. Role grants, request approval, broadcast triggering, and inventory mutation all go through callable Cloud Functions that re-check auth + claims server-side.

## 4. Unified request → broadcast flow

```
Donor/Hospital submits request
        │
        ▼
requests/{id}  status: pending_review
        │  (push notification to all admins, instantly)
        ▼
Admin reviews (in-app, mobile or desktop-class screen)
   ├── Reject → status: rejected, donor/hospital notified
   └── Approve → status: approved
                    │
                    ▼
           broadcastRequest() Cloud Function
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
   WhatsApp API   SMS gateway   Email provider     (+ FCM push, always)
        │           │            │
        └─────→ notification_log (per donor, per channel, tracked) ←─────┘
                    │
                    ▼
           status: broadcast → later fulfilled/expired
```

Full field-level schema for every collection and function in this diagram: `03-DATA-MODEL.md`.

## 5. Platform split: RN Web vs. dense hospital/admin screens

RN Web is strong for donor-facing screens (feeds, forms, cards, profile). Hospital admin work (verification queues, inventory grids, safety oversight) is dense-data-table, keyboard-and-mouse territory that RN Web can fight you on. **Watch item, not a decided blocker:** reassess by Day 18 (see Gantt). If RN Web is slowing hospital/admin screens down, the fallback is a thin React-DOM layer sharing the same backend and business-logic package — not a second app, just a second render target for the screens that need it.

## 6. Cross-platform technical foundation

- Firebase Cloud Messaging as the single push layer for iOS + Android (and web push where RN Web supports it).
- Deep linking so a WhatsApp/SMS/email notification opens the exact request in-app.
- Offline-first caching for donor-side screens (basic caching Day 1; full conflict-resolving sync is fast-follow).
- English/French localization wired from the start, not bolted on.
- Biometric app lock (Face ID / fingerprint / device PIN fallback) — this is health data on a personal device.

## 7. Scope cut: Day-1 launch vs. fast-follow

**Day-1 (must ship):** phone-OTP auth + role routing; donor profile incl. unknown/self-reported/lab-confirmed blood type; unified request submission (all sources) and admin review queue; real server-side broadcast to WhatsApp + SMS + email + push with per-channel delivery tracking; hospital inventory (batch/lab-test lifecycle) and verification; the full security baseline in `04-SECURITY.md` (never cut); biometric lock; French/English localization; basic gamification (points/tier/badges).

**Fast-follow (explicitly deferred, not forgotten):** WhatsApp chatbot inbound intake; full leaderboard/social-share gamification; Apple Health/Google Fit integration; home-screen widgets; national/`nbtp_viewer` aggregated dashboards; full offline-first sync; inter-hospital transfer requests; USSD fallback channel.

If a feature isn't in the Day-1 list, it doesn't get built during these 30 days — see `01-README.md`.
