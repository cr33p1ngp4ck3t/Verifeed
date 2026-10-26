import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'artifacts/**', 'coverage/**', 'test-results/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { ecmaVersion: 2022 },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }] },
  },
  { files: ['server/**', 'scripts/**', 'tests/**', 'eslint.config.js'], languageOptions: { globals: globals.node } },
  { files: ['web/**', 'extension/**', 'tests/**', 'scripts/generate-visual-assets.mjs'], languageOptions: { globals: { ...globals.browser, chrome: 'readonly' } } },
  {
    files: ['extension/**', 'web/app.js'],
    languageOptions: { globals: { NovaRules: 'readonly', NovaAdapters: 'readonly', VerifeedWriting: 'readonly', VerifeedWebsite: 'readonly', VerifeedPanel: 'readonly' } },
  },
];
