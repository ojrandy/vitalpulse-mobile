# VitalPulse Mobile — Post-Launch Roadmap

Everything here is **explicitly out of scope for the Day-1, 30-day launch** (see `02-ARCHITECTURE.md` §7). It's written down so "fast-follow" means "on this list, sequenced, with a reason" — not "forgotten." Nothing on this roadmap starts until VitalPulse Mobile is live, stable, and past hypercare (`07-DEPLOYMENT.md` §7–8).

Don't pull an item forward into the 30-day build without removing something else from Day-1 scope to make room — that trade-off should be a deliberate, recorded decision (log it in `PROJECT-TRACKER.md`'s Daily Log), not scope creep.

## Sequencing logic

Ordered by a mix of: how much it depends on Day-1 infrastructure already existing, how much value it adds relative to effort, and risk (a feature that touches trust/safety gets scrutiny before one that's pure convenience).

---

## Phase 2 — first fast-follow (target: shortly after launch, once hypercare confirms stability)

### WhatsApp chatbot (inbound request intake)

The single most-requested "future" feature from planning. **Low marginal cost by design** — the Day-1 build already stands up the WhatsApp Business Cloud API integration for outbound broadcasts and gives every request a `requestType` field including `whatsapp_bot` reserved and unused. This phase adds: an inbound webhook receiver, basic intent parsing (start simple — structured prompts/quick-replies rather than open-ended NLU, given team size), and wiring bot-submitted requests into the existing `submitRequest` → moderation queue path. No changes needed to the review/broadcast pipeline itself.

### Full gamification

Day-1 ships basic points/tier/badges. Phase 2 adds leaderboards (city and national), shareable "lives saved" milestone cards for social media, and referral rewards. Depends on real donation-completion data existing in production first — building leaderboards against zero real donations isn't useful.

### Manual "pause all broadcasts" admin kill switch

If this wasn't pulled into Day-1 scope already (see `07-DEPLOYMENT.md` §6), it should be the very first thing built post-launch if not before — it's cheap, high-value operational insurance for a system sending real messages to real people.

---

## Phase 3 — platform depth

### Full offline-first sync

Day-1 ships basic caching for donor screens. This phase adds real conflict-resolving sync — queued actions taken offline (e.g. a donor updating availability with no signal) correctly reconcile once connectivity returns. Meaningfully harder than Day-1's caching; worth doing once the core app's data model has proven stable in production, so sync logic isn't chasing a moving schema.

### Inter-hospital transfer requests

When one hospital is short and a nearby one has surplus. Builds on the existing `inventory` collection and hospital-role infrastructure — mostly a new request type plus hospital-to-hospital messaging, not new architecture.

### National / `nbtp_viewer` aggregated dashboards

Aggregated, anonymized national blood-supply view for a potential National Blood Transfusion Program partnership. The claims model already reserves this role. Sequenced late because it's an external-partnership feature, not a pure product one — timeline depends on that relationship, not just engineering capacity.

---

## Phase 4 — native platform depth & reach

### Apple Health / Google Fit integration

Donor eligibility tracking alongside existing fitness data. Nice-to-have, not core to the emergency-response mission — sequenced after the features that directly affect donor reach or hospital operations.

### Home-screen widgets

Next-eligible-donation-date or nearby urgent requests, glanceable without opening the app. Platform-specific work (WidgetKit / Android App Widgets) — real effort for a convenience feature, so it waits until the core app is mature.

### USSD fallback channel

For donors without reliable smartphone data access — a real accessibility/reach feature for the Cameroon context, but a genuinely separate integration (telecom USSD gateway, not a mobile API) requiring its own vendor evaluation similar to the Day-1 SMS gateway work. Worth prioritizing earlier than its Phase-4 slot _if_ real-world usage data post-launch shows a meaningful population of donors the app isn't reaching — flag this as a candidate for re-sequencing based on actual launch data, not a guess made now.

---

## Explicitly not scheduled (revisit only if a real need emerges)

- Full six-role model UI differentiation beyond what Day-1 needs (the current plan uses `donor`/`hospital_staff`/`hospital_admin`/`system_admin`; `lab_tech` and `nbtp_viewer` exist in the claims model but don't need dedicated UI until there's a concrete workflow driving it).
- Any social/community features beyond the referral and leaderboard items above (donor forums, comments, etc.) — no evidence yet that this serves the core mission.

## How to move something off this roadmap and into active scope

1. Add it as a task in `PROJECT-TRACKER.md` under whichever week it realistically fits.
2. Update `02-ARCHITECTURE.md` §7's Day-1/fast-follow split so the docs stay consistent with reality.
3. If it touches Firestore or a Cloud Function, extend `03-DATA-MODEL.md` first — don't build UI or logic against an undocumented contract (see `CLAUDE.md`).
4. Log the decision and the reason in `PROJECT-TRACKER.md`'s Daily Log.
