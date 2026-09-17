import { adjustStockSchema, resolveLabTestSchema } from '@vitalpulse/shared-schemas/src/inventory';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { adminApp } from './lib/admin';
import { writeAudit } from './lib/audit';
import { requireAuth, requireOwnHospital, requireRole } from './lib/authz';

interface Batch {
  id: string;
  units: number;
  testStatus: 'waiting_test' | 'cleared' | 'rejected';
  collectedAt: string;
}

const STOCK_ROLES = ['hospital_staff', 'hospital_admin', 'system_admin'] as const;
const LAB_ROLES = ['lab_tech', 'hospital_admin', 'system_admin'] as const;

function inventoryDocId(hospitalId: string, bloodType: string): string {
  return `${hospitalId}_${bloodType}`;
}

/** `newTotal` is the sum of `cleared` batch units — the figure that actually drives the low-stock threshold, not raw units-in-any-state. */
function clearedTotal(batches: Batch[]): number {
  return batches.filter((b) => b.testStatus === 'cleared').reduce((sum, b) => sum + b.units, 0);
}

/**
 * `addInventoryStock` — docs/03DATAMODEL.md contract. `lab_tech` is
 * deliberately excluded (separation of duties, docs/04SECURITY.md §2). A
 * new batch always starts `waiting_test` — stock only becomes part of the
 * `cleared` total once `resolveLabTest` clears it.
 */
export const addInventoryStock = onCall(async (request) => {
  const ctx = requireAuth(request);
  requireRole(ctx, STOCK_ROLES);

  const parsed = adjustStockSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', parsed.error.message);
  }
  const input = parsed.data;
  requireOwnHospital(ctx, input.hospitalId);

  const db = getFirestore(adminApp);
  const ref = db.collection('inventory').doc(inventoryDocId(input.hospitalId, input.bloodType));

  const newTotal = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const batches: Batch[] = snap.exists ? (snap.data()?.batches ?? []) : [];
    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      units: input.units,
      testStatus: 'waiting_test',
      collectedAt: Timestamp.now().toDate().toISOString(),
    };
    const nextBatches = [...batches, newBatch];
    tx.set(
      ref,
      {
        hospitalId: input.hospitalId,
        bloodType: input.bloodType,
        batches: nextBatches,
        threshold: snap.exists ? (snap.data()?.threshold ?? 0) : 0,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return clearedTotal(nextBatches);
  });

  await writeAudit({
    action: 'inventory_stock_added',
    actorUid: ctx.uid,
    targetId: ref.id,
    metadata: { units: input.units },
  });

  return { newTotal };
});

/**
 * `deductInventoryStock` — docs/03DATAMODEL.md contract. Only `cleared`
 * batches are dispensable (a `waiting_test`/`rejected` batch can't leave the
 * building). When `batchId` is omitted, deducts oldest-`cleared`-first
 * (FEFO) across as many batches as needed — a reasonable Day-1 default for
 * "units used, don't care which batch," not a documented contract detail,
 * so flagging the assumption here rather than in docs/03DATAMODEL.md.
 */
export const deductInventoryStock = onCall(async (request) => {
  const ctx = requireAuth(request);
  requireRole(ctx, STOCK_ROLES);

  const parsed = adjustStockSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', parsed.error.message);
  }
  const input = parsed.data;
  requireOwnHospital(ctx, input.hospitalId);

  const db = getFirestore(adminApp);
  const ref = db.collection('inventory').doc(inventoryDocId(input.hospitalId, input.bloodType));

  const newTotal = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      throw new HttpsError('failed-precondition', 'No inventory record for this hospital/blood type.');
    }
    const batches: Batch[] = snap.data()?.batches ?? [];

    let remaining = input.units;
    const nextBatches = [...batches].sort((a, b) => a.collectedAt.localeCompare(b.collectedAt));

    if (input.batchId) {
      const batch = nextBatches.find((b) => b.id === input.batchId);
      if (!batch) {
        throw new HttpsError('not-found', 'Batch not found.');
      }
      if (batch.testStatus !== 'cleared') {
        throw new HttpsError('failed-precondition', 'Only cleared batches can be dispensed.');
      }
      if (batch.units < remaining) {
        throw new HttpsError('failed-precondition', 'Not enough units in this batch.');
      }
      batch.units -= remaining;
      remaining = 0;
    } else {
      for (const batch of nextBatches) {
        if (remaining <= 0) break;
        if (batch.testStatus !== 'cleared') continue;
        const take = Math.min(batch.units, remaining);
        batch.units -= take;
        remaining -= take;
      }
    }

    if (remaining > 0) {
      throw new HttpsError('failed-precondition', 'Not enough cleared stock to deduct this many units.');
    }

    const filtered = nextBatches.filter((b) => b.units > 0);
    tx.update(ref, { batches: filtered, updatedAt: FieldValue.serverTimestamp() });
    return clearedTotal(filtered);
  });

  await writeAudit({
    action: 'inventory_stock_deducted',
    actorUid: ctx.uid,
    targetId: ref.id,
    metadata: { units: input.units, batchId: input.batchId ?? null },
  });

  return { newTotal };
});

/**
 * `resolveLabTest` — docs/03DATAMODEL.md contract. `hospital_staff` is
 * deliberately excluded — only `lab_tech`/`hospital_admin`/`system_admin`
 * may clear or reject a batch (separation of duties, docs/04SECURITY.md §2).
 */
export const resolveLabTest = onCall(async (request) => {
  const ctx = requireAuth(request);
  requireRole(ctx, LAB_ROLES);

  const parsed = resolveLabTestSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', parsed.error.message);
  }
  const input = parsed.data;
  requireOwnHospital(ctx, input.hospitalId);

  const db = getFirestore(adminApp);
  const ref = db.collection('inventory').doc(inventoryDocId(input.hospitalId, input.bloodType));

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      throw new HttpsError('not-found', 'No inventory record for this hospital/blood type.');
    }
    const batches: Batch[] = snap.data()?.batches ?? [];
    const batch = batches.find((b) => b.id === input.batchId);
    if (!batch) {
      throw new HttpsError('not-found', 'Batch not found.');
    }
    batch.testStatus = input.result;
    tx.update(ref, { batches, updatedAt: FieldValue.serverTimestamp() });
  });

  await writeAudit({
    action: 'lab_test_resolved',
    actorUid: ctx.uid,
    targetId: `${ref.id}:${input.batchId}`,
    metadata: { result: input.result },
  });

  return { status: input.result };
});
