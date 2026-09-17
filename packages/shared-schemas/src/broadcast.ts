import { z } from 'zod';

import { bloodTypeEnum } from './bloodType';

/**
 * Matches the `broadcasts/{id}` contract in docs/03DATAMODEL.md exactly —
 * the PHI-minimized public payload a donor sees, never the `requests`
 * document. Read-only on the client; written only by the `broadcastRequest`
 * Cloud Function, which builds this shape field-by-field (docs/04SECURITY.md
 * §7) rather than deriving it from a `requests` doc.
 */
export const urgencyEnum = z.enum(['routine', 'urgent', 'critical']);
export type Urgency = z.infer<typeof urgencyEnum>;

export const broadcastSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  bloodType: bloodTypeEnum,
  city: z.string(),
  hospitalName: z.string(),
  urgency: urgencyEnum,
  unitsNeeded: z.number().int().positive(),
  broadcastBy: z.string().optional(),
  // NOT in docs/03DATAMODEL.md's broadcasts contract yet — the Figma Home
  // screen shows a distance ("3.2 km away") that would need to be computed
  // from the donor's `geo` and the hospital's location. Flagging per
  // CLAUDE.md rather than inventing a stored field; UI-only/optional until
  // that's proposed and added to the data model.
  distanceKm: z.number().nonnegative().optional(),
  createdAt: z.string(),
});
export type Broadcast = z.infer<typeof broadcastSchema>;
