import { z } from 'zod';

/**
 * Matches `reviewRequest`'s input contract in docs/03DATAMODEL.md exactly:
 * { requestId, decision: 'approve'|'reject', rejectionReason? }. `system_admin`
 * only — see CLAUDE.md non-negotiable #3, only this function can move a
 * request out of `pending_review`, and only an approve decision triggers
 * `broadcastRequest`.
 */
export const reviewDecisionEnum = z.enum(['approve', 'reject']);
export type ReviewDecision = z.infer<typeof reviewDecisionEnum>;

export const reviewRequestSchema = z
  .object({
    requestId: z.string().trim().min(1),
    decision: reviewDecisionEnum,
    rejectionReason: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.decision !== 'reject' || !!data.rejectionReason, {
    message: 'rejectionReasonRequired',
    path: ['rejectionReason'],
  });
export type ReviewRequestInput = z.infer<typeof reviewRequestSchema>;
