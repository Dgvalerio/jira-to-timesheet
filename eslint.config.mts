import dgvalerio from '@dgvalerio/eslint-config';

import pluginCypress from 'eslint-plugin-cypress';
import pluginImport from 'eslint-plugin-import';
import type { ConfigArray } from 'typescript-eslint';

export default [
  ...dgvalerio.configs.recommended.common,
  {
    ignores: ['dist/', 'node_modules/', '.next/', 'next-env.d.ts'],
  },
  {
    files: ['src/backup/*', 'src/generated/*', 'cypress.config.ts'],
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
  // {
  //   files: ['src/main/transactions.ts', 'src/main/01.ts'],
  //   rules: {
  //     'prettier/prettier': [
  //       'error',
  //       {
  //         tabWidth: 2,
  //         printWidth: 1024,
  //         arrowParens: 'always',
  //         endOfLine: 'lf',
  //         singleQuote: true,
  //         trailingComma: 'es5',
  //       },
  //     ],
  //   },
  // },
  {
    plugins: { cypress: pluginCypress },
    rules: { 'cypress/unsafe-to-chain-command': 'error' },
  },

  {
    ...pluginCypress.configs.globals,
    files: ['cypress/**/*.ts', '**/*.cy.ts'],
  },
  {
    ...pluginCypress.configs.recommended,
    files: ['cypress/**/*.ts', '**/*.cy.ts'],
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
