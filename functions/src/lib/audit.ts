import { FieldValue, getFirestore } from 'firebase-admin/firestore';

import { adminApp } from './admin';

/**
 * The only path allowed to write `auditLogs/{id}` (docs/03DATAMODEL.md,
 * docs/04SECURITY.md §2 — "no role can write auditLogs directly"). Every
 * privileged Cloud Function calls this before returning
 * (CLAUDE.md non-negotiable #5).
 */
export interface AuditEntry {
  action: string;
  actorUid: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}

export async function writeAudit(entry: AuditEntry): Promise<void> {
  const db = getFirestore(adminApp);
  await db.collection('auditLogs').add({
    action: entry.action,
    actorUid: entry.actorUid,
    targetId: entry.targetId,
    metadata: entry.metadata ?? {},
    timestamp: FieldValue.serverTimestamp(),
  });
}
