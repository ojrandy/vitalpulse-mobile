import type { AdjustStockInput, ResolveLabTestInput } from '../schemas/inventorySchema';

/**
 * Stubbed `addInventoryStock` / `deductInventoryStock` / `resolveLabTest`
 * Cloud Function calls (see docs/03DATAMODEL.md). All three are
 * Cloud-Functions-only in production — real writes to `inventory/{id}` land
 * once the backend phase starts. This keeps the hospital inventory screens
 * fully clickable now against the same Zod schemas the real functions will
 * validate against.
 */
const STUB_DELAY_MS = 500;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const inventoryService = {
  async addInventoryStock(input: AdjustStockInput): Promise<{ newTotal: number }> {
    await delay(STUB_DELAY_MS);
    return { newTotal: input.units };
  },
  async deductInventoryStock(input: AdjustStockInput): Promise<{ newTotal: number }> {
    await delay(STUB_DELAY_MS);
    return { newTotal: Math.max(0, -input.units) };
  },
  async resolveLabTest(input: ResolveLabTestInput): Promise<{ status: ResolveLabTestInput['result'] }> {
    await delay(STUB_DELAY_MS);
    return { status: input.result };
  },
};
