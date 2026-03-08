import { describe, it, expect, beforeEach } from '@jest/globals';
import { supabase } from '@/lib/supabase';
import { searchIrsOrganizations } from './irsOrganizationService';

describe('irsOrganizationService', () => {
  beforeEach(() => {
    (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockReset();
  });

  describe('searchIrsOrganizations', () => {
    it('should return empty result when query is too short and no state filter', async () => {
      const result = await searchIrsOrganizations({
        search_query: 'a',
        filter_state: null,
        filter_ntee: null,
        result_limit: 20,
        result_offset: 0,
      });

      expect(result).toEqual({ organizations: [], hasMore: false });
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it('should return empty result when query is empty and no state filter', async () => {
      const result = await searchIrsOrganizations({
        search_query: '',
        filter_state: null,
        filter_ntee: null,
        result_limit: 20,
        result_offset: 0,
      });

      expect(result).toEqual({ organizations: [], hasMore: false });
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it('should call RPC with correct params, passing null for empty filters', async () => {
      const mockData = [
        { ein: '12-3456789', name: 'Test Charity', city: 'New York', state: 'NY', zip: '10001', ntee_cd: 'B20', deductibility: '1', is_on_platform: false, platform_charity_id: null, rank: 1 },
      ];
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await searchIrsOrganizations({
        search_query: 'test',
        filter_state: '',
        filter_ntee: '',
        result_limit: 20,
        result_offset: 0,
      });

      expect(supabase.rpc).toHaveBeenCalledWith('search_irs_organizations', {
        search_query: 'test',
        filter_state: null,
        filter_ntee: null,
        result_limit: 21,
        result_offset: 0,
      });
      expect(result.organizations).toHaveLength(1);
      expect(result.hasMore).toBe(false);
    });

    it('should search by state filter alone without a query', async () => {
      const mockData = [
        { ein: '98-7654321', name: 'State Charity', city: 'Austin', state: 'TX', zip: '73301', ntee_cd: null, deductibility: '1', is_on_platform: true, platform_charity_id: 'abc', rank: 1 },
      ];
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await searchIrsOrganizations({
        search_query: '',
        filter_state: 'TX',
        filter_ntee: null,
        result_limit: 20,
        result_offset: 0,
      });

      expect(supabase.rpc).toHaveBeenCalledWith('search_irs_organizations', {
        search_query: null,
        filter_state: 'TX',
        filter_ntee: null,
        result_limit: 21,
        result_offset: 0,
      });
      expect(result.organizations).toHaveLength(1);
    });

    it('should set hasMore to true when more rows than limit are returned', async () => {
      const mockData = Array.from({ length: 21 }, (_, i) => ({
        ein: `00-000000${i}`,
        name: `Charity ${i}`,
        city: null,
        state: 'CA',
        zip: null,
        ntee_cd: null,
        deductibility: null,
        is_on_platform: false,
        platform_charity_id: null,
        rank: i,
      }));
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await searchIrsOrganizations({
        search_query: 'charity',
        filter_state: null,
        filter_ntee: null,
        result_limit: 20,
        result_offset: 0,
      });

      expect(result.hasMore).toBe(true);
      expect(result.organizations).toHaveLength(20);
    });

    it('should return empty result on RPC error', async () => {
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' },
      });

      const result = await searchIrsOrganizations({
        search_query: 'test',
        filter_state: null,
        filter_ntee: null,
        result_limit: 20,
        result_offset: 0,
      });

      expect(result).toEqual({ organizations: [], hasMore: false });
    });

    it('should return empty result on thrown exception', async () => {
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockRejectedValue(
        new Error('Network error'),
      );

      const result = await searchIrsOrganizations({
        search_query: 'test',
        filter_state: null,
        filter_ntee: null,
        result_limit: 20,
        result_offset: 0,
      });

      expect(result).toEqual({ organizations: [], hasMore: false });
    });

    it('should handle null data gracefully', async () => {
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await searchIrsOrganizations({
        search_query: 'test',
        filter_state: null,
        filter_ntee: null,
        result_limit: 20,
        result_offset: 0,
      });

      expect(result).toEqual({ organizations: [], hasMore: false });
    });
  });
});
