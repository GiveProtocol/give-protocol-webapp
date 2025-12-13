import { describe, it, expect, beforeEach } from '@jest/globals';
import { setMockResult, resetMockState } from '@/test-utils/supabaseMock';
import {
  searchOrganizations,
  getOrganizationById,
  getAllOrganizations,
  isVerifiedOrganization,
} from './organizationSearchService';

describe('organizationSearchService', () => {
  beforeEach(() => {
    resetMockState();
  });

  describe('searchOrganizations', () => {
    it('should return empty array for empty query', async () => {
      const result = await searchOrganizations('');
      expect(result).toEqual([]);
    });

    it('should return empty array for query less than 2 characters', async () => {
      const result = await searchOrganizations('a');
      expect(result).toEqual([]);
    });

    it('should search organizations with valid query', async () => {
      const mockData = [
        { id: '1', name: 'Test Org', type: 'charity', meta: { logoUrl: 'logo.png', location: 'NYC' } },
        { id: '2', name: 'Another Org', type: 'charity', meta: null },
      ];
      setMockResult('profiles', { data: mockData, error: null });

      const result = await searchOrganizations('test');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Test Org',
        isVerified: true,
        location: 'NYC',
        logoUrl: 'logo.png',
      });
      expect(result[1]).toEqual({
        id: '2',
        name: 'Another Org',
        isVerified: true,
        location: undefined,
        logoUrl: undefined,
      });
    });

    it('should return empty array on error', async () => {
      setMockResult('profiles', { data: null, error: { message: 'DB Error' } });

      const result = await searchOrganizations('test');
      expect(result).toEqual([]);
    });

    it('should handle null data gracefully', async () => {
      setMockResult('profiles', { data: null, error: null });

      const result = await searchOrganizations('test');
      expect(result).toEqual([]);
    });
  });

  describe('getOrganizationById', () => {
    it('should return organization when found', async () => {
      const mockData = { id: '1', name: 'Test Org', type: 'charity', meta: { location: 'LA' } };
      setMockResult('profiles', { data: mockData, error: null });

      const result = await getOrganizationById('1');

      expect(result).toEqual({
        id: '1',
        name: 'Test Org',
        isVerified: true,
        location: 'LA',
        logoUrl: undefined,
      });
    });

    it('should return null when not found', async () => {
      setMockResult('profiles', { data: null, error: { code: 'PGRST116', message: 'Not found' } });

      const result = await getOrganizationById('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null on other errors', async () => {
      setMockResult('profiles', { data: null, error: { code: 'OTHER', message: 'Error' } });

      const result = await getOrganizationById('1');
      expect(result).toBeNull();
    });

    it('should handle organization with no name', async () => {
      const mockData = { id: '1', name: null, type: 'charity', meta: null };
      setMockResult('profiles', { data: mockData, error: null });

      const result = await getOrganizationById('1');
      expect(result?.name).toBe('Unknown Organization');
    });
  });

  describe('getAllOrganizations', () => {
    it('should return paginated organizations', async () => {
      const mockData = [
        { id: '1', name: 'Org A', type: 'charity', meta: null },
        { id: '2', name: 'Org B', type: 'charity', meta: { location: 'SF' } },
      ];
      // Mock will return the same data for both the count and data queries
      setMockResult('profiles', { data: mockData, error: null, count: 10 });

      const result = await getAllOrganizations(50, 0);

      expect(result.organizations).toHaveLength(2);
    });

    it('should return empty array on error', async () => {
      setMockResult('profiles', { data: null, error: { message: 'Count error' } });

      const result = await getAllOrganizations();
      expect(result.organizations).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('isVerifiedOrganization', () => {
    it('should return true for verified organization', async () => {
      setMockResult('profiles', { data: { id: '1' }, error: null });

      const result = await isVerifiedOrganization('1');
      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      setMockResult('profiles', { data: null, error: { message: 'Not found' } });

      const result = await isVerifiedOrganization('nonexistent');
      expect(result).toBe(false);
    });

    it('should return false on exception', async () => {
      // Simulate an exception by setting error that will throw
      setMockResult('profiles', { data: null, error: { message: 'Network error' } });

      const result = await isVerifiedOrganization('1');
      expect(result).toBe(false);
    });
  });
});
