import { grantRoleSchema, revokeRoleSchema } from '@vitalpulse/shared-schemas/src/role';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { adminApp } from './lib/admin';
import { writeAudit } from './lib/audit';
import { requireAuth, requireRole } from './lib/authz';

const HOSPITAL_SCOPED_ROLES = ['hospital_staff', 'lab_tech'] as const;

/**
 * `grantRole` — docs/03DATAMODEL.md contract. `system_admin` may grant any
 * role; `hospital_admin` may only grant `hospital_staff`/`lab_tech`, and
 * only within their own hospital (docs/03DATAMODEL.md's own wording:
 * "hospital_admin scoped to their own hospital + hospital_staff/lab_tech
 * only"). Sets the custom-claims token (the authority, per
 * docs/04SECURITY.md §3) and mirrors `role`/`hospitalId` onto the cosmetic
 * `users/{uid}` fields, then revokes refresh tokens so the change takes
 * effect promptly (docs/04SECURITY.md §5.5).
 */
export const grantRole = onCall(async (request) => {
  const ctx = requireAuth(request);
  requireRole(ctx, ['system_admin', 'hospital_admin']);

  const parsed = grantRoleSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', parsed.error.message);
  }
  const input = parsed.data;

  if (ctx.role === 'hospital_admin') {
    if (!(HOSPITAL_SCOPED_ROLES as readonly string[]).includes(input.role)) {
      throw new HttpsError('permission-denied', 'hospital_admin may only grant hospital_staff or lab_tech.');
    }
    if (input.hospitalId !== ctx.hospitalId) {
      throw new HttpsError('permission-denied', 'Cross-hospital role grants are not permitted.');
    }
  }

  const auth = getAuth(adminApp);
  const hospitalId = input.role === 'donor' || input.role === 'system_admin' ? null : (input.hospitalId ?? null);

  await auth.setCustomUserClaims(input.targetUid, {
    role: input.role,
    hospitalId,
    suspended: false,
  });
  await auth.revokeRefreshTokens(input.targetUid);

  const db = getFirestore(adminApp);
  await db
    .collection('users')
    .doc(input.targetUid)
    .set({ role: input.role, hospitalId, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

  await writeAudit({
    action: 'role_granted',
    actorUid: ctx.uid,
    targetId: input.targetUid,
    metadata: { role: input.role, hospitalId },
  });

  return { status: 'granted' };
});

/**
 * `revokeRole` — docs/03DATAMODEL.md contract. Same caller scoping as
 * `grantRole`: `hospital_admin` may only revoke a target currently scoped to
 * their own hospital. Revoking reverts the target to a plain `donor` with no
 * `hospitalId` — the least-privilege state — rather than leaving a
 * claims-less account, which docs/04SECURITY.md §4 treats as the default
 * (and therefore untrusted) state of any account, not a safe "revoked" one.
 */
export const revokeRole = onCall(async (request) => {
  const ctx = requireAuth(request);
  requireRole(ctx, ['system_admin', 'hospital_admin']);

  const parsed = revokeRoleSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', parsed.error.message);
  }
  const input = parsed.data;

  const auth = getAuth(adminApp);
  const target = await auth.getUser(input.targetUid);
  const targetHospitalId = (target.customClaims?.hospitalId as string | undefined) ?? null;

  if (ctx.role === 'hospital_admin' && targetHospitalId !== ctx.hospitalId) {
    throw new HttpsError('permission-denied', 'Cross-hospital role revocation is not permitted.');
  }

  await auth.setCustomUserClaims(input.targetUid, {
    role: 'donor',
    hospitalId: null,
    suspended: false,
  });
  await auth.revokeRefreshTokens(input.targetUid);

  const db = getFirestore(adminApp);
  await db
    .collection('users')
    .doc(input.targetUid)
    .set({ role: 'donor', hospitalId: null, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

  await writeAudit({
    action: 'role_revoked',
    actorUid: ctx.uid,
    targetId: input.targetUid,
    metadata: { previousHospitalId: targetHospitalId },
  });

  return { status: 'revoked' };
});
