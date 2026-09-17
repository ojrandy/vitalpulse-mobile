import type { z } from 'zod';

import type { bloodTypeEnum } from '../schemas/profileSchema';

/** Matches the `inventory/{hospitalId}_{bloodType}` contract in docs/03DATAMODEL.md exactly. */
export const batchTestStatusValues = ['waiting_test', 'cleared', 'rejected'] as const;
export type BatchTestStatus = (typeof batchTestStatusValues)[number];

export interface InventoryBatch {
  id: string;
  units: number;
  testStatus: BatchTestStatus;
  collectedAt: string;
}

export interface InventoryRecord {
  hospitalId: string;
  bloodType: z.infer<typeof bloodTypeEnum>;
  batches: InventoryBatch[];
  threshold: number;
  updatedAt: string;
}
