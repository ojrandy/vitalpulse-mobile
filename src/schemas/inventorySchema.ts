/**
 * Re-exports the shared contract from `@vitalpulse/shared-schemas` — the
 * same schemas `functions/src/inventory.ts` validates against server-side
 * (CLAUDE.md non-negotiable #8). Do not redefine here; edit
 * `packages/shared-schemas/src/inventory.ts` instead.
 */
export { adjustStockSchema, resolveLabTestSchema } from '@vitalpulse/shared-schemas/src/inventory';
export type { AdjustStockInput, ResolveLabTestInput } from '@vitalpulse/shared-schemas/src/inventory';
