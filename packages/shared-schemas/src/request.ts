import { z } from 'zod';

import { bloodTypeEnum } from './bloodType';
import { urgencyEnum } from './broadcast';

/**
 * Matches `submitRequest`'s input contract in docs/03DATAMODEL.md exactly:
 * { requestType, bloodType, unitsNeeded, urgency, hospitalId?, city,
 * patientContext? }. Client form validation and `submitRequest` (Cloud
 * Function) import this same schema — see CLAUDE.md's shared-schema rule.
 * `hospitalId` is a free-text hospital name for now since no hospital
 * directory/picker exists yet; swap for a real hospitalId once one does.
 */
export const requestTypeEnum = z.enum([
  'hospital_direct',
  'donor_directed_patient',
  'donor_reported_shortage',
  'whatsapp_bot',
]);
export type RequestType = z.infer<typeof requestTypeEnum>;

export const requestStatusEnum = z.enum([
  'pending_review',
  'approved',
  'rejected',
  'broadcast',
  'fulfilled',
  'expired',
]);
export type RequestStatus = z.infer<typeof requestStatusEnum>;

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

/**
 * `submitRequest` accepts either shape above, discriminated by
 * `requestType`. `hospital_direct` isn't submittable from this app yet (no
 * hospital-initiated request UI exists — flagging rather than building it,
 * per CLAUDE.md scope discipline) so it isn't part of this union; the Cloud
 * Function still stores whatever `requestType` was validated.
 */
export const submitRequestSchema = z.discriminatedUnion('requestType', [requestBloodSchema, reportShortageSchema]);
export type SubmitRequestInput = z.infer<typeof submitRequestSchema>;
