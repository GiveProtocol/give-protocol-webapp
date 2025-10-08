/**
 * Shared Supabase mock utilities to reduce duplication across test files
 */

import { jest } from '@jest/globals';
import type { MockSupabaseQuery, MockSupabaseOverrides, MockCharity, MockDonation } from './types';

/**
 * Creates a mock Supabase query response object
 * @param data - The data to return in the query response (can be array, single item, or null)
 * @param error - Optional error object with message property
 * @returns Mock query response object matching Supabase's response format
 */
export const createMockSupabaseQuery = <T = unknown>(
  data: T[] | T | null = [], 
  error: { message: string } | null = null
): MockSupabaseQuery<T> => ({
  data,
  error
});

/**
 * Creates the eq chain for select operations
 */
const createSelectEqChain = (overrides: MockSupabaseOverrides) => ({
  eq: jest.fn(() => Promise.resolve(createMockSupabaseQuery([], null))),
  single: jest.fn(() => Promise.resolve(createMockSupabaseQuery(null, null))),
  order: jest.fn(() => Promise.resolve(createMockSupabaseQuery([], null))),
  in: jest.fn(() => ({
    order: jest.fn(() => Promise.resolve(createMockSupabaseQuery([], null))),
  })),
  ...overrides.selectEq
});

/**
 * Creates the select chain for table operations
 */
const createSelectChain = (overrides: MockSupabaseOverrides) => ({
  eq: jest.fn(() => createSelectEqChain(overrides)),
  order: jest.fn(() => Promise.resolve(createMockSupabaseQuery([], null))),
  single: jest.fn(() => Promise.resolve(createMockSupabaseQuery(null, null))),
  ...overrides.select
});

/**
 * Creates the insert chain for table operations
 */
const createInsertChain = (overrides: MockSupabaseOverrides) => ({
  select: jest.fn(() => Promise.resolve(createMockSupabaseQuery([], null))),
  single: jest.fn(() => Promise.resolve(createMockSupabaseQuery(null, null))),
  ...overrides.insert
});

/**
 * Creates the update chain for table operations
 */
const createUpdateChain = (overrides: MockSupabaseOverrides) => ({
  eq: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve(createMockSupabaseQuery([], null))),
    ...overrides.updateEq
  })),
  ...overrides.update
});

/**
 * Creates the delete chain for table operations
 */
const createDeleteChain = (overrides: MockSupabaseOverrides) => ({
  eq: jest.fn(() => Promise.resolve(createMockSupabaseQuery([], null))),
  ...overrides.deleteEq
});

/**
 * Creates the table operations object
 */
const createTableOperations = (overrides: MockSupabaseOverrides) => ({
  select: jest.fn(() => createSelectChain(overrides)),
  insert: jest.fn(() => createInsertChain(overrides)),
  update: jest.fn(() => createUpdateChain(overrides)),
  delete: jest.fn(() => createDeleteChain(overrides)),
  ...overrides.from
});

/**
 * Creates a mock Supabase client with customizable method overrides
 * @param overrides - Optional overrides for specific Supabase methods
 * @returns Mock Supabase client object with jest functions
 */
export const createMockSupabaseClient = (overrides: MockSupabaseOverrides = {}) => ({
  from: jest.fn(() => createTableOperations(overrides)),
  ...overrides.client
});

/**
 * Sets up Jest mocks for Supabase with optional custom data responses
 * @param customData - Optional custom data responses for different tables
 */
export const setupSupabaseMocks = (customData?: MockSupabaseOverrides) => {
  jest.mock('@/lib/supabase', () => ({
    supabase: createMockSupabaseClient(customData)
  }));
};

export const mockCharityData: MockCharity[] = [
  {
    id: 'charity-1',
    name: 'Test Charity 1',
    description: 'A test charity',
    category: 'education',
    country: 'US',
    verified: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'charity-2', 
    name: 'Test Charity 2',
    description: 'Another test charity',
    category: 'healthcare',
    country: 'CA',
    verified: false,
    created_at: '2024-01-02T00:00:00Z'
  }
];

export const mockDonationData: MockDonation[] = [
  {
    id: 'donation-1',
    amount: '100.00',
    donor_id: 'donor-1',
    charity_id: 'charity-1',
    status: 'completed',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'donation-2',
    amount: '250.00', 
    donor_id: 'donor-2',
    charity_id: 'charity-2',
    status: 'pending',
    created_at: '2024-01-02T00:00:00Z'
  }
];

export const mockVolunteerData = [
  {
    id: 'volunteer-1',
    user_id: 'user-1',
    charity_id: 'charity-1',
    hours: 10,
    status: 'verified',
    created_at: '2024-01-01T00:00:00Z'
  }
];