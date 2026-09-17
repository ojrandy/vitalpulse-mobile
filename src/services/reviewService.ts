import type { ReviewRequestInput } from '../schemas/reviewSchema';

/**
 * Stubbed `reviewRequest` Cloud Function call (see docs/03DATAMODEL.md).
 * `system_admin`-only in production — real writes to `requests/{id}.status`
 * land once the backend phase starts (CLAUDE.md non-negotiable #3: only this
 * function can approve a request, and only approval triggers
 * `broadcastRequest`). This keeps the review queue fully clickable now
 * against the same Zod schema the real function will validate against.
 */
const STUB_DELAY_MS = 500;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const reviewService = {
  async reviewRequest(input: ReviewRequestInput): Promise<{ status: 'approved' | 'rejected' }> {
    await delay(STUB_DELAY_MS);
    return { status: input.decision === 'approve' ? 'approved' : 'rejected' };
  },
};
