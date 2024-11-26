import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: ['**.cjs'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
      },
    },
    plugins: {
      'import-plugin': importPlugin,
      react: react,
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettier
);
