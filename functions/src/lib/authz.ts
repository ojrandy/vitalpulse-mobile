import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

import { appRoleEnum, type AppRole } from '@vitalpulse/shared-schemas/src/role';

export interface AuthContext {
  uid: string;
  role: AppRole;
  hospitalId: string | null;
}

/**
 * Re-checks `request.auth` and custom claims on every call
 * (docs/04SECURITY.md §5.1) — never trust anything the client sends about
 * its own identity. A claims-less signed-in user (a freshly-provisioned
 * account with no role granted yet) is the default state of a brand-new
 * user, not an edge case — it is explicitly rejected here with
 * `permission-denied` rather than allowed to fall through with an
 * `undefined` role (docs/04SECURITY.md §4).
 */
export function requireAuth(request: CallableRequest): AuthContext {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign-in required.');
  }

  const token = request.auth.token;

  if (token.suspended === true) {
    throw new HttpsError('permission-denied', 'This account has been suspended.');
  }

  const roleResult = appRoleEnum.safeParse(token.role);
  if (!roleResult.success) {
    throw new HttpsError('permission-denied', 'No role has been assigned to this account yet.');
  }

  return {
    uid: request.auth.uid,
    role: roleResult.data,
    hospitalId: typeof token.hospitalId === 'string' ? token.hospitalId : null,
  };
}

export function requireRole(ctx: AuthContext, allowed: readonly AppRole[]): void {
  if (!allowed.includes(ctx.role)) {
    throw new HttpsError('permission-denied', `This action requires one of: ${allowed.join(', ')}.`);
  }
}

/**
 * Hospital-scoped separation of duties (docs/04SECURITY.md §2): a
 * `hospital_staff`/`lab_tech`/`hospital_admin` may only act on their own
 * hospital's data. `system_admin` is exempt (cross-hospital ops access is
 * part of its role).
 */
export function requireOwnHospital(ctx: AuthContext, hospitalId: string): void {
  if (ctx.role === 'system_admin') {
    return;
  }
  if (ctx.hospitalId !== hospitalId) {
    throw new HttpsError('permission-denied', 'Cross-hospital access is not permitted.');
  }
}
