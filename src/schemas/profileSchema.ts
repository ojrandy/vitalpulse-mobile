/**
 * Re-exports the shared contract from `@vitalpulse/shared-schemas` — the
 * same schema `functions/src/users.ts` validates against server-side
 * (CLAUDE.md non-negotiable #8: shared Zod schemas, not parallel
 * validation). Do not redefine these here; edit
 * `packages/shared-schemas/src/bloodType.ts` / `profile.ts` instead.
 */
export { bloodTypeEnum, bloodTypeSourceEnum } from '@vitalpulse/shared-schemas/src/bloodType';
export { profileSetupSchema } from '@vitalpulse/shared-schemas/src/profile';
export type { BloodType, BloodTypeSource } from '@vitalpulse/shared-schemas/src/bloodType';
export type { ProfileSetupInput } from '@vitalpulse/shared-schemas/src/profile';
