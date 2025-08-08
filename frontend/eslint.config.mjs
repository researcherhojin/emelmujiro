import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import jestPlugin from 'eslint-plugin-jest';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  // Base configuration
  js.configs.recommended,
  
  // Global ignores
  {
    ignores: [
      'build/**',
      'node_modules/**',
      'coverage/**',
      'public/service-worker.js',
      'sitemap-generator.js',
      '*.config.js',
      '*.config.mjs',
      '.lighthouserc.js'
    ]
  },
  
  // Main configuration for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        React: 'readonly'
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': typescriptPlugin,
      'jsx-a11y': jsxA11yPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off',
      
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // React rules
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-vars': 'error',
      
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // JSX A11y rules
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn'
    }
  },
  
  // Test files configuration
  {
    files: ['**/__tests__/**/*', '**/*.test.*', '**/__mocks__/**/*', '**/*.spec.*'],
    plugins: {
      'testing-library': testingLibraryPlugin,
      jest: jestPlugin
    },
    languageOptions: {
      globals: {
        ...globals.jest,
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    rules: {
      // Relax rules for test files
      'testing-library/no-node-access': 'warn',
      'testing-library/no-container': 'warn',
      'testing-library/no-wait-for-multiple-assertions': 'warn',
      'testing-library/no-unnecessary-act': 'warn',
      'jest/no-conditional-expect': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'jsx-a11y/alt-text': 'warn',
      'no-console': 'off'
    }
  }
];