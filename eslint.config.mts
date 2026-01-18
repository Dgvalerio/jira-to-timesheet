import dgvalerio from '@dgvalerio/eslint-config';

import pluginImport from 'eslint-plugin-import';
import type { ConfigArray } from 'typescript-eslint';

export default [
  ...dgvalerio.configs.recommended.common,
  {
    ignores: ['dist/', 'node_modules/', '.next/', 'next-env.d.ts'],
  },
  {
    files: ['src/backup/*', 'src/generated/*'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['**/*.mjs'],
    rules: {
      'no-restricted-imports': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    plugins: { import: pluginImport },
    rules: { 'import/no-duplicates': 'error' },
  },
  {
    rules: {
      'no-console': 'off',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },
] as ConfigArray;
