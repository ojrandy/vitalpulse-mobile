import { z } from 'zod';

/**
 * Matches the `users/{uid}` fields in docs/03DATAMODEL.md exactly:
 * bloodType/bloodTypeSource enums, city, and the client-writable display
 * name. Do not add fields here that aren't documented there — add the
 * contract first (see CLAUDE.md "When a contract is missing").
 */
export const bloodTypeEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']);
export const bloodTypeSourceEnum = z.enum(['self_reported', 'lab_confirmed', 'unknown']);

export const profileSetupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  bloodType: bloodTypeEnum,
  // A donor filling out their own profile can only ever produce a
  // self-report or an explicit "unknown" — lab_confirmed is set exclusively
  // by resolveLabTest (see docs/04SECURITY.md §6), never by this form.
  bloodTypeSource: bloodTypeSourceEnum.exclude(['lab_confirmed']),
});
export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;
