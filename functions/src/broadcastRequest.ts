import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

import { adminApp } from './lib/admin';
import { writeAudit } from './lib/audit';

/**
 * `broadcastRequest` — docs/03DATAMODEL.md contract: "Triggered
 * automatically on reviewRequest approve — not separately callable by
 * clients." Implemented as a Firestore trigger on the exact
 * `pending_review -> ... -> approved` transition `reviewRequest` makes, so
 * there is structurally no other path to a broadcast (CLAUDE.md
 * non-negotiable #3).
 *
 * PHI minimization (CLAUDE.md non-negotiable #4, docs/04SECURITY.md §7):
 * the `broadcasts` doc below is built field-by-field from the allow-list —
 * `patientContext` and any other `requests` field not explicitly listed
 * here must never be added by spreading the request doc.
 *
 * Notification dispatch (WhatsApp/SMS/email) is Week 3 scope
 * (docs/PROJECTTRACKER.md tasks 24-28, not started — no vendor is chosen
 * yet and no secrets are configured, docs/04SECURITY.md §8). This function
 * creates the `broadcasts` doc and queues one `notification_log` row per
 * eligible donor per enabled channel with `status: 'queued'`; actually
 * sending those queued notifications is intentionally left to the
 * dispatcher that lands with the chosen vendor, not invented here.
 */
export const broadcastRequest = onDocumentUpdated('requests/{requestId}', async (event) => {
  const change = event.data;
  if (!change) {
    return;
  }
  const before = change.before.data();
  const after = change.after.data();
  if (!before || !after) {
    return;
  }
  if (before.status === 'approved' || after.status !== 'approved') {
    return;
  }

  const requestId = event.params.requestId;
  const db = getFirestore(adminApp);
  const broadcastRef = db.collection('broadcasts').doc();

  await broadcastRef.set({
    requestId,
    bloodType: after.bloodType,
    city: after.city,
    hospitalName: after.hospitalId ?? 'Unknown hospital',
    urgency: after.urgency,
    unitsNeeded: after.unitsNeeded,
    broadcastBy: after.reviewedBy ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Recipient selection is a blanket blood-type match, not a clinical
  // decision — `bloodTypeSource` trust levels (docs/04SECURITY.md §6) gate
  // whether a *patient* gets matched against a unit at the hospital, not
  // whether a donor is worth notifying. Self-reported donors are still
  // notified and still get lab-typed at the hospital before any unit is
  // used, so no trust-level filter applies to this query.
  const donorsSnap = await db
    .collection('users')
    .where('role', '==', 'donor')
    .where('bloodType', '==', after.bloodType)
    .get();

  const channels = ['whatsapp', 'sms', 'email', 'push'] as const;
  const batch = db.batch();
  let targetedDonorCount = 0;

  for (const donorDoc of donorsSnap.docs) {
    const donor = donorDoc.data();
    const prefs = donor.notificationPrefs ?? {};
    const enabledChannels = channels.filter((channel) => prefs[channel] === true);
    if (enabledChannels.length === 0) {
      continue;
    }
    targetedDonorCount += 1;
    for (const channel of enabledChannels) {
      const logRef = db.collection('notification_log').doc();
      batch.set(logRef, {
        broadcastId: broadcastRef.id,
        donorId: donorDoc.id,
        channel,
        status: 'queued',
        attempts: 0,
        lastError: null,
        sentAt: null,
        deliveredAt: null,
      });
    }
  }
  await batch.commit();

  await change.after.ref.update({
    status: 'broadcast',
    broadcastAt: FieldValue.serverTimestamp(),
  });

  await writeAudit({
    action: 'broadcast_sent',
    actorUid: after.reviewedBy ?? 'system',
    targetId: broadcastRef.id,
    metadata: { requestId, targetedDonorCount },
  });
});
