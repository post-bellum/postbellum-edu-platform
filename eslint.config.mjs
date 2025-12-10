import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  // Custom rules for code style consistency
  {
    rules: {
      // Single quotes for JS strings, double quotes for JSX attributes
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'jsx-quotes': ['error', 'prefer-double'],
      
      // Disallow console.log/error/warn - use logger utility instead
      // Allow console.info and console.debug for development
      'no-console': ['warn', { allow: ['info', 'debug'] }],
      
      // Note: React import style (prefer `import * as React from 'react'`)
      // is enforced via code review and documented in .cursor/rules/components.md
      // ESLint's no-restricted-imports cannot reliably distinguish namespace imports
    },
  },
]);

export default eslintConfig;
