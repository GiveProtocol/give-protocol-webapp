import { jest } from '@jest/globals';
import { ValidationStatus } from '@/types/selfReportedHours';
import type { SelfReportedHours } from '@/types/selfReportedHours';

// Mock supabase
const mockSupabaseSelect = jest.fn();
const mockSupabaseUpdate = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseSingle = jest.fn();
const mockSupabaseMaybeSingle = jest.fn();
const mockSupabaseNot = jest.fn();
const mockSupabaseOrder = jest.fn();

const createChainMock = () => ({
  select: mockSupabaseSelect.mockReturnThis(),
  update: mockSupabaseUpdate.mockReturnThis(),
  eq: mockSupabaseEq.mockReturnThis(),
  single: mockSupabaseSingle,
  maybeSingle: mockSupabaseMaybeSingle,
  not: mockSupabaseNot.mockReturnThis(),
  order: mockSupabaseOrder,
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => createChainMock()),
  },
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock SecureRandom
jest.mock('@/utils/security/index', () => ({
  SecureRandom: {
    generateSecureNumber: jest.fn(() => 12345),
    generateTransactionId: jest.fn(() => 'mock-tx-id-1234'),
  },
}));

import {
  generateVolunteerHoursHash,
  mintVolunteerHoursSBT,
  batchMintVolunteerHoursSBT,
  getOnChainVolunteerHours,
  verifySBTByHash,
  getVolunteerSBTs,
  VOLUNTEER_SBT_ABI,
} from '../volunteerSBT';
import { supabase } from '@/lib/supabase';

describe('volunteerSBT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateVolunteerHoursHash', () => {
    it('should generate a valid keccak256 hash', () => {
      const data = {
        volunteerId: 'vol-123',
        organizationId: 'org-456',
        activityDate: '2024-01-15',
        hours: 5,
        activityType: 'DIRECT_SERVICE',
        validatedAt: '2024-01-20T10:00:00Z',
      };

      const hash = generateVolunteerHoursHash(data);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it('should generate different hashes for different data', () => {
      const data1 = {
        volunteerId: 'vol-123',
        organizationId: 'org-456',
        activityDate: '2024-01-15',
        hours: 5,
        activityType: 'DIRECT_SERVICE',
        validatedAt: '2024-01-20T10:00:00Z',
      };

      const data2 = {
        ...data1,
        hours: 10,
      };

      const hash1 = generateVolunteerHoursHash(data1);
      const hash2 = generateVolunteerHoursHash(data2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle circular reference in data gracefully', () => {
      // This tests the error handling path when JSON.stringify fails
      const circularData = {
        volunteerId: 'vol-123',
        organizationId: 'org-456',
        activityDate: '2024-01-15',
        hours: 5,
        activityType: 'DIRECT_SERVICE',
        validatedAt: '2024-01-20T10:00:00Z',
      } as Record<string, unknown>;

      // Create circular reference
      circularData.self = circularData;

      expect(() => generateVolunteerHoursHash(circularData as {
        volunteerId: string;
        organizationId: string;
        activityDate: string;
        hours: number;
        activityType: string;
        validatedAt: string;
      })).toThrow('Failed to generate volunteer hours hash');
    });
  });

  describe('mintVolunteerHoursSBT', () => {
    const mockHoursRecord: SelfReportedHours = {
      id: 'hours-123',
visibilityLevel: 'public',
      volunteerId: 'vol-123',
      activityDate: '2024-01-15',
      hours: 5,
      activityType: 'DIRECT_SERVICE',
      description: 'Test activity',
      validationStatus: ValidationStatus.VALIDATED,
      organizationId: 'org-456',
      validatedAt: '2024-01-20T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
    };

    it('should return fallback result for non-validated hours', async () => {
      const unvalidatedRecord = {
        ...mockHoursRecord,
        validationStatus: ValidationStatus.PENDING,
      };

      // Function catches error and returns simulated data
      const result = await mintVolunteerHoursSBT('vol-123', unvalidatedRecord);
      expect(result).toHaveProperty('tokenId');
      expect(result).toHaveProperty('transactionHash');
    });

    it('should mint SBT for validated hours', async () => {
      // Mock profile lookup
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        const chain = createChainMock();
        if (table === 'profiles') {
          chain.single = jest.fn().mockResolvedValue({
            data: { user_id: 'user-123' },
            error: null,
          });
        } else if (table === 'wallet_aliases') {
          chain.maybeSingle = jest.fn().mockResolvedValue({
            data: { wallet_address: '0x1234567890abcdef' },
            error: null,
          });
        } else if (table === 'self_reported_hours') {
          chain.eq = jest.fn().mockResolvedValue({
            data: null,
            error: null,
          });
        }
        return chain;
      });

      const result = await mintVolunteerHoursSBT('vol-123', mockHoursRecord);

      expect(result).toHaveProperty('tokenId');
      expect(result).toHaveProperty('transactionHash');
      expect(result).toHaveProperty('blockNumber');
      expect(result).toHaveProperty('verificationHash');
      expect(result.transactionHash).toMatch(/^0x/);
    });

    it('should handle profile lookup error gracefully', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        const chain = createChainMock();
        chain.single = jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile not found' },
        });
        return chain;
      });

      // Should still return a result (fallback behavior)
      const result = await mintVolunteerHoursSBT('vol-123', mockHoursRecord);
      expect(result).toHaveProperty('tokenId');
    });

    it('should continue even when DB update fails', async () => {
      // Mock successful profile/wallet lookup but failed DB update
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        const chain = createChainMock();
        if (table === 'profiles') {
          chain.single = jest.fn().mockResolvedValue({
            data: { user_id: 'user-123' },
            error: null,
          });
        } else if (table === 'wallet_aliases') {
          chain.maybeSingle = jest.fn().mockResolvedValue({
            data: { wallet_address: '0x1234567890abcdef' },
            error: null,
          });
        } else if (table === 'self_reported_hours') {
          // Simulate update error
          chain.eq = jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Update failed' },
          });
        }
        return chain;
      });

      const result = await mintVolunteerHoursSBT('vol-123', mockHoursRecord);

      // Should still return result even though DB update failed
      expect(result).toHaveProperty('tokenId');
      expect(result).toHaveProperty('transactionHash');
    });
  });

  describe('batchMintVolunteerHoursSBT', () => {
    it('should return empty array for empty input', async () => {
      const result = await batchMintVolunteerHoursSBT([]);
      expect(result).toEqual([]);
    });

    it('should return empty array for non-validated records', async () => {
      const records = [
        {
          volunteerId: 'vol-123',
          hoursRecord: {
            id: 'hours-123',
            validationStatus: ValidationStatus.PENDING,
          } as SelfReportedHours,
        },
      ];

      const result = await batchMintVolunteerHoursSBT(records);
      expect(result).toEqual([]);
    });

    it('should process validated records', async () => {
      const mockRecord: SelfReportedHours = {
        id: 'hours-123',
        visibilityLevel: 'public',
        volunteerId: 'vol-123',
        activityDate: '2024-01-15',
        hours: 5,
        activityType: 'DIRECT_SERVICE',
        description: 'Test',
        validationStatus: ValidationStatus.VALIDATED,
        organizationId: 'org-456',
        validatedAt: '2024-01-20T10:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        const chain = createChainMock();
        if (table === 'profiles') {
          chain.single = jest.fn().mockResolvedValue({
            data: { user_id: 'user-123' },
            error: null,
          });
        } else if (table === 'wallet_aliases') {
          chain.maybeSingle = jest.fn().mockResolvedValue({
            data: { wallet_address: '0x1234' },
            error: null,
          });
        } else {
          chain.eq = jest.fn().mockResolvedValue({ data: null, error: null });
        }
        return chain;
      });

      const result = await batchMintVolunteerHoursSBT([
        { volunteerId: 'vol-123', hoursRecord: mockRecord },
      ]);

      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('tokenId');
    });
  });

  describe('getOnChainVolunteerHours', () => {
    it('should return 0 for unknown wallet address', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        const chain = createChainMock();
        chain.maybeSingle = jest.fn().mockResolvedValue({
          data: null,
          error: null,
        });
        return chain;
      });

      const result = await getOnChainVolunteerHours('0xunknown');
      expect(result).toBe(0);
    });

    it('should return total hours for known wallet', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        const chain = createChainMock();
        if (table === 'wallet_aliases') {
          chain.maybeSingle = jest.fn().mockResolvedValue({
            data: { user_id: 'user-123' },
            error: null,
          });
        } else if (table === 'profiles') {
          chain.maybeSingle = jest.fn().mockResolvedValue({
            data: { id: 'profile-123' },
            error: null,
          });
        } else if (table === 'self_reported_hours') {
          chain.not = jest.fn().mockResolvedValue({
            data: [{ hours: 5 }, { hours: 10 }],
            error: null,
          });
        }
        return chain;
      });

      const result = await getOnChainVolunteerHours('0x1234');
      expect(result).toBe(15);
    });

    it('should return 0 on error', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        const chain = createChainMock();
        chain.maybeSingle = jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        });
        return chain;
      });

      const result = await getOnChainVolunteerHours('0x1234');
      expect(result).toBe(0);
    });
  });

  describe('verifySBTByHash', () => {
    it('should return true for valid SBT', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        const chain = createChainMock();
        chain.maybeSingle = jest.fn().mockResolvedValue({
          data: { id: 'hours-123', sbt_token_id: 12345 },
          error: null,
        });
        return chain;
      });

      const result = await verifySBTByHash('0xvalidhash');
      expect(result).toBe(true);
    });

    it('should return false for invalid hash', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        const chain = createChainMock();
        chain.maybeSingle = jest.fn().mockResolvedValue({
          data: null,
          error: null,
        });
        return chain;
      });

      const result = await verifySBTByHash('0xinvalidhash');
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        const chain = createChainMock();
        chain.maybeSingle = jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query error' },
        });
        return chain;
      });

      const result = await verifySBTByHash('0xhash');
      expect(result).toBe(false);
    });
  });

  describe('getVolunteerSBTs', () => {
    it('should return SBT list for volunteer', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        const chain = createChainMock();
        chain.order = jest.fn().mockResolvedValue({
          data: [
            {
              sbt_token_id: 12345,
              hours: 5,
              activity_date: '2024-01-15',
              verification_hash: '0xhash',
              organization_name: 'Test Org',
              validated_at: '2024-01-20T10:00:00Z',
            },
          ],
          error: null,
        });
        return chain;
      });

      const result = await getVolunteerSBTs('vol-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        tokenId: 12345,
        hours: 5,
        activityDate: '2024-01-15',
        verificationHash: '0xhash',
        organizationName: 'Test Org',
        mintedAt: '2024-01-20T10:00:00Z',
      });
    });

    it('should return empty array on error', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        const chain = createChainMock();
        chain.order = jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query error' },
        });
        return chain;
      });

      const result = await getVolunteerSBTs('vol-123');
      expect(result).toEqual([]);
    });
  });

  describe('VOLUNTEER_SBT_ABI', () => {
    it('should export ABI array', () => {
      expect(Array.isArray(VOLUNTEER_SBT_ABI)).toBe(true);
      expect(VOLUNTEER_SBT_ABI.length).toBeGreaterThan(0);
    });
  });

  describe('error handling edge cases', () => {
    it('getOnChainVolunteerHours should return 0 when profile lookup fails', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        const chain = createChainMock();
        if (table === 'wallet_aliases') {
          chain.maybeSingle = jest.fn().mockResolvedValue({
            data: { user_id: 'user-123' },
            error: null,
          });
        } else if (table === 'profiles') {
          chain.maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Profile error' },
          });
        }
        return chain;
      });

      const result = await getOnChainVolunteerHours('0x1234');
      expect(result).toBe(0);
    });

    it('getOnChainVolunteerHours should return 0 when hours query fails', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        const chain = createChainMock();
        if (table === 'wallet_aliases') {
          chain.maybeSingle = jest.fn().mockResolvedValue({
            data: { user_id: 'user-123' },
            error: null,
          });
        } else if (table === 'profiles') {
          chain.maybeSingle = jest.fn().mockResolvedValue({
            data: { id: 'profile-123' },
            error: null,
          });
        } else if (table === 'self_reported_hours') {
          chain.not = jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Hours query error' },
          });
        }
        return chain;
      });

      const result = await getOnChainVolunteerHours('0x1234');
      expect(result).toBe(0);
    });

    it('getOnChainVolunteerHours should handle exception', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await getOnChainVolunteerHours('0x1234');
      expect(result).toBe(0);
    });

    it('verifySBTByHash should handle exception', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await verifySBTByHash('0xhash');
      expect(result).toBe(false);
    });

    it('getVolunteerSBTs should handle exception', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await getVolunteerSBTs('vol-123');
      expect(result).toEqual([]);
    });

    it('batchMintVolunteerHoursSBT should handle individual mint errors', async () => {
      const mockRecord: SelfReportedHours = {
        id: 'hours-123',
        visibilityLevel: 'public',
        volunteerId: 'vol-123',
        activityDate: '2024-01-15',
        hours: 5,
        activityType: 'DIRECT_SERVICE',
        description: 'Test',
        validationStatus: ValidationStatus.VALIDATED,
        organizationId: 'org-456',
        validatedAt: '2024-01-20T10:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
      };

      // First call fails, second succeeds
      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount <= 3) {
          // First record profile lookup throws
          throw new Error('Profile error');
        }
        const chain = createChainMock();
        chain.single = jest.fn().mockResolvedValue({
          data: { user_id: 'user-123' },
          error: null,
        });
        chain.maybeSingle = jest.fn().mockResolvedValue({
          data: { wallet_address: '0x1234' },
          error: null,
        });
        chain.eq = jest.fn().mockResolvedValue({ data: null, error: null });
        return chain;
      });

      const result = await batchMintVolunteerHoursSBT([
        { volunteerId: 'vol-123', hoursRecord: mockRecord },
        { volunteerId: 'vol-456', hoursRecord: { ...mockRecord, id: 'hours-456' } },
      ]);

      // Both should return results due to fallback behavior
      expect(result.length).toBe(2);
    });
  });
});
