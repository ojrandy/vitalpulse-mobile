import type { CallableRequest } from 'firebase-functions/v2/https';

const setCustomUserClaims = jest.fn();
const revokeRefreshTokens = jest.fn();
const getUser = jest.fn();

jest.mock('firebase-admin/app', () => ({ getApps: () => [{}], initializeApp: () => ({}) }));
jest.mock('firebase-admin/firestore', () => require('./helpers/fakeFirestore'));
jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ setCustomUserClaims, revokeRefreshTokens, getUser }),
}));

import { __resetFakeFirestore } from './helpers/fakeFirestore';

const { grantRole, revokeRole } = require('../src/roles');

function req(auth: CallableRequest['auth'], data: unknown): CallableRequest {
  return { auth, data, rawRequest: {} as never, acceptsStreaming: false } as unknown as CallableRequest;
}

const SYSTEM_ADMIN = { uid: 'sysadmin-1', token: { role: 'system_admin' } } as never;
const HOSPITAL_ADMIN_A = { uid: 'hadmin-a', token: { role: 'hospital_admin', hospitalId: 'hosp-a' } } as never;
const DONOR = { uid: 'donor-1', token: { role: 'donor' } } as never;

beforeEach(() => {
  __resetFakeFirestore();
  setCustomUserClaims.mockClear();
  revokeRefreshTokens.mockClear();
  getUser.mockReset();
});

describe('grantRole', () => {
  test('a donor cannot grant roles', async () => {
    await expect(
      grantRole.run(req(DONOR, { targetUid: 'target-1', role: 'hospital_staff', hospitalId: 'hosp-a' })),
    ).rejects.toThrow('requires one of');
  });

  test('system_admin can grant any role, including hospital_admin', async () => {
    const result = await grantRole.run(
      req(SYSTEM_ADMIN, { targetUid: 'target-1', role: 'hospital_admin', hospitalId: 'hosp-a' }),
    );
    expect(result.status).toBe('granted');
    expect(setCustomUserClaims).toHaveBeenCalledWith('target-1', {
      role: 'hospital_admin',
      hospitalId: 'hosp-a',
      suspended: false,
    });
    expect(revokeRefreshTokens).toHaveBeenCalledWith('target-1');
  });

  test('hospital_admin cannot grant hospital_admin (only hospital_staff/lab_tech)', async () => {
    await expect(
      grantRole.run(req(HOSPITAL_ADMIN_A, { targetUid: 'target-1', role: 'hospital_admin', hospitalId: 'hosp-a' })),
    ).rejects.toThrow('may only grant hospital_staff or lab_tech');
  });

  test('hospital_admin cannot grant a role for a different hospital (cross-hospital escalation)', async () => {
    await expect(
      grantRole.run(req(HOSPITAL_ADMIN_A, { targetUid: 'target-1', role: 'lab_tech', hospitalId: 'hosp-b' })),
    ).rejects.toThrow('Cross-hospital');
  });

  test('hospital_admin can grant lab_tech within their own hospital', async () => {
    const result = await grantRole.run(
      req(HOSPITAL_ADMIN_A, { targetUid: 'target-1', role: 'lab_tech', hospitalId: 'hosp-a' }),
    );
    expect(result.status).toBe('granted');
  });
});

describe('revokeRole', () => {
  test('reverts the target to a plain donor with no hospitalId', async () => {
    getUser.mockResolvedValue({ customClaims: { role: 'hospital_staff', hospitalId: 'hosp-a' } });
    const result = await revokeRole.run(req(SYSTEM_ADMIN, { targetUid: 'target-1' }));
    expect(result.status).toBe('revoked');
    expect(setCustomUserClaims).toHaveBeenCalledWith('target-1', {
      role: 'donor',
      hospitalId: null,
      suspended: false,
    });
  });

  test('hospital_admin cannot revoke a staff member from a different hospital', async () => {
    getUser.mockResolvedValue({ customClaims: { role: 'hospital_staff', hospitalId: 'hosp-b' } });
    await expect(revokeRole.run(req(HOSPITAL_ADMIN_A, { targetUid: 'target-1' }))).rejects.toThrow(
      'Cross-hospital',
    );
  });
});
