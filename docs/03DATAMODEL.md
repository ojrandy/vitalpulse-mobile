# Data Model & Function Contracts

This is the contract between Randy's backend work and Mai's UI work — if a field isn't here, don't invent it client-side; add it here first, then build against it. Every collection below is deny-by-default in Firestore rules (`04-SECURITY.md`); the only client-writable fields are the ones explicitly marked **client-writable** — everything else is Cloud-Functions-only.

## Firestore collections

### `users/{uid}`

| Field                        | Type                                                                | Notes                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `role`                       | `'donor' \| 'hospital_staff' \| 'hospital_admin' \| 'system_admin'` | Authority is the **custom claim**, not this field — this field is cosmetic/routing only.               |
| `hospitalId`                 | `string?`                                                           | Required for hospital roles; equals that hospital account's own `uid`.                                 |
| `phone`                      | `string`                                                            | E.164 format. Primary identity.                                                                        |
| `email`                      | `string?`                                                           | Optional secondary channel.                                                                            |
| `bloodType`                  | `'A+'\|'A-'\|'B+'\|'B-'\|'AB+'\|'AB-'\|'O+'\|'O-'\|'unknown'`       |                                                                                                        |
| `bloodTypeSource`            | `'self_reported' \| 'lab_confirmed' \| 'unknown'`                   | **Never trust `self_reported` the same as `lab_confirmed` in urgent matching** — see `04-SECURITY.md`. |
| `city`                       | `string`                                                            |                                                                                                        |
| `geo`                        | `GeoPoint?`                                                         | Optional precise location, for future proximity matching.                                              |
| `notificationPrefs`          | `{ whatsapp: bool, sms: bool, email: bool, push: bool }`            | Client-writable by the owning donor only.                                                              |
| `isVerified`                 | `bool`                                                              | Hospitals only. Cloud-Functions-only write (`system_admin` sets via a dedicated function).             |
| `isSuspended`                | `bool`                                                              | Cloud-Functions-only write.                                                                            |
| `points`, `tier`, `badges[]` | number / string / array                                             | Engagement/gamification, Cloud-Functions-only write (server computes on donation completion).          |
| `createdAt`, `updatedAt`     | timestamp                                                           |                                                                                                        |

**Client-writable by the owning user:** `notificationPrefs`, `city`, `geo`, profile display fields (name, photo), and — added 2026-09-16 when the backend phase started — `bloodType`/`bloodTypeSource` **as a direct write, but only when the new `bloodTypeSource` is `self_reported` or `unknown`, never `lab_confirmed`.** This was an implicit gap in the original contract: `profileSetupSchema` already excluded `lab_confirmed` client-side, but nothing here said whether the profile-setup write itself was direct-to-Firestore or Cloud-Functions-only. Resolved as a direct write, enforced identically in `firestore.rules` (`users/{userId}` create/update rules re-check `bloodTypeSource != 'lab_confirmed'` server-side, not just client-side) — simpler than adding a dedicated Cloud Function for a field a donor is meant to self-report, while keeping the actual trust boundary (`lab_confirmed` is exclusively `resolveLabTest`'s to set) enforced in rules, not just in a form. Everything else listed above is Cloud-Functions-only.

### `requests/{id}`

| Field             | Type                                                                                           | Notes                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `requestType`     | `'hospital_direct' \| 'donor_directed_patient' \| 'donor_reported_shortage' \| 'whatsapp_bot'` | `whatsapp_bot` reserved for fast-follow; the field exists now so the pipeline doesn't change shape later. |
| `status`          | `'pending_review' \| 'approved' \| 'rejected' \| 'broadcast' \| 'fulfilled' \| 'expired'`      | State machine — see §3 below.                                                                             |
| `bloodType`       | same enum as above                                                                             |                                                                                                           |
| `unitsNeeded`     | number                                                                                         |                                                                                                           |
| `urgency`         | `'routine' \| 'urgent' \| 'critical'`                                                          |                                                                                                           |
| `hospitalId`      | `string`                                                                                       |                                                                                                           |
| `city`            | `string`                                                                                       |                                                                                                           |
| `patientContext`  | `object` (admin-only visible)                                                                  | Full context for legitimacy review — never copied into `broadcasts`.                                      |
| `submittedBy`     | `uid`                                                                                          |                                                                                                           |
| `reviewedBy`      | `uid?`                                                                                         |                                                                                                           |
| `reviewedAt`      | `timestamp?`                                                                                   |                                                                                                           |
| `broadcastAt`     | `timestamp?`                                                                                   |                                                                                                           |
| `rejectionReason` | `string?`                                                                                      | Shown back to the submitter.                                                                              |
| `createdAt`       | `timestamp`                                                                                    |                                                                                                           |

Writable only via `submitRequest` (create) and `reviewRequest` (status transitions) Cloud Functions — never a direct client write.

### `broadcasts/{id}`

The PHI-minimized payload actually sent to the public. One doc per broadcast event.

| Field                                                         | Type        | Notes                                                                       |
| ------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `requestId`                                                   | `string`    | FK to `requests`.                                                           |
| `bloodType`, `city`, `hospitalName`, `urgency`, `unitsNeeded` | —           | **Only** what a donor needs to act. No patient name, no ward, no diagnosis. |
| `broadcastBy`                                                 | `uid`       | The approving admin.                                                        |
| `createdAt`                                                   | `timestamp` |                                                                             |

Cloud-Functions-only write (`broadcastRequest`).

### `notification_log/{id}`

Per-donor, per-channel delivery record.

| Field                   | Type                                            | Notes |
| ----------------------- | ----------------------------------------------- | ----- |
| `broadcastId`           | `string`                                        |       |
| `donorId`               | `uid`                                           |       |
| `channel`               | `'whatsapp' \| 'sms' \| 'email' \| 'push'`      |       |
| `status`                | `'queued' \| 'sent' \| 'delivered' \| 'failed'` |       |
| `attempts`              | number                                          |       |
| `lastError`             | `string?`                                       |       |
| `sentAt`, `deliveredAt` | `timestamp?`                                    |       |

Cloud-Functions-only write.

### `inventory/{hospitalId}_{bloodType}`

| Field        | Type                                                                                   | Notes                                                                 |
| ------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `hospitalId` | `string`                                                                               |                                                                       |
| `bloodType`  | —                                                                                      |                                                                       |
| `batches`    | `array<{ id, units, testStatus: 'waiting_test'\|'cleared'\|'rejected', collectedAt }>` | Batch-level lab lifecycle, carried over from the current app's model. |
| `threshold`  | number                                                                                 | Low-stock alert trigger.                                              |
| `updatedAt`  | timestamp                                                                              |                                                                       |

Writes via `addInventoryStock` / `deductInventoryStock` / `resolveLabTest` / `setInventoryThreshold` Cloud Functions only. `resolveLabTest` requires `lab_tech`/`hospital_admin`/`system_admin`; stock add/deduct excludes `lab_tech` (separation of duties — see `04-SECURITY.md`).

### `auditLogs/{id}`

| Field       | Type      | Notes                                                                       |
| ----------- | --------- | --------------------------------------------------------------------------- |
| `action`    | string    | e.g. `role_granted`, `request_approved`, `broadcast_sent`, `user_suspended` |
| `actorUid`  | `uid`     |                                                                             |
| `targetId`  | `string`  | Doc ID affected.                                                            |
| `timestamp` | timestamp |                                                                             |
| `metadata`  | object    | Action-specific detail.                                                     |

Written only by the `writeAudit` helper, called from every privileged Cloud Function. No role can write this collection directly — see `04-SECURITY.md`.

## Callable Cloud Functions (contracts)

| Function                                     | Input                                                                                  | Output                                | Who can call                                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `submitRequest`                              | `{ requestType, bloodType, unitsNeeded, urgency, hospitalId?, city, patientContext? }` | `{ requestId }`                       | Any authenticated donor or hospital account                                                 |
| `reviewRequest`                              | `{ requestId, decision: 'approve'\|'reject', rejectionReason? }`                       | `{ status }`                          | `system_admin` only                                                                         |
| `broadcastRequest`                           | `{ requestId }`                                                                        | `{ broadcastId, targetedDonorCount }` | Triggered automatically on `reviewRequest` approve — not separately callable by clients     |
| `addInventoryStock` / `deductInventoryStock` | `{ hospitalId, bloodType, units, batchId? }`                                           | `{ newTotal }`                        | `hospital_staff`, `hospital_admin`, `system_admin`                                          |
| `resolveLabTest`                             | `{ hospitalId, bloodType, batchId, result: 'cleared'\|'rejected' }`                    | `{ status }`                          | `lab_tech`, `hospital_admin`, `system_admin`                                                |
| `grantRole` / `revokeRole`                   | `{ targetUid, role, hospitalId? }`                                                     | `{ status }`                          | `system_admin` (hospital_admin scoped to their own hospital + hospital_staff/lab_tech only) |

All inputs are Zod-validated server-side before anything touches Firestore, importing the same schema client forms use from `packages/shared-schemas` (`@vitalpulse/shared-schemas`) — see `functions/src/*.ts` and `src/schemas/*.ts` (thin re-exports of the shared package, kept at their original paths so existing client imports didn't need to change).

**Known contract gap, flagged not silently built (2026-09-16):** `users.isSuspended` is documented above as Cloud-Functions-only, and `docs/04SECURITY.md` §10 assumes a suspend/unsuspend action exists, but no `suspendUser`/`unsuspendUser` function is in this table. `grantRole`/`revokeRole` (implemented in `functions/src/roles.ts`) do not touch `isSuspended`. Needs a decision — likely a small dedicated `system_admin`-only function — before Week 4's "Suspend an account" manual QA case (`06-TESTING.md` §7) can actually be exercised.

## Request state machine (§3)

```
pending_review ──approve──► approved ──(auto)──► broadcast ──► fulfilled
       │                                                    └─► expired
     reject
       │
       ▼
   rejected
```

Only `reviewRequest` moves a request out of `pending_review`. Only an approve decision triggers `broadcastRequest`. No status is ever set by a direct client write.
