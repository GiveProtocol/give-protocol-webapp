# Test Code Guidelines

This document outlines best practices for writing test code in the Duration project to prevent common issues caught by DeepSource and other static analysis tools.

## TypeScript Best Practices

### 1. Never Use `any` Type
```typescript
// ❌ Bad
const mockData: any = { id: '123' };
jest.mock('@/components/Modal', () => ({
  Modal: ({ onClose }: any) => <div onClick={onClose}>Modal</div>
}));

// ✅ Good
const mockData: MockUser = { id: '123', email: 'test@example.com' };
jest.mock('@/components/Modal', () => ({
  Modal: ({ onClose }: { onClose: () => void }) => <div onClick={onClose}>Modal</div>
}));
```

### 2. Define Proper Types for All Mock Functions
```typescript
// ❌ Bad
export const createMockClient = (overrides: any = {}) => ({ ... });

// ✅ Good
interface MockClientOverrides {
  data?: unknown;
  error?: Error | null;
}
export const createMockClient = (overrides: MockClientOverrides = {}) => ({ ... });
```

### 3. Use Type Imports
```typescript
// ❌ Bad
import { User, Profile } from './types';

// ✅ Good
import type { User, Profile } from './types';
```

## Code Quality Practices

### 1. Handle Unused Variables
```typescript
// ❌ Bad
routes.forEach(({ path, testId, name }) => {
  // testId is extracted but never used
  expect(screen.getByText(name)).toBeInTheDocument();
});

// ✅ Good - Option 1: Use the variable
routes.forEach(({ path, testId, name }) => {
  expect(screen.getByTestId(testId)).toBeInTheDocument();
});

// ✅ Good - Option 2: Prefix with underscore
routes.forEach(({ path, testId: _testId, name }) => {
  expect(screen.getByText(name)).toBeInTheDocument();
});

// ✅ Good - Option 3: Don't extract it
routes.forEach(({ path, name }) => {
  expect(screen.getByText(name)).toBeInTheDocument();
});
```

### 2. Document Public Functions
```typescript
// ❌ Bad
export const setupMocks = (config?: Config) => {
  // implementation
};

// ✅ Good
/**
 * Sets up common mocks for testing
 * @param config - Optional configuration for mock behavior
 * @returns void
 */
export const setupMocks = (config?: Config): void => {
  // implementation
};
```

## Common Patterns to Use

### 1. Create Typed Mock Utilities
```typescript
// In test-utils/types.ts
export interface MockComponentProps {
  onClose?: () => void;
  children?: React.ReactNode;
  [key: string]: unknown;
}

// In your test
jest.mock('@/components/Modal', () => ({
  Modal: ({ onClose, children }: MockComponentProps) => (
    <div onClick={onClose}>{children}</div>
  )
}));
```

### 2. Use Shared Mock Creation Functions
```typescript
// In test-utils/mocks.ts
/**
 * Creates a mock user object for testing
 * @param overrides - Partial user properties to override defaults
 * @returns Complete mock user object
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-123',
  email: 'test@example.com',
  role: 'donor',
  ...overrides
});
```

## ⚠️ CRITICAL: DeepSource Error Prevention

### MANDATORY Checks Before Writing ANY Test Code:

1. **No `any` types** (JS-0323 - Critical) - WILL cause failures
2. **No `require()` statements** (JS-0359 - Major) - Use `import` instead
3. **No unused variables** (JS-0356 - Major) - Remove or prefix with `_`
4. **All exported functions documented** (JS-D1001) - Add JSDoc comments
5. **React imported when using JSX** - Prevents "React is not defined" errors

### CRITICAL: Handling Unused Variables in Tests

```typescript
// ❌ WRONG - DeepSource JS-0356
const spy1 = jest.spyOn(module, 'method1');
const spy2 = jest.spyOn(module, 'method2');
const spy3 = jest.spyOn(module, 'method3');
// Only spy1 is used in assertions

// ✅ CORRECT - Option 1: Use all spies
const spy1 = jest.spyOn(module, 'method1');
const spy2 = jest.spyOn(module, 'method2');
const spy3 = jest.spyOn(module, 'method3');
expect(spy1).toHaveBeenCalled();
expect(spy2).toHaveBeenCalled();
expect(spy3).toHaveBeenCalled();

// ✅ CORRECT - Option 2: Prefix unused with underscore
const spy1 = jest.spyOn(module, 'method1');
const _spy2 = jest.spyOn(module, 'method2');
const _spy3 = jest.spyOn(module, 'method3');
expect(spy1).toHaveBeenCalled();

// ✅ CORRECT - Option 3: Only create what you need
const spy1 = jest.spyOn(module, 'method1');
expect(spy1).toHaveBeenCalled();
```

### CRITICAL: Empty Functions in Tests (JS-0321)

```typescript
// ❌ WRONG - DeepSource JS-0321
jest.spyOn(module, 'method').mockImplementation(() => {});
beforeEach(() => {});
array.map(() => {});

// ✅ CORRECT - Add comment explaining purpose
jest.spyOn(module, 'method').mockImplementation(() => {
  // Empty mock to prevent actual function execution
});

beforeEach(() => {
  // No setup needed for this test suite
});

array.map(() => {
  // Transform handled by external processor
});

// ✅ CORRECT - Use jest.fn() for simple empty mocks
jest.spyOn(module, 'method').mockImplementation(jest.fn());

// ✅ CORRECT - Return undefined explicitly if needed
array.map(() => undefined);
```

### Quick Error Fixes:
```typescript
// ❌ DeepSource JS-0323
jest.mock('@/component', () => ({ Component: (props: any) => ... }));

// ✅ Correct
jest.mock('@/component', () => ({ 
  Component: ({ onClose }: { onClose: () => void }) => ... 
}));

// ❌ DeepSource JS-0359  
const spy = jest.spyOn(require('./module'), 'func');

// ✅ Correct
import * as module from './module';
const spy = jest.spyOn(module, 'func');

// ❌ DeepSource JS-0356
const { path, testId, name } = route; // testId unused

// ✅ Correct
const { path, testId: _testId, name } = route;
```

## Pre-commit Checklist

Before committing test code, ensure:

1. ✅ No `any` types used (run: `grep -r ": any" src/**/*.test.*`)
2. ✅ All exported functions have JSDoc comments
3. ✅ No unused variables (check ESLint warnings)
4. ✅ All mock props are properly typed
5. ✅ Type imports use `import type` syntax
6. ✅ No `require()` statements (use `import` instead)
7. ✅ React imported when creating JSX elements

## Running Checks Locally

```bash
# Run ESLint on test files
npm run lint -- --ext .test.ts,.test.tsx

# Run TypeScript compiler
npm run typecheck

# Check for any types
grep -r ": any" src/**/*.test.* src/test-utils/**/*
```

## Automated Prevention

These issues are prevented by:
- ESLint configuration (`.eslintrc.test.js`)
- TypeScript strict mode
- Pre-commit hooks (if configured)
- CI/CD pipeline checks