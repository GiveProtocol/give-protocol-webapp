/**
 * ESLint configuration for test files
 * 
 * CRITICAL RULES TO PREVENT CI/CD FAILURES:
 * - no-explicit-any: Prevents 'any' type usage (DeepSource JS-0323)
 * - no-unused-vars: Prevents unused variables (DeepSource JS-0356)  
 * - no-undef: Prevents undefined variables like missing React import
 * - require-jsdoc: Prevents missing documentation (DeepSource JS-D1001)
 */

module.exports = {
  extends: ['./.eslintrc.js'],
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/test-utils/**/*'],
      rules: {
        // CRITICAL: Prevent 'any' type usage (DeepSource JS-0323)
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        
        // CRITICAL: Prevent unused variables (DeepSource JS-0356)
        '@typescript-eslint/no-unused-vars': ['error', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }],
        'no-unused-vars': 'off', // Turn off base rule as we use TypeScript version
        
        // CRITICAL: Prevent undefined variables (e.g., missing React import)
        'no-undef': 'error',
        
        // CRITICAL: Require JSDoc comments (DeepSource JS-D1001)
        'jsdoc/require-jsdoc': ['warn', {
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ClassExpression: true
          },
          contexts: [
            'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
            'ExportDefaultDeclaration > ArrowFunctionExpression'
          ]
        }],
        
        // CRITICAL: Enforce consistent type imports
        '@typescript-eslint/consistent-type-imports': ['error', {
          prefer: 'type-imports',
          disallowTypeAnnotations: true
        }],
        
        // CRITICAL: Prevent require() statements (DeepSource JS-0359)
        '@typescript-eslint/no-var-requires': 'error',
        
        // CRITICAL: Prevent empty functions without comments (DeepSource JS-0321)
        '@typescript-eslint/no-empty-function': ['warn', {
          allow: ['arrowFunctions'] // Allow but warn, should have comments
        }]
      }
    }
  ]
};