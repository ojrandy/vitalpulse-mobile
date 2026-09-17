import type { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('firebase-admin/app', () => ({ getApps: () => [{}], initializeApp: () => ({}) }));
jest.mock('firebase-admin/firestore', () => require('./helpers/fakeFirestore'));

import { getFirestore, __resetFakeFirestore } from './helpers/fakeFirestore';

const { reviewRequest } = require('../src/reviewRequest');

function req(auth: CallableRequest['auth'], data: unknown): CallableRequest {
  return { auth, data, rawRequest: {} as never, acceptsStreaming: false } as unknown as CallableRequest;
}

const ADMIN_AUTH = { uid: 'admin-1', token: { role: 'system_admin' } } as never;

beforeEach(async () => {
  __resetFakeFirestore();
  await getFirestore()
    .collection('requests')
    .doc('req-1')
    .set({ status: 'pending_review', submittedBy: 'donor-1', bloodType: 'O+' });
});

describe('reviewRequest', () => {
  test('rejects a non-system_admin caller (e.g. hospital_staff)', async () => {
    const auth = { uid: 'staff-1', token: { role: 'hospital_staff', hospitalId: 'hosp-a' } } as never;
    await expect(
      reviewRequest.run(req(auth, { requestId: 'req-1', decision: 'approve' })),
    ).rejects.toThrow('requires one of');
  });

  test('system_admin can approve a pending_review request', async () => {
    const result = await reviewRequest.run(req(ADMIN_AUTH, { requestId: 'req-1', decision: 'approve' }));
    expect(result.status).toBe('approved');

    const snap = await getFirestore().collection('requests').doc('req-1').get();
    expect(snap.data()).toMatchObject({ status: 'approved', reviewedBy: 'admin-1' });
  });

  test('rejecting requires a rejectionReason (schema-level)', async () => {
    await expect(
      reviewRequest.run(req(ADMIN_AUTH, { requestId: 'req-1', decision: 'reject' })),
    ).rejects.toThrow();
  });

  test('rejects with a reason and stores it', async () => {
    const result = await reviewRequest.run(
      req(ADMIN_AUTH, { requestId: 'req-1', decision: 'reject', rejectionReason: 'Not enough context provided' }),
    );
    expect(result.status).toBe('rejected');
    const snap = await getFirestore().collection('requests').doc('req-1').get();
    expect(snap.data()).toMatchObject({ status: 'rejected', rejectionReason: 'Not enough context provided' });
  });

  test('double-accept race: a second review on an already-reviewed request is rejected', async () => {
    await reviewRequest.run(req(ADMIN_AUTH, { requestId: 'req-1', decision: 'approve' }));
    await expect(
      reviewRequest.run(req(ADMIN_AUTH, { requestId: 'req-1', decision: 'approve' })),
    ).rejects.toThrow('already been reviewed');
  });

  test('rejects a request id that does not exist', async () => {
    await expect(
      reviewRequest.run(req(ADMIN_AUTH, { requestId: 'does-not-exist', decision: 'approve' })),
    ).rejects.toThrow('not found');
  });
});
