import type { AdminRequestDetail } from '../types/adminRequest';

/**
 * Placeholder data so the admin screens are fully browsable before the
 * backend phase wires real Firestore listeners against `requests/{id}` and
 * `auditLogs/{id}` (docs/03DATAMODEL.md). Shapes match those collections
 * exactly so swapping this out later is a data-source change, not a screen
 * rewrite. `patientContext` is admin-only, per the data model — never reuse
 * this array's shape for a donor-facing screen.
 */
export const mockAdminRequests: AdminRequestDetail[] = [
  {
    id: 'r11',
    requestType: 'donor_reported_shortage',
    status: 'pending_review',
    bloodType: 'O-',
    unitsNeeded: 5,
    urgency: 'critical',
    hospitalId: 'hosp-douala-general',
    city: 'Douala',
    patientContext: { notes: 'Multiple O- units low across the maternity ward; flagged by a repeat donor.' },
    submittedBy: 'donor-uid-estelle',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r20',
    requestType: 'hospital_direct',
    status: 'pending_review',
    bloodType: 'AB-',
    unitsNeeded: 2,
    urgency: 'urgent',
    hospitalId: 'hosp-yaounde-chu',
    city: 'Yaoundé',
    patientContext: { notes: 'Scheduled surgery, patient stable, needed by tomorrow morning.' },
    submittedBy: 'hospital-uid-chu-yaounde',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 'r10',
    requestType: 'donor_directed_patient',
    status: 'approved',
    bloodType: 'AB+',
    unitsNeeded: 2,
    urgency: 'urgent',
    hospitalId: 'hosp-yaounde-chu',
    city: 'Yaoundé',
    patientContext: { notes: 'Directed request for a named patient, family requested community help.' },
    submittedBy: 'donor-uid-jules',
    reviewedBy: 'admin-uid-randy',
    reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'r12',
    requestType: 'donor_directed_patient',
    status: 'rejected',
    bloodType: 'A+',
    unitsNeeded: 1,
    urgency: 'routine',
    hospitalId: 'hosp-douala-laquintinie',
    city: 'Douala',
    patientContext: { notes: 'Submitted twice within the hour by the same donor for the same patient.' },
    submittedBy: 'donor-uid-paul',
    reviewedBy: 'admin-uid-randy',
    reviewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    rejectionReason: 'Duplicate of an existing active request for this patient.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 15 * 60 * 1000).toISOString(),
  },
];

export const mockAuditLog = [
  {
    id: 'a1',
    action: 'request_approved' as const,
    actorUid: 'admin-uid-randy',
    targetId: 'r10',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { bloodType: 'AB+', hospitalId: 'hosp-yaounde-chu' },
  },
  {
    id: 'a2',
    action: 'request_rejected' as const,
    actorUid: 'admin-uid-randy',
    targetId: 'r12',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { reason: 'Duplicate of an existing active request for this patient.' },
  },
  {
    id: 'a3',
    action: 'broadcast_sent' as const,
    actorUid: 'system',
    targetId: 'r10',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    metadata: { targetedDonorCount: 42 },
  },
  {
    id: 'a4',
    action: 'role_granted' as const,
    actorUid: 'admin-uid-randy',
    targetId: 'hospital-uid-chu-yaounde',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { role: 'hospital_staff', hospitalId: 'hosp-yaounde-chu' },
  },
];
export type AuditLogEntry = (typeof mockAuditLog)[number];

/**
 * Display-name lookup for `actorUid`, kept separate from the audit log
 * record itself since `actorUid` → name resolution is a `users` collection
 * join in production, not a stored field on `auditLogs` (docs/03DATAMODEL.md).
 */
export const mockActorNames: Record<string, string> = {
  'admin-uid-randy': 'Randy (System Admin)',
  system: 'System (auto-triggered)',
};

/**
 * Display-name lookup for `hospitalId`, kept separate from `requests` for the
 * same reason as `mockActorNames` above — `hospitalId` → name is a `users`
 * (hospital account) collection join in production, not a field stored on
 * `requests` itself (docs/03DATAMODEL.md).
 */
export const mockHospitalNames: Record<string, string> = {
  'hosp-douala-general': 'Hôpital Général de Douala',
  'hosp-yaounde-chu': 'CHU de Yaoundé',
  'hosp-douala-laquintinie': 'Hôpital Laquintinie',
};
