const expoConfig = require('eslint-config-expo/flat');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  expoConfig,
  {
    // functions/ and packages/* are plain Node/TS workspaces, each with its
    // own eslint.config.js (no React Native/Expo rules apply there) — run
    // their lint via their own `npm run lint`, not this root config.
    ignores: ['dist/*', 'node_modules/*', 'functions/**', 'packages/**'],
  },
]);
