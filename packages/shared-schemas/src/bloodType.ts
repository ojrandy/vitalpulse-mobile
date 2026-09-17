import { z } from 'zod';

/**
 * Matches `users/{uid}.bloodType` / `.bloodTypeSource` in docs/03DATAMODEL.md
 * exactly. Imported by both the client profile form and any server-side
 * validation that touches blood type — do not redefine these enums anywhere
 * else (CLAUDE.md non-negotiable #8).
 */
export const bloodTypeEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']);
export type BloodType = z.infer<typeof bloodTypeEnum>;

export const bloodTypeSourceEnum = z.enum(['self_reported', 'lab_confirmed', 'unknown']);
export type BloodTypeSource = z.infer<typeof bloodTypeSourceEnum>;
