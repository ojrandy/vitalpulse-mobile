import { z } from 'zod';

import { bloodTypeEnum, bloodTypeSourceEnum } from './bloodType';

/**
 * Matches the `users/{uid}` fields in docs/03DATAMODEL.md exactly. A donor
 * filling out their own profile can only ever produce a self-report or an
 * explicit "unknown" — `lab_confirmed` is set exclusively by `resolveLabTest`
 * (see docs/04SECURITY.md §6), never by this form or the direct Firestore
 * write it authorizes (see `firestore.rules`, `users/{userId}` self-write
 * rule, which re-checks this same constraint server-side).
 */
export const profileSetupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  bloodType: bloodTypeEnum,
  bloodTypeSource: bloodTypeSourceEnum.exclude(['lab_confirmed']),
});
export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;
