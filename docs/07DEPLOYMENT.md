# Deployment & Launch

## 1. Environments

| Environment  | Firebase project          | Purpose                                                                |
| ------------ | ------------------------- | ---------------------------------------------------------------------- |
| `dev`        | separate Firebase project | Day-to-day development, emulator-first where possible                  |
| `staging`    | separate Firebase project | Pre-launch integration/load testing, internal broadcast tests (Day 20) |
| `production` | separate Firebase project | Real launch, real donors — never used for testing                      |

Never point a dev build at the production Firebase project. Keep the three sets of config/credentials clearly separated in `.env.example` and in EAS build profiles.

## 2. Build & release process (EAS)

1. `eas build --profile <dev|staging|production> --platform all` — builds iOS + Android from the one codebase.
2. `eas submit` — pushes the build to TestFlight (iOS) / Play internal testing track (Android).
3. Web target deploys separately via `expo export:web` + your chosen static host (Firebase Hosting is the natural default given the rest of the stack).

## 3. Store submission timeline (risk-managed, see the Gantt chart)

- **Day 19–21:** TestFlight / Play internal testing submission prepped and running. Apple's review time is unpredictable — this buffer exists specifically to absorb that, so don't compress it under schedule pressure.
- **Day 26:** Formal App Store submission.
- **Day 27:** Formal Play Store submission (typically faster review than Apple's).
- **Day 28–30:** Hypercare — both engineers monitoring the first real production broadcasts.

Confirm both developer accounts (Apple Developer Program, Google Play Console) are active and verified in **Week 1**, not discovered as a blocker in Week 4.

## 4. Pre-launch checklist (all required, not aspirational)

- [ ] Security review gate passed (`04-SECURITY.md` §9, `06-TESTING.md` §4).
- [ ] Firestore rules test suite: zero failures against final schema.
- [ ] Load test on broadcast fan-out completed at realistic volume.
- [ ] Production Firebase project's secrets set via Cloud Functions config, verified not present in any client bundle.
- [ ] SMS/WhatsApp/email sender identities verified and approved by their respective providers (WhatsApp Business template messages in particular require Meta approval — start this well before Day 26, template review can take days).
- [ ] Store listing assets (screenshots, descriptions, privacy disclosures) finalized for both platforms.
- [ ] Rollback plan (below) reviewed by both engineers.
- [ ] Staged rollout plan agreed (see §5).

## 5. Staged rollout

Prefer a staged rollout over a 100% instant release where the store allows it (Play supports staged rollout percentages natively; iOS phased release is available under App Store Connect). Start conservative — a broadcast bug at 100% rollout means a real hospital's urgent request reaching donors incorrectly, which is a patient-safety issue, not just a bug.

## 6. Rollback plan

- **App-level:** halt the staged rollout / pull the build from the store if a client-side issue is found; the previous version remains installed for existing users until they update, so a client bug is not instantly catastrophic.
- **Backend-level (the more urgent case):** Cloud Functions can be redeployed to a previous version immediately (`firebase deploy --only functions:<name>` from the last-known-good commit) without an app store review cycle — this is why privileged logic living server-side (per `04-SECURITY.md`) matters operationally, not just for security.
- **Broadcast-specific:** if `broadcastRequest` misbehaves in production, the rate-limit guardrail (`04-SECURITY.md` §8) is the first line of defense; a manual "pause all broadcasts" admin toggle should exist as a kill switch before launch — add this to Day-1 scope if it isn't already covered, since it's cheap insurance for a system that sends real messages to real people.

## 7. Post-launch monitoring

- `notification_log` delivery rates per channel — a sudden drop on any one channel (especially SMS, given deliverability was a Week 1 open question) needs same-day investigation.
- Cloud Functions error rate and cold-start latency in the Firebase console.
- Firestore rule denial rate — a spike can mean either an attack attempt or a legitimate feature the rules didn't anticipate; triage before assuming either.
- `auditLogs` for anything unexpected in role grants or account suspensions.

## 8. Retiring the legacy web app

Once VitalPulse Mobile is live and stable (post-hypercare, not on launch day itself), plan the `vitalpulse_app` Firebase web app's retirement: confirm no active hospital/admin sessions still depend on it, export/archive anything not migrated, and only then decommission. Don't schedule this inside the 30-day window — it's explicitly a post-launch step.
