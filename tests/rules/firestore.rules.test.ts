import { readFileSync } from 'fs';
import { join } from 'path';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Firestore rules test suite (docs/06TESTING.md §2) — required in the same
 * PR as any `firestore.rules` change (CLAUDE.md non-negotiable #10). Run
 * against the local emulator: `firebase emulators:exec "npm run test:rules"`.
 *
 * Covers every collection in docs/03DATAMODEL.md, every role × action, and
 * the hostile cases docs/06TESTING.md §2 names explicitly: cross-hospital
 * access, self-role-elevation, donor impersonation, and a claims-less
 * signed-in user (a brand-new account with no role granted yet) being
 * denied everywhere except what's explicitly granted. The double-accept
 * race on request approval is covered in functions/test/reviewRequest.test.ts
 * instead — `requests` is Cloud-Functions-only in rules, so there is no
 * rules-level path to exercise that race.
 */
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-vitalpulse-rules-test',
    firestore: {
      rules: readFileSync(join(__dirname, '../../firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

const DONOR_UID = 'donor-1';
const OTHER_DONOR_UID = 'donor-2';
const HOSPITAL_A_STAFF_UID = 'hosp-a-staff';
const HOSPITAL_B_STAFF_UID = 'hosp-b-staff';
const ADMIN_UID = 'admin-1';

function donorCtx() {
  return testEnv.authenticatedContext(DONOR_UID, { role: 'donor' });
}
function otherDonorCtx() {
  return testEnv.authenticatedContext(OTHER_DONOR_UID, { role: 'donor' });
}
function hospitalAStaffCtx() {
  return testEnv.authenticatedContext(HOSPITAL_A_STAFF_UID, { role: 'hospital_staff', hospitalId: 'hosp-a' });
}
function hospitalBStaffCtx() {
  return testEnv.authenticatedContext(HOSPITAL_B_STAFF_UID, { role: 'hospital_staff', hospitalId: 'hosp-b' });
}
function adminCtx() {
  return testEnv.authenticatedContext(ADMIN_UID, { role: 'system_admin' });
}
/** Claims-less signed-in user — the real default state of a brand-new account. */
function claimsLessCtx() {
  return testEnv.authenticatedContext('fresh-account', {});
}
function suspendedDonorCtx() {
  return testEnv.authenticatedContext('suspended-donor', { role: 'donor', suspended: true });
}

describe('users/{uid}', () => {
  test('a donor can create their own profile as role: donor, self-reported blood type', async () => {
    const db = donorCtx().firestore();
    await assertSucceeds(
      setDoc(doc(db, 'users', DONOR_UID), {
        role: 'donor',
        phone: '+237600000001',
        bloodType: 'O+',
        bloodTypeSource: 'self_reported',
        city: 'Douala',
      }),
    );
  });

  test('self-role-elevation on create is denied — cannot create own doc as system_admin', async () => {
    const db = donorCtx().firestore();
    await assertFails(
      setDoc(doc(db, 'users', DONOR_UID), {
        role: 'system_admin',
        phone: '+237600000001',
        bloodType: 'O+',
        bloodTypeSource: 'self_reported',
        city: 'Douala',
      }),
    );
  });

  test('cannot self-report lab_confirmed as the blood type source', async () => {
    const db = donorCtx().firestore();
    await assertFails(
      setDoc(doc(db, 'users', DONOR_UID), {
        role: 'donor',
        phone: '+237600000001',
        bloodType: 'O+',
        bloodTypeSource: 'lab_confirmed',
        city: 'Douala',
      }),
    );
  });

  test('donor impersonation is denied — cannot create a doc at another uid', async () => {
    const db = donorCtx().firestore();
    await assertFails(
      setDoc(doc(db, 'users', OTHER_DONOR_UID), {
        role: 'donor',
        phone: '+237600000002',
        bloodType: 'A+',
        bloodTypeSource: 'self_reported',
        city: 'Douala',
      }),
    );
  });

  test('owner can update client-writable fields (city, notificationPrefs)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', DONOR_UID), {
        role: 'donor',
        phone: '+237600000001',
        bloodType: 'O+',
        bloodTypeSource: 'self_reported',
        city: 'Douala',
        isVerified: false,
        isSuspended: false,
        points: 0,
      });
    });
    const db = donorCtx().firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'users', DONOR_UID), { city: 'Yaoundé', notificationPrefs: { whatsapp: true } }),
    );
  });

  test('owner cannot self-elevate role on update', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', DONOR_UID), {
        role: 'donor',
        bloodType: 'O+',
        bloodTypeSource: 'self_reported',
        isVerified: false,
        isSuspended: false,
        points: 0,
      });
    });
    const db = donorCtx().firestore();
    await assertFails(updateDoc(doc(db, 'users', DONOR_UID), { role: 'system_admin' }));
  });

  test('owner cannot self-verify or self-unsuspend', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', DONOR_UID), {
        role: 'donor',
        bloodType: 'O+',
        bloodTypeSource: 'self_reported',
        isVerified: false,
        isSuspended: true,
        points: 0,
      });
    });
    const db = donorCtx().firestore();
    await assertFails(updateDoc(doc(db, 'users', DONOR_UID), { isSuspended: false }));
  });

  test('another donor cannot read a stranger\'s profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', DONOR_UID), { role: 'donor', bloodType: 'O+' });
    });
    const db = otherDonorCtx().firestore();
    await assertFails(getDoc(doc(db, 'users', DONOR_UID)));
  });

  test('system_admin can read any user profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', DONOR_UID), { role: 'donor', bloodType: 'O+' });
    });
    const db = adminCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'users', DONOR_UID)));
  });

  test('a claims-less signed-in user can self-signup as a plain donor (no claim exists yet at that point)', async () => {
    const db = claimsLessCtx().firestore();
    await assertSucceeds(
      setDoc(doc(db, 'users', 'fresh-account'), {
        role: 'donor',
        phone: '+237600000099',
        bloodType: 'unknown',
        bloodTypeSource: 'unknown',
        city: 'Douala',
      }),
    );
  });

  test('a claims-less signed-in user is denied reading someone else\'s profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', DONOR_UID), { role: 'donor', bloodType: 'O+' });
    });
    const db = claimsLessCtx().firestore();
    await assertFails(getDoc(doc(db, 'users', DONOR_UID)));
  });
});

describe('requests/{id} — Cloud-Functions-only writes', () => {
  test('a donor cannot directly write a request doc', async () => {
    const db = donorCtx().firestore();
    await assertFails(
      setDoc(doc(db, 'requests', 'req-1'), {
        status: 'approved',
        submittedBy: DONOR_UID,
        bloodType: 'O+',
      }),
    );
  });

  test('a donor can read their own submitted request', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'requests', 'req-1'), {
        status: 'pending_review',
        submittedBy: DONOR_UID,
        bloodType: 'O+',
      });
    });
    const db = donorCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'requests', 'req-1')));
  });

  test('a different donor cannot read someone else\'s request', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'requests', 'req-1'), {
        status: 'pending_review',
        submittedBy: DONOR_UID,
        bloodType: 'O+',
      });
    });
    const db = otherDonorCtx().firestore();
    await assertFails(getDoc(doc(db, 'requests', 'req-1')));
  });

  test('cross-hospital read is denied — hospital B staff cannot read hospital A\'s request', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'requests', 'req-a'), {
        status: 'pending_review',
        submittedBy: HOSPITAL_A_STAFF_UID,
        hospitalId: 'hosp-a',
        bloodType: 'O+',
      });
    });
    const db = hospitalBStaffCtx().firestore();
    await assertFails(getDoc(doc(db, 'requests', 'req-a')));
  });

  test('own-hospital staff can read their hospital\'s request', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'requests', 'req-a'), {
        status: 'pending_review',
        submittedBy: HOSPITAL_A_STAFF_UID,
        hospitalId: 'hosp-a',
        bloodType: 'O+',
      });
    });
    const db = hospitalAStaffCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'requests', 'req-a')));
  });

  test('system_admin can read any request', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'requests', 'req-a'), {
        status: 'pending_review',
        submittedBy: HOSPITAL_A_STAFF_UID,
        hospitalId: 'hosp-a',
        bloodType: 'O+',
      });
    });
    const db = adminCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'requests', 'req-a')));
  });
});

describe('broadcasts/{id} — read-only for every authenticated role', () => {
  test('a donor can read a broadcast', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'broadcasts', 'b-1'), { bloodType: 'O+', city: 'Douala' });
    });
    const db = donorCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'broadcasts', 'b-1')));
  });

  test('a claims-less signed-in user cannot read a broadcast', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'broadcasts', 'b-1'), { bloodType: 'O+', city: 'Douala' });
    });
    const db = claimsLessCtx().firestore();
    await assertFails(getDoc(doc(db, 'broadcasts', 'b-1')));
  });

  test('no one can write a broadcast directly', async () => {
    const db = adminCtx().firestore();
    await assertFails(setDoc(doc(db, 'broadcasts', 'b-2'), { bloodType: 'O+' }));
  });
});

describe('inventory/{id} — hospital-internal, not donor-facing', () => {
  test('a donor cannot read hospital inventory', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'inventory', 'hosp-a_O+'), { hospitalId: 'hosp-a', bloodType: 'O+' });
    });
    const db = donorCtx().firestore();
    await assertFails(getDoc(doc(db, 'inventory', 'hosp-a_O+')));
  });

  test('cross-hospital inventory read is denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'inventory', 'hosp-a_O+'), { hospitalId: 'hosp-a', bloodType: 'O+' });
    });
    const db = hospitalBStaffCtx().firestore();
    await assertFails(getDoc(doc(db, 'inventory', 'hosp-a_O+')));
  });

  test('own-hospital staff can read their inventory', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'inventory', 'hosp-a_O+'), { hospitalId: 'hosp-a', bloodType: 'O+' });
    });
    const db = hospitalAStaffCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'inventory', 'hosp-a_O+')));
  });

  test('no one can write inventory directly', async () => {
    const db = hospitalAStaffCtx().firestore();
    await assertFails(setDoc(doc(db, 'inventory', 'hosp-a_O+'), { hospitalId: 'hosp-a', bloodType: 'O+' }));
  });
});

describe('auditLogs/{id} — system_admin read-only, no direct write for anyone', () => {
  test('system_admin can read audit logs', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'auditLogs', 'log-1'), { action: 'role_granted', actorUid: ADMIN_UID });
    });
    const db = adminCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'auditLogs', 'log-1')));
  });

  test('a hospital admin cannot read audit logs', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'auditLogs', 'log-1'), { action: 'role_granted', actorUid: ADMIN_UID });
    });
    const db = hospitalAStaffCtx().firestore();
    await assertFails(getDoc(doc(db, 'auditLogs', 'log-1')));
  });

  test('system_admin itself cannot write an audit log directly (writeAudit only)', async () => {
    const db = adminCtx().firestore();
    await assertFails(setDoc(doc(db, 'auditLogs', 'log-2'), { action: 'role_granted', actorUid: ADMIN_UID }));
  });
});

describe('suspended accounts', () => {
  // Own-profile read stays allowed regardless of suspension (the client
  // needs it to render a "your account is suspended" state), but every
  // role-gated collection must deny a suspended token — `hasRole()` checks
  // `!isSuspended()` before the role check on every one of them.
  test('a suspended donor can still read their own profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', 'suspended-donor'), { role: 'donor', bloodType: 'O+' });
    });
    const db = suspendedDonorCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'users', 'suspended-donor')));
  });

  test('a suspended donor is denied broadcasts read despite holding a valid donor role', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'broadcasts', 'b-1'), { bloodType: 'O+', city: 'Douala' });
    });
    const db = suspendedDonorCtx().firestore();
    await assertFails(getDoc(doc(db, 'broadcasts', 'b-1')));
  });
});
