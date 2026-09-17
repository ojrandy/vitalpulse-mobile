import type { z } from 'zod';

import type { bloodTypeEnum } from '../schemas/profileSchema';
import type { urgencyEnum } from '../schemas/broadcastSchema';
import type { requestTypeEnum } from '../schemas/requestSchemas';
import type { RequestStatus } from './donorRequest';

/**
 * The full `requests/{id}` document as `system_admin` sees it in the review
 * queue — includes `patientContext`, which is admin-only per
 * docs/03DATAMODEL.md and must never be copied into a donor-facing type or
 * the `broadcasts` payload (CLAUDE.md non-negotiable #4).
 */
export interface AdminRequestDetail {
  id: string;
  requestType: z.infer<typeof requestTypeEnum>;
  status: RequestStatus;
  bloodType: z.infer<typeof bloodTypeEnum>;
  unitsNeeded: number;
  urgency: z.infer<typeof urgencyEnum>;
  hospitalId: string;
  city: string;
  patientContext?: { notes: string };
  submittedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}
