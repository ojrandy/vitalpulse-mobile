/**
 * Re-exports the shared contract from `@vitalpulse/shared-schemas` — the
 * same schema `functions/src/broadcastRequest.ts` builds against server-side
 * (CLAUDE.md non-negotiable #8). Do not redefine here; edit
 * `packages/shared-schemas/src/broadcast.ts` instead.
 */
export { urgencyEnum, broadcastSchema } from '@vitalpulse/shared-schemas/src/broadcast';
export type { Urgency, Broadcast } from '@vitalpulse/shared-schemas/src/broadcast';
