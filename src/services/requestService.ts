import type { ReportShortageInput, RequestBloodInput } from '../schemas/requestSchemas';

/**
 * Stubbed `submitRequest` Cloud Function call (see docs/03DATAMODEL.md).
 * Real writes to `requests/{id}` are Cloud-Functions-only and land once the
 * backend phase starts — this keeps the request-submission screens fully
 * clickable now without a parallel, drifting validation path (both forms
 * still validate against the same Zod schemas the real function will use).
 */
const STUB_DELAY_MS = 500;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const requestService = {
  async submitRequest(input: RequestBloodInput | ReportShortageInput): Promise<{ requestId: string }> {
    await delay(STUB_DELAY_MS);
    return { requestId: `stub-request-${input.bloodType}-${Date.now()}` };
  },
};
