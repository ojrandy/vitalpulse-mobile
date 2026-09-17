import { reviewRequestSchema } from '@vitalpulse/shared-schemas/src/review';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { adminApp } from './lib/admin';
import { writeAudit } from './lib/audit';
import { requireAuth, requireRole } from './lib/authz';

/**
 * `reviewRequest` — docs/03DATAMODEL.md contract. `system_admin` only
 * (CLAUDE.md non-negotiable #3). This is the *only* function that may move a
 * request out of `pending_review`; approval does not itself broadcast —
 * `broadcastRequest` (see broadcastRequest.ts) is a Firestore trigger that
 * fires automatically on the `pending_review -> approved` transition this
 * function makes, so there is no separately-callable "publish" path for any
 * source, including a hospital's own request.
 *
 * Uses a transaction, re-checking status === 'pending_review' inside it, to
 * close the double-accept race named explicitly in docs/06TESTING.md §2 —
 * two admins hitting "approve" on the same request at once must not both
 * succeed.
 */
export const reviewRequest = onCall(async (request) => {
  const ctx = requireAuth(request);
  requireRole(ctx, ['system_admin']);

  const parsed = reviewRequestSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', parsed.error.message);
  }
  const input = parsed.data;

  const db = getFirestore(adminApp);
  const requestRef = db.collection('requests').doc(input.requestId);

  const newStatus = await db.runTransaction(async (tx) => {
    const snap = await tx.get(requestRef);
    if (!snap.exists) {
      throw new HttpsError('not-found', 'Request not found.');
    }
    const current = snap.data();
    if (current?.status !== 'pending_review') {
      throw new HttpsError('failed-precondition', 'This request has already been reviewed.');
    }

    const status = input.decision === 'approve' ? 'approved' : 'rejected';
    tx.update(requestRef, {
      status,
      reviewedBy: ctx.uid,
      reviewedAt: FieldValue.serverTimestamp(),
      rejectionReason: input.decision === 'reject' ? input.rejectionReason : null,
    });
    return status;
  });

  await writeAudit({
    action: newStatus === 'approved' ? 'request_approved' : 'request_rejected',
    actorUid: ctx.uid,
    targetId: input.requestId,
    metadata: newStatus === 'rejected' ? { rejectionReason: input.rejectionReason } : {},
  });

  return { status: newStatus };
});
