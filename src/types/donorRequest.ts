import type { z } from 'zod';

import type { bloodTypeEnum } from '../schemas/profileSchema';
import type { urgencyEnum } from '../schemas/broadcastSchema';
import type { requestTypeEnum } from '../schemas/requestSchemas';

export const requestStatusValues = [
  'pending_review',
  'approved',
  'rejected',
  'broadcast',
  'fulfilled',
  'expired',
] as const;
export type RequestStatus = (typeof requestStatusValues)[number];

/**
 * A donor-facing summary of their own `requests/{id}` document (a subset of
 * the full docs/03DATAMODEL.md contract — `patientContext` is admin-only and
 * never shown here).
 */
export interface DonorRequestSummary {
  id: string;
  requestType: z.infer<typeof requestTypeEnum>;
  status: RequestStatus;
  bloodType: z.infer<typeof bloodTypeEnum>;
  unitsNeeded: number;
  urgency: z.infer<typeof urgencyEnum>;
  city: string;
  hospitalName?: string;
  rejectionReason?: string;
  createdAt: string;
}
