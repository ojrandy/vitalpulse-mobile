import { submitRequestSchema } from '@vitalpulse/shared-schemas/src/request';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { adminApp } from './lib/admin';
import { writeAudit } from './lib/audit';
import { requireAuth, requireRole } from './lib/authz';

/**
 * `submitRequest` — docs/03DATAMODEL.md contract. "Any authenticated donor
 * or hospital account" may call this; `lab_tech` is deliberately excluded
 * (docs/04SECURITY.md §2: "lab_tech cannot create requests"). Always
 * creates the doc in `pending_review` — no source, including a hospital
 * account, gets an auto-publish path (CLAUDE.md non-negotiable #3).
 */
const ALLOWED_ROLES = ['donor', 'hospital_staff', 'hospital_admin', 'system_admin'] as const;

export const submitRequest = onCall(async (request) => {
  const ctx = requireAuth(request);
  requireRole(ctx, ALLOWED_ROLES);

  const parsed = submitRequestSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', parsed.error.message);
  }
  const input = parsed.data;

  const db = getFirestore(adminApp);
  const requestRef = db.collection('requests').doc();

  await requestRef.set({
    requestType: input.requestType,
    status: 'pending_review',
    bloodType: input.bloodType,
    unitsNeeded: input.unitsNeeded,
    urgency: input.urgency,
    hospitalId: 'hospitalId' in input ? input.hospitalId : null,
    city: input.city,
    patientContext: input.patientContext,
    submittedBy: ctx.uid,
    reviewedBy: null,
    reviewedAt: null,
    broadcastAt: null,
    rejectionReason: null,
    createdAt: FieldValue.serverTimestamp(),
  });

  await writeAudit({
    action: 'request_submitted',
    actorUid: ctx.uid,
    targetId: requestRef.id,
    metadata: { requestType: input.requestType, bloodType: input.bloodType, urgency: input.urgency },
  });

  return { requestId: requestRef.id };
});
