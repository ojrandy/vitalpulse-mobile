/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'tests/rules',
  testMatch: ['**/*.test.ts'],
  // The Firestore emulator's first rules-compile + connection on a cold
  // start can exceed Jest's 5s default hook timeout, especially on first
  // run before the JVM/emulator jar is warm.
  testTimeout: 30000,
};
