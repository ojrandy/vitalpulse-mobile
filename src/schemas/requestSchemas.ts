import { z } from 'zod';

import { bloodTypeEnum } from './profileSchema';
import { urgencyEnum } from './broadcastSchema';

/**
 * Matches `submitRequest`'s input contract in docs/03DATAMODEL.md exactly:
 * { requestType, bloodType, unitsNeeded, urgency, hospitalId?, city,
 * patientContext? }. Client form validation and the future Cloud Function
 * validation must import this same schema — see CLAUDE.md's shared-schema
 * rule. `hospitalId` is a free-text hospital name for now since no hospital
 * directory/picker exists yet; swap for a real hospitalId once one does.
 */
export const requestTypeEnum = z.enum([
  'hospital_direct',
  'donor_directed_patient',
  'donor_reported_shortage',
  'whatsapp_bot',
]);

export const requestBloodSchema = z.object({
  requestType: z.literal('donor_directed_patient'),
  bloodType: bloodTypeEnum,
  unitsNeeded: z.number().int().min(1).max(20),
  hospitalId: z.string().trim().min(1),
  city: z.string().trim().min(1),
  urgency: urgencyEnum,
  patientContext: z.object({
    notes: z.string().trim().max(500),
  }),
});
export type RequestBloodInput = z.infer<typeof requestBloodSchema>;

export const reportShortageSchema = z.object({
  requestType: z.literal('donor_reported_shortage'),
  bloodType: bloodTypeEnum,
  unitsNeeded: z.number().int().min(1).max(20),
  city: z.string().trim().min(1),
  urgency: urgencyEnum,
  patientContext: z.object({
    notes: z.string().trim().max(500),
  }),
});
export type ReportShortageInput = z.infer<typeof reportShortageSchema>;
