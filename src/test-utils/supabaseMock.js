// Mock Supabase client for Jest ESM testing
// This module is mapped via moduleNameMapper to intercept @/lib/supabase imports

import { jest } from '@jest/globals';

// Global state to control mock responses per test
let mockState = {
  fromResults: new Map(), // Map of table name -> result
  defaultResult: { data: [], error: null },
};

// Helper to set mock response for a table
export const setMockResult = (tableName, result) => {
  mockState.fromResults.set(tableName, result);
};

// Helper to set default result
export const setDefaultMockResult = (result) => {
  mockState.defaultResult = result;
};

// Helper to reset all mock state
export const resetMockState = () => {
  mockState = {
    fromResults: new Map(),
    defaultResult: { data: [], error: null },
  };
};

// Create chainable query builder with configurable results
const createQueryBuilder = (tableName) => {
  // Get the result for this table or use default
  const getResult = () => mockState.fromResults.get(tableName) || mockState.defaultResult;

  const builder = {
    select: jest.fn(function() { return this; }),
    insert: jest.fn(function() { return this; }),
    update: jest.fn(function() { return this; }),
    delete: jest.fn(function() { return this; }),
    upsert: jest.fn(function() { return this; }),
    eq: jest.fn(function() { return this; }),
    neq: jest.fn(function() { return this; }),
    gt: jest.fn(function() { return this; }),
    gte: jest.fn(function() { return this; }),
    lt: jest.fn(function() { return this; }),
    lte: jest.fn(function() { return this; }),
    like: jest.fn(function() { return this; }),
    ilike: jest.fn(function() { return this; }),
    is: jest.fn(function() { return this; }),
    in: jest.fn(function() { return this; }),
    or: jest.fn(function() { return this; }),
    and: jest.fn(function() { return this; }),
    not: jest.fn(function() { return this; }),
    contains: jest.fn(function() { return this; }),
    containedBy: jest.fn(function() { return this; }),
    range: jest.fn(function() { return this; }),
    order: jest.fn(function() { return this; }),
    limit: jest.fn(function() { return this; }),
    offset: jest.fn(function() { return this; }),
    single: jest.fn(() => Promise.resolve(getResult())),
    maybeSingle: jest.fn(() => Promise.resolve(getResult())),
    // Make the builder thenable for await - always resolve, let caller check for error
    then: (resolve) => {
      resolve(getResult());
    },
    catch: () => {
      // No-op - errors are returned in result, not thrown
    },
  };

  return builder;
};

// Create the mock from function
const mockFrom = jest.fn((tableName) => createQueryBuilder(tableName));

// Create the mock supabase client
export const supabase = {
  from: mockFrom,
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    signInWithOAuth: jest.fn().mockResolvedValue({ data: null, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://mock-url.com' } })),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    unsubscribe: jest.fn(),
  })),
  removeChannel: jest.fn(),
};

// Export helpers for tests
export const supabaseHelpers = {
  getCurrentUser: jest.fn().mockResolvedValue(null),
  signOut: jest.fn().mockResolvedValue(undefined),
  refreshSession: jest.fn().mockResolvedValue({ session: null, user: null }),
  handleError: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
};

export default supabase;
