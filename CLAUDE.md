# CLAUDE.md - Give Protocol Web App

Give Protocol Web App - Progressive Web Application for blockchain-based charitable giving, built with React, TypeScript, and Vite. Part of the Give Protocol distributed repository architecture.

## Repository Structure

This is the **webapp** repository, one of four Give Protocol repositories:

- **give-protocol-webapp** (this repo): React/Vite Progressive Web App
- **give-protocol-contracts**: Solidity smart contracts and Hardhat infrastructure
- **give-protocol-docs**: Jekyll documentation site
- **give-protocol-backend**: Supabase backend and admin functions

## Essential Commands

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run lint         # Run ESLint
npm run build        # Production build (TypeScript + Vite)
npm run test         # Run Jest tests
npm run test:e2e     # Run Cypress end-to-end tests
```

## Architecture

- **Pages**: `/src/pages/` organized by feature (charity/, donor/, volunteer/, admin/)
- **Components**: `/src/components/` with feature-specific subdirectories
- **Hooks**: `/src/hooks/` including web3-specific hooks in `/src/hooks/web3/`
- **Contexts**: React Context for Auth, Web3, Settings, Toast
- **Smart Contracts**: See `give-protocol-contracts` repository

## Environment Setup

`.env` file required:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `VITE_MOONBASE_RPC_URL`

## CRITICAL: Code Quality Rules

### Top 10 DeepSource Violations (CI/CD Failures)

1. **JS-0356: Unused variables** - Prefix with `_` or use the variable

   ```typescript
   // WRONG
   const mockSpy = jest.spyOn(module, "method");

   // CORRECT
   const _mockSpy = jest.spyOn(module, "method");
   // OR use it
   expect(mockSpy).toHaveBeenCalled();
   ```

2. **JS-0323: `any` type** - Create proper TypeScript interfaces

   ```typescript
   // WRONG
   const props: any = { ... };

   // CORRECT
   interface Props { onClose: () => void; children: React.ReactNode; }
   ```

3. **JS-0417: Arrow functions in JSX props** - Creates new function every render

   ```typescript
   // WRONG
   <button onClick={() => handleClick(id)}>Click</button>
   <input onChange={(e) => setValue(e.target.value)} />

   // CORRECT - Always use useCallback
   const handleClick = useCallback((e: React.MouseEvent) => {
     const id = e.currentTarget.dataset.id;
     // handle click
   }, [dependencies]);
   <button data-id={id} onClick={handleClick}>Click</button>
   ```

4. **JS-0415: JSX nesting >4 levels** - Combine CSS classes to flatten

   ```typescript
   // WRONG - 5 levels: table > thead > tr > th > div
   <table><thead><tr><th><div className="flex">Content</div></th></tr></thead></table>

   // CORRECT - Apply classes directly (4 levels)
   <table><thead><tr><th className="flex">Content</th></tr></thead></table>
   ```

5. **JS-0359: `require()` statements** - Use ES6 imports

   ```typescript
   // WRONG
   const module = require("./module");

   // CORRECT
   import * as module from "./module";
   ```

6. **JS-0321: Empty functions** - Add explanatory comments

   ```typescript
   // WRONG
   jest.spyOn(obj, "method").mockImplementation(() => {});

   // CORRECT
   jest.spyOn(obj, "method").mockImplementation(() => {
     // Empty mock to prevent actual execution
   });
   ```

7. **JS-0339: Non-null assertions** - Add explicit checks

   ```typescript
   // WRONG
   const timestamp = block!.timestamp;

   // CORRECT
   if (!block) throw new Error("Could not get latest block");
   const timestamp = block.timestamp;
   ```

8. **JS-0437: Array index as React key** - Use stable IDs

   ```typescript
   // WRONG
   {items.map((item, index) => <Item key={index} />)}

   // CORRECT
   {items.map((item) => <Item key={item.id} />)}
   ```

9. **JS-0246: String concatenation** - Use template literals

   ```typescript
   // WRONG
   url = "/" + url;

   // CORRECT
   url = `/${url}`;
   ```

10. **JS-0066: `!!` type coercion** - Use explicit conversion

    ```typescript
    // WRONG
    const isConnected = !!address;

    // CORRECT
    const isConnected = Boolean(address);
    ```

11. **React Context Provider values must be memoized** - Wrap in useMemo

    ```typescript
    // WRONG - Creates new object every render
    <MyContext.Provider value={{ foo, bar }}>
      {children}
    </MyContext.Provider>

    // CORRECT - Memoized with useMemo
    const contextValue = React.useMemo(
      () => ({ foo, bar }),
      [foo, bar]
    );
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
    ```

12. **Use Number static methods** - Prefer explicit Number methods

    ```typescript
    // WRONG - Global functions
    const num = parseFloat("3.14");
    const int = parseInt("42", 10);
    const invalid = isNaN(value);

    // CORRECT - Number static methods
    const num = Number.parseFloat("3.14");
    const int = Number.parseInt("42", 10);
    const invalid = Number.isNaN(value);
    ```

### Security Patterns

**HTML Sanitization (CodeQL js/incomplete-multi-character-sanitization)**

```typescript
// WRONG - Vulnerable to incomplete sanitization
const sanitized = input.replace(/<[^>]*>/g, "");

// CORRECT - Remove individual HTML characters
const sanitized = input.replace(/[<>]/g, "");
```

### React-Specific Rules

- **Always import React when using JSX**
- **Use `import type` for type-only imports**
- **Export functions need JSDoc** with `@param` and `@returns`
- **Use `useCallback` for ALL functions passed to JSX props**
- **Flatten JSX to ≤4 levels by combining CSS classes**
- **ALWAYS wrap Context Provider values in `useMemo`** to maintain stable identities
- **Use explicit boolean checks in conditional rendering** (e.g., `value !== undefined` instead of `value`)

### Additional Important Rules

- **JS-0320**: Use destructuring instead of `delete` operator
- **JS-0054**: Wrap switch case bodies in braces for `const`/`let`
- **JS-0327**: Don't use classes as namespaces - use `const` objects
- **JS-C1003**: Avoid wildcard imports except for non-ES modules
- **JS-0357**: Define functions before using them in `useCallback`
- **JS-0099**: No TODO/FIXME/XXX comments in production code
- **JS-0052**: Replace `alert`/`confirm`/`prompt` with custom modals
- **JS-0242**: Always use `const` for never-reassigned variables

## Pre-Commit Checklist

- [ ] Run `npm run lint` and fix ALL errors
- [ ] Run `npm test -- --coverage` and ensure new code has tests
- [ ] No `any` types
- [ ] All variables used or prefixed with `_`
- [ ] Only ES6 imports
- [ ] All JSX event handlers wrapped in `useCallback`
- [ ] JSX nesting ≤4 levels
- [ ] Template literals instead of string concatenation
- [ ] `Boolean()` instead of `!!`
- [ ] `Number.parseFloat()` / `Number.parseInt()` instead of global functions
- [ ] Context Provider values wrapped in `useMemo`
- [ ] Explicit boolean checks in conditional rendering (`value !== undefined` not `value`)
- [ ] Write tests for all new utility functions and business logic
- [ ] Ensure test coverage is generated before committing

## JSX Nesting Verification

```bash
# Find potential deep nesting violations
rg "<th.*>\s*<div" src/ --type tsx  # Table headers with wrapper divs
rg "<Card.*>[\s\S]*?<div.*>[\s\S]*?<div.*>[\s\S]*?<div" src/ --type tsx  # Deep card nesting
```

## Session-Learned Pitfalls

1. **Task Agent Verification**: Always verify agent claims with `git diff` or `npm run lint`
2. **Component Extraction Anti-Pattern**: ALWAYS memoize callbacks BEFORE extracting components to avoid creating more violations
3. **React Import Consistency**: Keep `import React from 'react'` when using JSX
4. **useCallback Dependencies**: Only include dependencies that exist in scope
5. **Promise Misuse**: `await` Promise-returning methods in conditions
6. **Array.reduce() Safety**: Always provide initial value

## Testing Requirements

### Why Tests Are Required

SonarCloud requires test coverage on all new code. Without tests, builds will fail with "Coverage on New Code: 0.0%" errors.

### When to Write Tests

**ALWAYS write tests for:**
- New utility functions (`src/utils/`)
- New business logic
- New validation functions
- New formatting/parsing functions
- New services and API integrations

**Test file naming:**
- Place tests next to the source file: `foo.ts` → `foo.test.ts`
- Use descriptive test names: `it('should format USD currency correctly')`

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test src/utils/formatters.test.ts

# Run tests in watch mode during development
npm test -- --watch
```

### Test Coverage Requirements

- All new utility functions must have tests
- Aim for >80% coverage on new code
- Tests run automatically in CI/CD before SonarQube scan
- Coverage reports are generated in `coverage/` directory

### Example Test Structure

```typescript
describe('myFunction', () => {
  it('should handle valid input', () => {
    expect(myFunction('valid')).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('default');
    expect(myFunction(null)).toBe('default');
  });

  it('should throw on invalid input', () => {
    expect(() => myFunction('invalid')).toThrow();
  });
});
```

## Git Workflow

1. Run `npm run lint` before committing
2. Run `npm test -- --coverage` before committing
3. Write descriptive commit messages
4. Keep commits focused on single logical changes
5. Group related DeepSource fixes in single commits
6. Ensure tests exist for all new business logic
