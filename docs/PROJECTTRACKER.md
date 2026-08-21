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
| 3   | Repo scaffold: Expo + RN Web (3 targets)             | Randy | 1–2  | Not Started |                                                                  |
| 4   | App Store / Play developer accounts verified         | Randy | 1–2  | Not Started |                                                                  |
| 5   | CI/CD: lint, typecheck, tests on every PR            | Randy | 2–3  | Not Started |                                                                  |
| 6   | SMS gateway evaluation & real deliverability test    | Randy | 2–5  | Not Started | Vendor decision blocks Week 3 — see `DEPENDENCIES.md` candidates |
| 7   | Design system / component library                    | Mai   | 2–5  | Not Started |                                                                  |
| 8   | Role-routed navigation shells (Donor/Hospital/Admin) | Mai   | 3–5  | Not Started |                                                                  |
| 9   | Localization scaffolding (EN/FR)                     | Mai   | 4–5  | Not Started |                                                                  |

### Security & Compliance (Week 1 portion)

| ID  | Task                                              | Owner | Days | Status      | Notes |
| --- | ------------------------------------------------- | ----- | ---- | ----------- | ----- |
| 10  | Auth: phone OTP + custom claims scaffold          | Randy | 2–5  | Not Started |       |
| 11  | Firestore schema v1 + deny-by-default rules draft | Randy | 3–6  | Not Started |       |
| 12  | Firestore rules test suite (skeleton)             | Randy | 5–7  | Not Started |       |

**Milestone — Day 7: Architecture & Foundation Complete** — `Not Started`

---

## Week 2 — Donor Core + Request Pipeline (Days 8–14)

### Donor Core Experience

| ID  | Task                                             | Owner | Days  | Status      | Notes |
| --- | ------------------------------------------------ | ----- | ----- | ----------- | ----- |
| 15  | Donor profile UI (incl. unknown blood type flow) | Mai   | 8–10  | Not Started |       |
| 16  | Request submission forms (directed / shortage)   | Mai   | 9–12  | Not Started |       |
| 17  | Notification preference center UI                | Mai   | 10–11 | Not Started |       |
| 18  | Badges, points & tier UI                         | Mai   | 11–13 | Not Started |       |

### Request & Moderation Pipeline

| ID  | Task                                                  | Owner | Days  | Status      | Notes |
| --- | ----------------------------------------------------- | ----- | ----- | ----------- | ----- |
| 19  | submitRequest Cloud Function (all sources)            | Randy | 8–10  | Not Started |       |
| 20  | reviewRequest function + admin queue backend          | Randy | 9–11  | Not Started |       |
| 21  | Firestore rules for requests/notification_log + tests | Randy | 10–12 | Not Started |       |
| 22  | Push-on-new-request (FCM wiring)                      | Randy | 11–12 | Not Started |       |
| 23  | Integration test: submit → review → approve           | Joint | 13    | Not Started |       |

**Milestone — Day 14: Request Pipeline Functional End-to-End** — `Not Started`

---

## Week 3 — Broadcast Infra + Hospital/Admin Ops (Days 15–21)

### Broadcast & Notification Infra

| ID  | Task                                     | Owner | Days  | Status      | Notes |
| --- | ---------------------------------------- | ----- | ----- | ----------- | ----- |
| 24  | WhatsApp Business Cloud API integration  | Randy | 15–17 | Not Started |       |
| 25  | SMS gateway integration (final vendor)   | Randy | 16–18 | Not Started |       |
| 26  | Email provider integration               | Randy | 17–18 | Not Started |       |
| 27  | broadcastRequest fan-out orchestrator    | Randy | 17–19 | Not Started |       |
| 28  | Delivery tracking + rate/cost guardrails | Randy | 18–20 | Not Started |       |

### Hospital & Admin Ops

| ID  | Task                                               | Owner | Days  | Status      | Notes |
| --- | -------------------------------------------------- | ----- | ----- | ----------- | ----- |
| 29  | Hospital inventory screens (batch/lab-test status) | Mai   | 15–18 | Not Started |       |
| 30  | Admin verification + activity log screens          | Mai   | 17–20 | Not Started |       |

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
| Week 1 (1–14)        | 12    | 0    | 0           | 0       |
| Week 2 (15–23)       | 9     | 0    | 0           | 0       |
| Week 3 (24–36)       | 7     | 0    | 0           | 0       |
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

_(none yet — first entry goes here once Day 1 kickoff happens)_
