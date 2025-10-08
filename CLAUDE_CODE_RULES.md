# Claude Code - Critical Rules & Quick Reference

> **This file contains mandatory rules that MUST be followed in every Claude Code session to prevent CI/CD failures and maintain code quality.**

## 🚨 BEFORE WRITING ANY CODE - CHECK THIS LIST

### ❌ NEVER DO (These WILL cause failures):

1. **`any` type** → Define proper interfaces
2. **`require()`** → Use `import` statements  
3. **Unused variables** → Remove or prefix with `_`
4. **Missing JSDoc** → Document all exported functions
5. **Missing React import** → Add when using JSX

### 🔴 CRITICAL: Unused Variables (JS-0356)

**ALWAYS check for unused variables before committing:**

```typescript
// ❌ BAD - Will be flagged by DeepSource
const setupMockSpy = jest.spyOn(module, 'setup');
// setupMockSpy is never used after assignment

// ✅ GOOD - Prefix with underscore if intentionally unused
const _setupMockSpy = jest.spyOn(module, 'setup');

// ✅ GOOD - Use the variable
const setupMockSpy = jest.spyOn(module, 'setup');
expect(setupMockSpy).toHaveBeenCalled();

// ✅ GOOD - Remove if truly not needed
// Simply don't create the variable if you won't use it
```

### 🔴 CRITICAL: Empty Functions (JS-0321)

**NEVER leave empty function bodies without comments:**

```typescript
// ❌ BAD - Will be flagged by DeepSource
jest.spyOn(module, 'method').mockImplementation(() => {});
array.forEach(() => {});

// ✅ GOOD - Add comment explaining why it's empty
jest.spyOn(module, 'method').mockImplementation(() => {
  // Empty mock to prevent actual execution
});

array.forEach(() => {
  // No-op: side effects handled elsewhere
});

// ✅ GOOD - Use jest.fn() for simple mocks
jest.spyOn(module, 'method').mockImplementation(jest.fn());
```

### ✅ MANDATORY Code Template:

```typescript
import React from 'react'; // When using JSX
import type { SomeType } from './types'; // Type-only imports

/**
 * Brief description of what this function does
 * @param param - Description of parameter
 * @returns Description of return value
 */
export const myFunction = (param: SpecificType): ReturnType => {
  // Implementation
};

// For Jest mocks:
jest.mock('@/component', () => ({
  Component: ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
    <div onClick={onClose}>{children}</div>
  )
}));
```

## 🔍 Pre-Commit Checklist

- [ ] Run `npm run lint` and fix ALL errors
- [ ] No `any` types anywhere
- [ ] All imports are ES6 style
- [ ] All exported functions have JSDoc
- [ ] React imported when JSX is used
- [ ] All variables are used or prefixed with `_`

## 📁 File Reference Patterns

### Test Files Location
- Component tests: `src/components/**/__tests__/*.test.tsx`
- Utility tests: `src/test-utils/__tests__/*.test.ts`
- Page tests: `src/pages/**/__tests__/*.test.tsx`

### Shared Test Utilities
- Mock creation: `src/test-utils/mockSetup.tsx`
- Type definitions: `src/test-utils/types.ts`
- Auth helpers: `src/test-utils/authTestHelpers.ts`
- Route mocks: `src/test-utils/routeMocks.ts`
- Supabase mocks: `src/test-utils/supabaseMocks.ts`

## 🎯 Common Error Fixes

| Error Code | Issue | Fix |
|------------|-------|-----|
| JS-0323 | `any` type usage | Define explicit interface |
| JS-0356 | Unused variables | Remove or prefix with `_` |
| JS-0359 | `require()` statements | Use `import` instead |
| JS-D1001 | Missing JSDoc | Add `/** */` comments |
| no-undef | React not defined | Add `import React` |

## 🚨 Common Test Anti-Patterns to AVOID

### Empty Mock Implementations
```typescript
// ❌ NEVER DO THIS
const spy = jest.spyOn(obj, 'method').mockImplementation(() => {});

// ✅ ALWAYS DO THIS
const spy = jest.spyOn(obj, 'method').mockImplementation(() => {
  // Empty mock to prevent actual execution
});

// ✅ OR THIS (for truly empty mocks)
const spy = jest.spyOn(obj, 'method').mockImplementation(jest.fn());
```

### Unused Test Variables
```typescript
// ❌ NEVER DO THIS
const spy1 = jest.spyOn(obj, 'method1');
const spy2 = jest.spyOn(obj, 'method2'); // Never used

// ✅ ALWAYS DO THIS
const spy1 = jest.spyOn(obj, 'method1');
const _spy2 = jest.spyOn(obj, 'method2'); // Prefix with _ if intentionally unused
```

## 📋 Test Utility Patterns

### Mock Component Pattern:
```typescript
jest.mock('@/components/Modal', () => ({
  Modal: ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
    <div onClick={onClose}>{children}</div>
  )
}));
```

### Mock Hook Pattern:
```typescript
const mockUseHook = useHook as jest.MockedFunction<typeof useHook>;
mockUseHook.mockReturnValue({
  data: mockData,
  loading: false,
  error: null
});
```

### Unused Variable Patterns:
```typescript
// ✅ Use the variable
routes.forEach(({ path, testId, name }) => {
  expect(screen.getByTestId(testId)).toBeInTheDocument();
});

// ✅ Prefix unused with _
routes.forEach(({ path, testId: _testId, name }) => {
  expect(screen.getByText(name)).toBeInTheDocument();
});

// ✅ Don't extract unused variables
routes.forEach(({ path, name }) => {
  expect(screen.getByText(name)).toBeInTheDocument();
});
```

---

**Remember: These rules prevent the recurring issues we've seen in every session. Following them saves time and prevents CI/CD failures.**