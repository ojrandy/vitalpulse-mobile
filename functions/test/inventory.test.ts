import type { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('firebase-admin/app', () => ({ getApps: () => [{}], initializeApp: () => ({}) }));
jest.mock('firebase-admin/firestore', () => require('./helpers/fakeFirestore'));

import { getFirestore, __resetFakeFirestore } from './helpers/fakeFirestore';

const { addInventoryStock, deductInventoryStock, resolveLabTest } = require('../src/inventory');

function req(auth: CallableRequest['auth'], data: unknown): CallableRequest {
  return { auth, data, rawRequest: {} as never, acceptsStreaming: false } as unknown as CallableRequest;
}

const STAFF_A = { uid: 'staff-a', token: { role: 'hospital_staff', hospitalId: 'hosp-a' } } as never;
const LAB_A = { uid: 'lab-a', token: { role: 'lab_tech', hospitalId: 'hosp-a' } } as never;
const STAFF_B = { uid: 'staff-b', token: { role: 'hospital_staff', hospitalId: 'hosp-b' } } as never;

beforeEach(() => __resetFakeFirestore());

describe('addInventoryStock', () => {
  test('lab_tech is excluded (separation of duties)', async () => {
    await expect(
      addInventoryStock.run(req(LAB_A, { hospitalId: 'hosp-a', bloodType: 'O+', units: 5 })),
    ).rejects.toThrow('requires one of');
  });

  test('cross-hospital stock add is denied', async () => {
    await expect(
      addInventoryStock.run(req(STAFF_B, { hospitalId: 'hosp-a', bloodType: 'O+', units: 5 })),
    ).rejects.toThrow('Cross-hospital');
  });

  test('own-hospital staff can add a new batch (waiting_test, not yet counted as cleared)', async () => {
    const result = await addInventoryStock.run(req(STAFF_A, { hospitalId: 'hosp-a', bloodType: 'O+', units: 5 }));
    expect(result.newTotal).toBe(0); // new batch starts waiting_test, not cleared

    const snap = await getFirestore().collection('inventory').doc('hosp-a_O+').get();
    const batches = snap.data()?.batches as Array<{ testStatus: string; units: number }>;
    expect(batches).toHaveLength(1);
    expect(batches[0]).toMatchObject({ testStatus: 'waiting_test', units: 5 });
  });
});

describe('resolveLabTest + deductInventoryStock', () => {
  beforeEach(async () => {
    await addInventoryStock.run(req(STAFF_A, { hospitalId: 'hosp-a', bloodType: 'O+', units: 5 }));
  });

  test('lab_tech clears the batch, which then counts toward newTotal', async () => {
    const snap = await getFirestore().collection('inventory').doc('hosp-a_O+').get();
    const batchId = (snap.data()?.batches as Array<{ id: string }>)[0].id;

    const result = await resolveLabTest.run(
      req(LAB_A, { hospitalId: 'hosp-a', bloodType: 'O+', batchId, result: 'cleared' }),
    );
    expect(result.status).toBe('cleared');
  });

  test('a waiting_test batch cannot be dispensed', async () => {
    const snap = await getFirestore().collection('inventory').doc('hosp-a_O+').get();
    const batchId = (snap.data()?.batches as Array<{ id: string }>)[0].id;
    await expect(
      deductInventoryStock.run(req(STAFF_A, { hospitalId: 'hosp-a', bloodType: 'O+', units: 2, batchId })),
    ).rejects.toThrow('Only cleared batches');
  });

  test('a cleared batch can be deducted and newTotal reflects it', async () => {
    const snap = await getFirestore().collection('inventory').doc('hosp-a_O+').get();
    const batchId = (snap.data()?.batches as Array<{ id: string }>)[0].id;
    await resolveLabTest.run(req(LAB_A, { hospitalId: 'hosp-a', bloodType: 'O+', batchId, result: 'cleared' }));

    const result = await deductInventoryStock.run(
      req(STAFF_A, { hospitalId: 'hosp-a', bloodType: 'O+', units: 2, batchId }),
    );
    expect(result.newTotal).toBe(3);
  });

  test('deducting more than available cleared stock fails', async () => {
    const snap = await getFirestore().collection('inventory').doc('hosp-a_O+').get();
    const batchId = (snap.data()?.batches as Array<{ id: string }>)[0].id;
    await resolveLabTest.run(req(LAB_A, { hospitalId: 'hosp-a', bloodType: 'O+', batchId, result: 'cleared' }));

    await expect(
      deductInventoryStock.run(req(STAFF_A, { hospitalId: 'hosp-a', bloodType: 'O+', units: 50 })),
    ).rejects.toThrow('Not enough cleared stock');
  });
});
