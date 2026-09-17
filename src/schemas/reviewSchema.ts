/**
 * Re-exports the shared contract from `@vitalpulse/shared-schemas` — the
 * same schema `functions/src/reviewRequest.ts` validates against
 * server-side (CLAUDE.md non-negotiable #8). Do not redefine here; edit
 * `packages/shared-schemas/src/review.ts` instead.
 */
export { reviewDecisionEnum, reviewRequestSchema } from '@vitalpulse/shared-schemas/src/review';
export type { ReviewDecision, ReviewRequestInput } from '@vitalpulse/shared-schemas/src/review';
