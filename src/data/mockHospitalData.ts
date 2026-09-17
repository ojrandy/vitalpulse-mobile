import type { InventoryRecord } from '../types/inventory';

/**
 * Placeholder data so the hospital screens are fully browsable before the
 * backend phase wires real Firestore listeners against `inventory/{id}`
 * (docs/03DATAMODEL.md). Shapes match that collection exactly so swapping
 * this out later is a data-source change, not a screen rewrite.
 */
export const mockHospitalProfile = {
  name: 'Hôpital Général de Douala',
  hospitalId: 'hosp-douala-general',
  city: 'Douala',
};

export const mockInventory: InventoryRecord[] = [
  {
    hospitalId: 'hosp-douala-general',
    bloodType: 'O-',
    threshold: 10,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    batches: [
      { id: 'batch-o-1', units: 3, testStatus: 'cleared', collectedAt: '2026-09-10' },
      { id: 'batch-o-2', units: 2, testStatus: 'waiting_test', collectedAt: '2026-09-14' },
    ],
  },
  {
    hospitalId: 'hosp-douala-general',
    bloodType: 'O+',
    threshold: 15,
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    batches: [
      { id: 'batch-op-1', units: 9, testStatus: 'cleared', collectedAt: '2026-09-08' },
      { id: 'batch-op-2', units: 4, testStatus: 'cleared', collectedAt: '2026-09-12' },
    ],
  },
  {
    hospitalId: 'hosp-douala-general',
    bloodType: 'A+',
    threshold: 12,
    updatedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    batches: [
      { id: 'batch-ap-1', units: 6, testStatus: 'cleared', collectedAt: '2026-09-09' },
      { id: 'batch-ap-2', units: 1, testStatus: 'rejected', collectedAt: '2026-09-11' },
    ],
  },
  {
    hospitalId: 'hosp-douala-general',
    bloodType: 'A-',
    threshold: 8,
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    batches: [{ id: 'batch-am-1', units: 2, testStatus: 'cleared', collectedAt: '2026-09-13' }],
  },
  {
    hospitalId: 'hosp-douala-general',
    bloodType: 'B+',
    threshold: 10,
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    batches: [
      { id: 'batch-bp-1', units: 5, testStatus: 'cleared', collectedAt: '2026-09-07' },
      { id: 'batch-bp-2', units: 3, testStatus: 'waiting_test', collectedAt: '2026-09-15' },
    ],
  },
  {
    hospitalId: 'hosp-douala-general',
    bloodType: 'B-',
    threshold: 6,
    updatedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    batches: [{ id: 'batch-bm-1', units: 1, testStatus: 'cleared', collectedAt: '2026-09-05' }],
  },
  {
    hospitalId: 'hosp-douala-general',
    bloodType: 'AB+',
    threshold: 6,
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    batches: [{ id: 'batch-abp-1', units: 4, testStatus: 'cleared', collectedAt: '2026-09-10' }],
  },
  {
    hospitalId: 'hosp-douala-general',
    bloodType: 'AB-',
    threshold: 4,
    updatedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    batches: [],
  },
];
