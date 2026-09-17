import { z } from 'zod';

/**
 * Matches the role table in docs/04SECURITY.md §2 exactly — the full
 * 5-role set carried in Firebase Auth custom claims. Note this is broader
 * than `src/stores/authStore.ts`'s `appRoleValues` (4 values, no `lab_tech`),
 * which is a client-side routing convenience only and doesn't yet have a
 * dedicated UI shell for `lab_tech` — flagged in docs/ISSUES.md. This schema
 * is the authorization-relevant one; grantRole/revokeRole and the Firestore
 * rules both key off it.
 */
export const appRoleEnum = z.enum(['donor', 'hospital_staff', 'lab_tech', 'hospital_admin', 'system_admin']);
export type AppRole = z.infer<typeof appRoleEnum>;

/**
 * Matches `grantRole` / `revokeRole`'s input contract in docs/03DATAMODEL.md:
 * { targetUid, role, hospitalId? }. `hospitalId` is required when granting
 * any hospital-scoped role (`hospital_staff`, `lab_tech`, `hospital_admin`).
 */
export const grantRoleSchema = z
  .object({
    targetUid: z.string().trim().min(1),
    role: appRoleEnum,
    hospitalId: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.role === 'donor' || data.role === 'system_admin' || !!data.hospitalId, {
    message: 'hospitalIdRequired',
    path: ['hospitalId'],
  });
export type GrantRoleInput = z.infer<typeof grantRoleSchema>;

export const revokeRoleSchema = z.object({
  targetUid: z.string().trim().min(1),
});
export type RevokeRoleInput = z.infer<typeof revokeRoleSchema>;
