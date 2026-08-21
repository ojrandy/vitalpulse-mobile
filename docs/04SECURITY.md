# Security Baseline

This is human health data. Everything in this document is a **hard gate for Day-1 launch** — none of it is fast-follow, none of it gets cut for time. If a deadline pressure ever makes cutting one of these feel tempting, cut a feature from `02-ARCHITECTURE.md` §7 instead.

## 1. Principles (carried forward from the current app's security work)

- **Zero trust on the client.** The frontend is treated as fully compromised. Nothing the app sends is trusted; every decision is re-made on the server.
- **Least privilege.** Every role gets the minimum permission set required for its job.
- **Defense in depth.** Firebase Auth (identity) → Custom Claims (role/attributes) → Firestore Security Rules + Cloud Functions (authorization + business logic).
- **Deny by default.** Root Firestore rule is `allow read, write: if false;` — every permission is an explicit, tested exception.

## 2. Roles

| Role             | Assigned by                                        | Core permissions                                                                             |
| ---------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `donor`          | Self sign-up (default)                             | Own profile; submit requests; read own request/notification history                          |
| `hospital_staff` | `hospital_admin` of that hospital                  | Create requests for own hospital; manage stock (not lab clearance)                           |
| `lab_tech`       | `hospital_admin` of that hospital                  | Resolve lab tests (cleared/rejected); **cannot** create requests or edit stock directly      |
| `hospital_admin` | `system_admin`                                     | Manage own hospital's staff, inventory config; **cannot** self-verify own hospital           |
| `system_admin`   | Existing system admin only (server-side bootstrap) | Hospital verification, request review/approval, broadcast trigger, role grants, abuse review |

**Separation of duties, enforced in rules and in Cloud Functions, not just UI:**

- `lab_tech` cannot create requests or write stock/issuance directly.
- `hospital_admin` cannot flip their own hospital's `isVerified` — only `system_admin` can.
- No role can write `auditLogs` directly — only the `writeAudit` helper, called from privileged Cloud Functions.
- Only `system_admin` can approve a request or trigger a broadcast — no auto-publish path exists for any source, including hospitals.

## 3. Custom claims

Subject attributes carried in the Firebase Auth custom claims token: `role`, `hospitalId`, `suspended`. Firestore rules read **only** from `request.auth.token` — never from a client-writable Firestore field. The `users.role` field in Firestore is cosmetic/routing only; it is never read for authorization.

## 4. Firestore rules

- Root: `allow read, write: if false;` for every collection not explicitly listed.
- Every collection × every role × every action has a corresponding rules-test-suite case, including hostile cases: cross-hospital reads/writes, self-role-elevation, donor impersonation, a claims-less signed-in user (attempted access with no provisioned role), double-accept races.
- Direct field access on custom claims (e.g. `request.auth.token.suspended`) must use `.get(key, default)` — a missing key throws a hard evaluation error otherwise, and a freshly-provisioned account with no claims yet is a real, common state.
- `hasRole()` gate required on every collection — `signedIn()` alone is not sufficient, since a claims-less signed-in account is the default state of a brand-new user.

## 5. Privileged operations — server-side only

Every mutation that touches role, verification status, suspension, request approval, broadcast triggering, or inventory goes through a callable Cloud Function — **never** a direct client Firestore write. See `03-DATA-MODEL.md` for the full function list. Each function:

1. Re-checks `context.auth` and custom claims before doing anything.
2. Validates input against a Zod schema (shared with the client form validation — see `03-DATA-MODEL.md`).
3. Performs the mutation transactionally where correctness depends on it (inventory counts, role grants).
4. Calls `writeAudit()` with actor, action, target, and timestamp.
5. On role change/suspension, calls `revokeRefreshTokens` so the change takes effect promptly.

## 6. Blood type trust levels

`bloodTypeSource` (`self_reported` / `lab_confirmed` / `unknown`) is a first-class field, not a UI nicety. Urgent, compatibility-based auto-matching must treat `self_reported` with visible caution — surfaced to the reviewing admin, never silently equal-weighted with `lab_confirmed`. `unknown` donors still receive general/campaign notifications; they are never silently dropped from the system.

## 7. PHI minimization

`requests.patientContext` (admin-only) and `broadcasts` (public-facing) are **separate documents with separate schemas** — the broadcast payload is built explicitly field-by-field in `broadcastRequest`, never by copying or lightly redacting the request doc. This makes over-sharing a code-review-visible change, not a silent leak.

## 8. Identity & device security

- MFA required for `hospital_admin` and `system_admin` at minimum.
- Biometric app lock (Face ID / fingerprint / device PIN fallback) — Day 1, not fast-follow.
- Rate limiting on request submission and on broadcast triggering — prevents abuse and runaway SMS/WhatsApp cost (see the risk register in the Gantt workbook).
- Secrets (WhatsApp/SMS/email API keys) live only in Cloud Functions environment config — never in the client bundle, never committed to the repo. See `05-DEV-WORKFLOW.md` for `.env` handling.

## 9. Security review gate (Week 4, non-negotiable)

Before any store submission:

1. Full Firestore rules test suite run, zero failures.
2. OWASP MASVS mobile self-assessment pass.
3. Load test on the broadcast fan-out (confirms rate limits and delivery tracking hold at real volume).
4. Manual review of every Cloud Function against the checklist in §5.

## 10. Incident response (minimum viable, Day 1)

- Every privileged action is in `auditLogs` — this is the first place to look during an incident.
- `revokeRole` / suspend flips `suspended` and calls `revokeRefreshTokens` immediately.
- **Known limitation, documented not hidden:** `revokeRefreshTokens` only blocks future token refreshes — an already-cached ID token remains valid until its ~1h natural expiry. Mitigation options (route suspend-sensitive actions through Cloud Functions with `checkRevoked=true`, or cross-check a live `isSuspended` field in rules at extra read cost) are a deliberate, documented trade-off — pick one before launch if this risk is unacceptable for a given action.
