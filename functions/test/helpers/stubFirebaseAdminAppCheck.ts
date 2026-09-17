/**
 * Same rationale as stubFirebaseAdminAuth.ts — firebase-functions/v2/https
 * unconditionally requires firebase-admin/app-check internally (for its
 * `enforceAppCheck` option), which pulls in the same jose (ESM) chain.
 * Nothing in this project's Cloud Functions uses App Check yet.
 */
export function getAppCheck() {
  return {
    verifyToken: async () => ({ appId: 'stub' }),
  };
}
