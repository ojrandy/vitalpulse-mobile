import { z } from 'zod';

import { bloodTypeEnum } from './bloodType';

/**
 * Matches `addInventoryStock` / `deductInventoryStock`'s shared input
 * contract in docs/03DATAMODEL.md exactly: { hospitalId, bloodType, units,
 * batchId? }. `hospital_staff`, `hospital_admin`, `system_admin` only —
 * `lab_tech` is excluded by design (separation of duties, docs/04SECURITY.md).
 */
export const adjustStockSchema = z.object({
  hospitalId: z.string().trim().min(1),
  bloodType: bloodTypeEnum,
  units: z.number().int().min(1).max(50),
  batchId: z.string().trim().min(1).optional(),
});
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;

/**
 * Matches `resolveLabTest`'s input contract exactly: { hospitalId,
 * bloodType, batchId, result: 'cleared'|'rejected' }. `lab_tech`,
 * `hospital_admin`, `system_admin` only.
 */
export const resolveLabTestSchema = z.object({
  hospitalId: z.string().trim().min(1),
  bloodType: bloodTypeEnum,
  batchId: z.string().trim().min(1),
  result: z.enum(['cleared', 'rejected']),
});
export type ResolveLabTestInput = z.infer<typeof resolveLabTestSchema>;
