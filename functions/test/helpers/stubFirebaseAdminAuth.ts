/**
 * `firebase-admin/auth` pulls in `jwks-rsa` -> `jose`, which ships pure ESM
 * and isn't transformed by ts-jest — importing the real module (even
 * indirectly, since firebase-functions/v2/https loads it internally) breaks
 * every test file that touches `onCall`, not just the ones that actually
 * need auth. Mapped in via jest.config.js's moduleNameMapper for every
 * functions test; roles.test.ts overrides this with its own richer
 * jest.mock() for the assertions it needs.
 */
export function getAuth() {
  return {
    setCustomUserClaims: async () => undefined,
    revokeRefreshTokens: async () => undefined,
    getUser: async () => ({ customClaims: {} }),
  };
}
