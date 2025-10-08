# CLAUDE.md

Duration is a blockchain-based charitable giving platform built with React, TypeScript, and Solidity smart contracts targeting the Moonbeam Network.

## Essential Commands

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run lint         # Run ESLint
npm run build        # Production build (TypeScript + Vite)
npm run compile      # Compile Solidity contracts
npm run test         # Run Hardhat tests
```

## Architecture

- **Pages**: `/src/pages/` organized by feature (charity/, donor/, volunteer/, admin/)
- **Components**: `/src/components/` with feature-specific subdirectories
- **Hooks**: `/src/hooks/` including web3-specific hooks in `/src/hooks/web3/`
- **Contexts**: React Context for Auth, Web3, Settings, Toast
- **Smart Contracts**: `/contracts/` - DurationDonation, CharityScheduledDistribution, VolunteerVerification, DistributionExecutor

## Environment Setup

`.env` file required:
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `VITE_MOONBASE_RPC_URL`
- Private keys for deployment (never commit!)

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
- [ ] No `any` types
- [ ] All variables used or prefixed with `_`
- [ ] Only ES6 imports
- [ ] All JSX event handlers wrapped in `useCallback`
- [ ] JSX nesting ≤4 levels
- [ ] Template literals instead of string concatenation
- [ ] `Boolean()` instead of `!!`

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

## Git Workflow

1. Run `npm run lint` before committing
2. Write descriptive commit messages
3. Keep commits focused on single logical changes
4. Group related DeepSource fixes in single commits