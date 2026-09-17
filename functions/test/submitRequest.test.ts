import type { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('firebase-admin/app', () => ({ getApps: () => [{}], initializeApp: () => ({}) }));
jest.mock('firebase-admin/firestore', () => require('./helpers/fakeFirestore'));

import { getFirestore, __resetFakeFirestore } from './helpers/fakeFirestore';

const { submitRequest } = require('../src/submitRequest');

function req(auth: CallableRequest['auth'], data: unknown): CallableRequest {
  return { auth, data, rawRequest: {} as never, acceptsStreaming: false } as unknown as CallableRequest;
}

beforeEach(() => __resetFakeFirestore());

describe('submitRequest', () => {
  test('rejects an unauthenticated call', async () => {
    await expect(submitRequest.run(req(undefined, {}))).rejects.toThrow('Sign-in required');
  });

  test('rejects a lab_tech (excluded from submitting requests)', async () => {
    const auth = { uid: 'lab-1', token: { role: 'lab_tech' } } as never;
    const data = {
      requestType: 'donor_reported_shortage',
      bloodType: 'O+',
      unitsNeeded: 2,
      city: 'Douala',
      urgency: 'urgent',
      patientContext: { notes: 'low stock' },
    };
    await expect(submitRequest.run(req(auth, data))).rejects.toThrow('requires one of');
  });

  test('a donor can submit a shortage report and it lands in pending_review', async () => {
    const auth = { uid: 'donor-1', token: { role: 'donor' } } as never;
    const data = {
      requestType: 'donor_reported_shortage',
      bloodType: 'O-',
      unitsNeeded: 3,
      city: 'Douala',
      urgency: 'critical',
      patientContext: { notes: 'Maternity ward running low' },
    };
    const result = await submitRequest.run(req(auth, data));
    expect(result.requestId).toBeTruthy();

    const db = getFirestore();
    const snap = await db.collection('requests').doc(result.requestId).get();
    expect(snap.data()).toMatchObject({
      status: 'pending_review',
      submittedBy: 'donor-1',
      bloodType: 'O-',
      requestType: 'donor_reported_shortage',
    });
  });

  test('rejects an invalid payload (missing required fields)', async () => {
    const auth = { uid: 'donor-1', token: { role: 'donor' } } as never;
    await expect(submitRequest.run(req(auth, { requestType: 'donor_reported_shortage' }))).rejects.toThrow();
  });
});
