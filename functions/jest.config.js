/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  // See test/helpers/stubFirebaseAdminAuth.ts — avoids pulling in the real
  // firebase-admin/auth -> jwks-rsa -> jose (ESM) chain in every test.
  moduleNameMapper: {
    '^firebase-admin/auth$': '<rootDir>/test/helpers/stubFirebaseAdminAuth.ts',
    '^firebase-admin/app-check$': '<rootDir>/test/helpers/stubFirebaseAdminAppCheck.ts',
  },
};
