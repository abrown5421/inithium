import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    // A test kit is test code itself, so it may build on the other kits.
    files: ['**/*.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
];
