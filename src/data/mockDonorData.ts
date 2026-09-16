import type { Broadcast } from '../schemas/broadcastSchema';
import type { DonorRequestSummary } from '../types/donorRequest';

/**
 * Placeholder data so the screens are fully browsable before the backend
 * phase wires real Firestore listeners (TanStack Query + `broadcasts` /
 * `requests` collections per docs/03DATAMODEL.md). Shapes match those
 * collections exactly so swapping this out later is a data-source change,
 * not a screen rewrite.
 */
export const mockDonorProfile = {
  name: 'Estelle Ngo Bakang',
  city: 'Douala',
  bloodType: 'O-' as const,
  bloodTypeSource: 'lab_confirmed' as const,
  lastDonationDate: '2026-04-12',
  isEligible: true,
  points: 480,
  tier: 'Silver',
  badges: ['First donation', '3-time donor', 'Rapid responder'],
};

export const mockBroadcasts: Broadcast[] = [
  {
    id: 'b1',
    requestId: 'r1',
    bloodType: 'O-',
    city: 'Douala',
    hospitalName: 'Hôpital Général de Douala',
    urgency: 'critical',
    unitsNeeded: 4,
    distanceKm: 3.2,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'b2',
    requestId: 'r2',
    bloodType: 'O+',
    city: 'Douala',
    hospitalName: 'Clinique des Spécialités Bonapriso',
    urgency: 'urgent',
    unitsNeeded: 2,
    distanceKm: 5.8,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b3',
    requestId: 'r3',
    bloodType: 'B+',
    city: 'Douala',
    hospitalName: 'Polyclinique Bonanjo',
    urgency: 'routine',
    unitsNeeded: 3,
    distanceKm: 7.1,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockMyRequests: DonorRequestSummary[] = [
  {
    id: 'r10',
    requestType: 'donor_directed_patient',
    status: 'broadcast',
    bloodType: 'AB+',
    unitsNeeded: 2,
    urgency: 'urgent',
    city: 'Yaoundé',
    hospitalName: 'CHU de Yaoundé',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r11',
    requestType: 'donor_reported_shortage',
    status: 'pending_review',
    bloodType: 'O-',
    unitsNeeded: 5,
    urgency: 'critical',
    city: 'Douala',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r12',
    requestType: 'donor_directed_patient',
    status: 'rejected',
    bloodType: 'A+',
    unitsNeeded: 1,
    urgency: 'routine',
    city: 'Douala',
    hospitalName: 'Hôpital Laquintinie',
    rejectionReason: 'Duplicate of an existing active request for this patient.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockDonationHistory = [
  { id: 'd1', date: '2026-04-12', hospitalName: 'Hôpital Général de Douala', bloodType: 'O-', units: 1 },
  { id: 'd2', date: '2025-12-03', hospitalName: 'Clinique des Spécialités Bonapriso', bloodType: 'O-', units: 1 },
  { id: 'd3', date: '2025-08-19', hospitalName: 'Hôpital Général de Douala', bloodType: 'O-', units: 1 },
];
