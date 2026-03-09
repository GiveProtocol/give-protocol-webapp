import { describe, it, expect, beforeEach } from '@jest/globals';
import { supabase } from '@/lib/supabase';
import { getCharityProfileByEin } from './charityProfileService';

describe('charityProfileService', () => {
  beforeEach(() => {
    (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockReset();
  });

  describe('getCharityProfileByEin', () => {
    it('should return null for empty EIN without calling RPC', async () => {
      const result = await getCharityProfileByEin('');
      expect(result).toBeNull();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it('should return null for whitespace-only EIN without calling RPC', async () => {
      const result = await getCharityProfileByEin('   ');
      expect(result).toBeNull();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it('should call RPC with trimmed EIN and return the profile', async () => {
      const mockProfile = {
        id: 'abc-123',
        ein: '123456789',
        name: 'Test Charity',
        status: 'unclaimed',
        nominations_count: 0,
        interested_donors_count: 0,
      };
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockResolvedValue({
        data: [mockProfile],
        error: null,
      });

      const result = await getCharityProfileByEin('  123456789  ');

      expect(supabase.rpc).toHaveBeenCalledWith('get_or_create_charity_profile', {
        lookup_ein: '123456789',
      });
      expect(result).toEqual(mockProfile);
    });

    it('should return null when RPC returns empty array', async () => {
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getCharityProfileByEin('999999999');
      expect(result).toBeNull();
    });

    it('should return null when RPC returns null data', async () => {
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getCharityProfileByEin('123456789');
      expect(result).toBeNull();
    });

    it('should return null on RPC error', async () => {
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' },
      });

      const result = await getCharityProfileByEin('123456789');
      expect(result).toBeNull();
    });

    it('should return null when RPC throws', async () => {
      (supabase.rpc as ReturnType<typeof import('@jest/globals').jest.fn>).mockRejectedValue(
        new Error('Network error'),
      );

      const result = await getCharityProfileByEin('123456789');
      expect(result).toBeNull();
    });
  });
});
