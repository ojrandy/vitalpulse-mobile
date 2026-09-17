const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['lib/**', 'node_modules/**'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // eslint.config.js itself is CommonJS, and the test files deliberately
    // use require() after jest.mock() calls — ts-jest doesn't hoist
    // jest.mock the way babel-jest does, so requiring the module under test
    // after the mock registrations is the correct pattern here, not an
    // import to fix.
    files: ['eslint.config.js', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
