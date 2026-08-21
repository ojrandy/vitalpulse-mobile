# Testing & QA

Testing runs continuously across the 30 days — it is not a Week 4 activity bolted onto the end. This doc is the checklist a PR is measured against, and the fuller plan behind the Gantt chart's "Testing & QA" swimlane.

## 1. What's required before any PR merges

- **Lint + typecheck** — zero errors (CI-enforced).
- **Unit tests** on any Cloud Function touched — every function in `03-DATA-MODEL.md`'s contract table needs coverage for its success path and its auth-rejection paths.
- **Firestore rules tests** — required for any PR touching `firestore.rules` or adding/changing a collection. No exceptions, given `04-SECURITY.md`'s "deny by default" mandate — an untested rule is an unverified rule.

## 2. Firestore rules test suite

Built with `@firebase/rules-unit-testing` against the local emulator. Coverage required for every collection in `03-DATA-MODEL.md`:

- Every role × every action (read/write/create/update/delete where applicable).
- **Hostile cases, not just happy paths:** cross-hospital reads/writes, self-role-elevation attempts, donor impersonation, a claims-less signed-in user (the actual state of every brand-new account) being denied everywhere except what's explicitly granted, double-accept races on request approval.
- Run locally with `firebase emulators:exec "npm run test:rules"` before pushing; CI re-runs it on every PR.

## 3. Integration tests (milestone-gated, see the Gantt chart)

| When   | Test                                                                        | Proves                                                                                                                           |
| ------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Day 13 | `submitRequest → reviewRequest(approve) → status transition`                | The moderation pipeline's state machine is correct end-to-end, before broadcast infra is layered on top.                         |
| Day 20 | Full broadcast to an internal test donor list across WhatsApp + SMS + email | The three channels actually deliver, not just that the API calls return 200. Check real message receipt, not just queued status. |

## 4. Security review (Week 4, hard gate)

1. Full Firestore rules test suite, zero failures, re-run against the complete final schema.
2. OWASP MASVS mobile self-assessment pass (see `04-SECURITY.md` §9).
3. Load test the broadcast fan-out at realistic donor-list volume — confirms delivery tracking and rate limits hold, not just that a single test message works.
4. Manual Cloud Function review against `04-SECURITY.md` §5's checklist (auth check, input validation, transactional correctness, audit logging).

## 5. Localization QA

Every user-facing string checked in both English and French before launch — a missing translation key is a launch blocker, not a fast-follow. Test on-device, not just in a string table review, since layout can break with longer French strings.

## 6. Bug bash

Both engineers, dedicated pass on donor-facing flows (Day 24–26 on the Gantt chart) before code freeze. Fresh-eyes testing catches what the person who wrote the code stops seeing.

## 7. Manual QA checklist for the donor-facing MVP

- [ ] Register with unknown blood type — confirm the account still functions and receives general notifications.
- [ ] Submit a directed patient request — confirm it lands in `pending_review` and is invisible to other donors until approved.
- [ ] Admin approves a request — confirm broadcast fires on all three channels to eligible donors and `notification_log` records per-channel status.
- [ ] Admin rejects a request — confirm the submitter is notified with the reason and nothing broadcasts.
- [ ] Donor changes notification preferences — confirm the next broadcast respects the change.
- [ ] Attempt cross-hospital data access as a `hospital_staff` account — confirm denial.
- [ ] Suspend an account — confirm it loses access on next token refresh (and note the known ~1h cached-token limitation from `04-SECURITY.md` §10).
- [ ] Biometric lock engages after backgrounding the app.
- [ ] Full flow in French.

## 8. Hypercare (Day 28–30)

Both engineers actively monitoring the first real production broadcasts — watching `notification_log` delivery rates, Cloud Function error rates, and Firestore rule denials in the console, ready to roll back per `07-DEPLOYMENT.md` if something is wrong.
