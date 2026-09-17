import type { CallableRequest } from 'firebase-functions/v2/https';

import { requireAuth, requireOwnHospital, requireRole } from '../src/lib/authz';

function callableRequest(auth: CallableRequest['auth']): CallableRequest {
  return { auth, data: {}, rawRequest: {} as never, acceptsStreaming: false } as unknown as CallableRequest;
}

describe('requireAuth', () => {
  test('rejects an unauthenticated call', () => {
    expect(() => requireAuth(callableRequest(undefined))).toThrow('Sign-in required.');
  });

  test('rejects a suspended account even with a valid role', () => {
    const req = callableRequest({ uid: 'u1', token: { role: 'donor', suspended: true } } as never);
    expect(() => requireAuth(req)).toThrow('suspended');
  });

  test('rejects a claims-less signed-in user (no role assigned yet)', () => {
    const req = callableRequest({ uid: 'u1', token: {} } as never);
    expect(() => requireAuth(req)).toThrow('No role has been assigned');
  });

  test('accepts a valid, unsuspended, role-bearing account', () => {
    const req = callableRequest({ uid: 'u1', token: { role: 'donor', hospitalId: null } } as never);
    expect(requireAuth(req)).toEqual({ uid: 'u1', role: 'donor', hospitalId: null });
  });
});

describe('requireRole', () => {
  test('rejects a role not in the allow-list', () => {
    expect(() => requireRole({ uid: 'u1', role: 'donor', hospitalId: null }, ['system_admin'])).toThrow(
      'requires one of',
    );
  });

  test('accepts a role in the allow-list', () => {
    expect(() => requireRole({ uid: 'u1', role: 'system_admin', hospitalId: null }, ['system_admin'])).not.toThrow();
  });
});

describe('requireOwnHospital', () => {
  test('rejects cross-hospital access for a hospital-scoped role', () => {
    expect(() =>
      requireOwnHospital({ uid: 'u1', role: 'hospital_staff', hospitalId: 'hosp-a' }, 'hosp-b'),
    ).toThrow('Cross-hospital');
  });

  test('accepts own-hospital access', () => {
    expect(() =>
      requireOwnHospital({ uid: 'u1', role: 'hospital_staff', hospitalId: 'hosp-a' }, 'hosp-a'),
    ).not.toThrow();
  });

  test('system_admin bypasses hospital scoping', () => {
    expect(() =>
      requireOwnHospital({ uid: 'u1', role: 'system_admin', hospitalId: null }, 'hosp-a'),
    ).not.toThrow();
  });
});
