jest.mock('firebase-admin/app', () => ({ getApps: () => [{}], initializeApp: () => ({}) }));
jest.mock('firebase-admin/firestore', () => require('./helpers/fakeFirestore'));

import { getFirestore, __resetFakeFirestore } from './helpers/fakeFirestore';

const { broadcastRequest } = require('../src/broadcastRequest');

function updateEvent(before: Record<string, unknown> | undefined, after: Record<string, unknown> | undefined) {
  return {
    params: { requestId: 'req-1' },
    data:
      before && after
        ? {
            before: { data: () => before },
            after: { data: () => after, ref: { update: jest.fn().mockResolvedValue(undefined) } },
          }
        : undefined,
  } as never;
}

beforeEach(() => __resetFakeFirestore());

describe('broadcastRequest trigger', () => {
  test('does nothing when the status transition is not into approved', async () => {
    await broadcastRequest.run(
      updateEvent({ status: 'pending_review' }, { status: 'rejected', bloodType: 'O+', city: 'Douala' }),
    );
    const snap = await getFirestore().collection('broadcasts').get();
    expect(snap.empty).toBe(true);
  });

  test('does nothing on a re-fire where status was already approved (no re-broadcast loop)', async () => {
    await broadcastRequest.run(
      updateEvent({ status: 'approved' }, { status: 'broadcast', bloodType: 'O+', city: 'Douala' }),
    );
    const snap = await getFirestore().collection('broadcasts').get();
    expect(snap.empty).toBe(true);
  });

  test('builds a PHI-minimized broadcast doc on the pending_review -> approved transition', async () => {
    await broadcastRequest.run(
      updateEvent(
        { status: 'pending_review' },
        {
          status: 'approved',
          bloodType: 'O-',
          city: 'Douala',
          hospitalId: 'Hôpital Général',
          urgency: 'critical',
          unitsNeeded: 4,
          reviewedBy: 'admin-1',
          patientContext: { notes: 'should never appear in the broadcast' },
        },
      ),
    );
    const snap = await getFirestore().collection('broadcasts').get();
    expect(snap.empty).toBe(false);
    const broadcastData = snap.docs[0].data() as Record<string, unknown>;
    expect(broadcastData).toMatchObject({
      requestId: 'req-1',
      bloodType: 'O-',
      city: 'Douala',
      hospitalName: 'Hôpital Général',
      urgency: 'critical',
      unitsNeeded: 4,
      broadcastBy: 'admin-1',
    });
    expect(broadcastData.patientContext).toBeUndefined();
  });
});
