import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { resetMockState } from '@/test-utils/supabaseMock';
import { ValidationStatus, ActivityType } from '@/types/selfReportedHours';
import {
  VOLUNTEER_SBT_ABI,
  generateVolunteerHoursHash,
  mintVolunteerHoursSBT,
  batchMintVolunteerHoursSBT,
  getOnChainVolunteerHours,
  verifySBTByHash,
  getVolunteerSBTs,
} from './volunteerSBT';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    keccak256: jest.fn().mockReturnValue('0xmockhash1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'),
    toUtf8Bytes: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    Contract: jest.fn().mockImplementation(() => ({
      mintVolunteerHours: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0xtxhash' }) }),
      batchMintVolunteerHours: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0xtxhash' }) }),
      getVolunteerTotalHours: jest.fn().mockResolvedValue(100n),
      verifyHash: jest.fn().mockResolvedValue(true),
      getVolunteerSBTs: jest.fn().mockResolvedValue([1n, 2n]),
    })),
    BrowserProvider: jest.fn().mockImplementation(() => ({
      getSigner: jest.fn().mockResolvedValue({}),
    })),
  },
}));

describe('volunteerSBT', () => {
  beforeEach(() => {
    resetMockState();
    jest.clearAllMocks();
  });

  describe('VOLUNTEER_SBT_ABI', () => {
    it('should export the contract ABI', () => {
      expect(VOLUNTEER_SBT_ABI).toBeDefined();
      expect(Array.isArray(VOLUNTEER_SBT_ABI)).toBe(true);
    });

    it('should contain mint function', () => {
      const hasMint = VOLUNTEER_SBT_ABI.some(
        (item) => typeof item === 'string' && item.includes('mint')
      );
      expect(hasMint).toBe(true);
    });

    it('should contain getVolunteerHours function', () => {
      const hasGetHours = VOLUNTEER_SBT_ABI.some(
        (item) => typeof item === 'string' && item.includes('getVolunteerHours')
      );
      expect(hasGetHours).toBe(true);
    });

    it('should have multiple ABI entries', () => {
      expect(VOLUNTEER_SBT_ABI.length).toBeGreaterThan(0);
    });
  });

  describe('generateVolunteerHoursHash', () => {
    it('should generate a hash for volunteer hours', () => {
      const hours = {
        id: 'hours-1',
        volunteerId: 'user-1',
        activityDate: '2024-01-15',
        hours: 4,
        activityType: ActivityType.DIRECT_SERVICE,
        description: 'Test volunteer work',
        organizationName: 'Test Org',
        validationStatus: ValidationStatus.VALIDATED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const hash = generateVolunteerHoursHash(hours);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.startsWith('0x')).toBe(true);
    });
  });

  describe('mintVolunteerHoursSBT', () => {
    it('should mint SBT for validated hours', async () => {
      const hoursRecord = {
        id: 'hours-1',
        volunteerId: 'user-1',
        activityDate: '2024-01-15',
        hours: 4,
        activityType: ActivityType.DIRECT_SERVICE,
        description: 'Test volunteer work',
        organizationName: 'Test Org',
        validationStatus: ValidationStatus.VALIDATED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // With mock supabase, should return a result
      const result = await mintVolunteerHoursSBT('user-1', hoursRecord);
      expect(result).toBeDefined();
      expect(result.tokenId).toBeDefined();
      expect(result.transactionHash).toBeDefined();
      expect(result.verificationHash).toBeDefined();
    });

    it('should handle non-validated hours gracefully', async () => {
      const hoursRecord = {
        id: 'hours-1',
        volunteerId: 'user-1',
        activityDate: '2024-01-15',
        hours: 4,
        activityType: ActivityType.DIRECT_SERVICE,
        description: 'Test',
        organizationName: 'Test Org',
        validationStatus: ValidationStatus.UNVALIDATED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Function catches errors and returns simulated data
      const result = await mintVolunteerHoursSBT('user-1', hoursRecord);
      expect(result).toBeDefined();
    });
  });

  describe('batchMintVolunteerHoursSBT', () => {
    it('should process batch of validated records', async () => {
      const records = [
        {
          volunteerId: 'user-1',
          hoursRecord: {
            id: 'hours-1',
            volunteerId: 'user-1',
            activityDate: '2024-01-15',
            hours: 4,
            activityType: ActivityType.DIRECT_SERVICE,
            description: 'Test',
            organizationName: 'Test Org',
            validationStatus: ValidationStatus.VALIDATED,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
      ];

      const result = await batchMintVolunteerHoursSBT(records);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for non-validated records', async () => {
      const records = [
        {
          volunteerId: 'user-1',
          hoursRecord: {
            id: 'hours-1',
            volunteerId: 'user-1',
            activityDate: '2024-01-15',
            hours: 4,
            activityType: ActivityType.DIRECT_SERVICE,
            description: 'Test',
            organizationName: 'Test Org',
            validationStatus: ValidationStatus.UNVALIDATED,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
      ];

      const result = await batchMintVolunteerHoursSBT(records);
      expect(result).toEqual([]);
    });
  });

  describe('getOnChainVolunteerHours', () => {
    it('should return hours or 0', async () => {
      const result = await getOnChainVolunteerHours('0x1234');
      expect(typeof result).toBe('number');
    });
  });

  describe('verifySBTByHash', () => {
    it('should handle hash verification', async () => {
      const result = await verifySBTByHash('0xhash');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getVolunteerSBTs', () => {
    it('should return array', async () => {
      const result = await getVolunteerSBTs('0x1234');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array on database error', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      setMockResult('self_reported_hours', { data: null, error: { message: 'DB Error' } });

      const result = await getVolunteerSBTs('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('getOnChainVolunteerHours should return 0 when wallet not found', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      setMockResult('wallet_aliases', { data: null, error: null });

      const result = await getOnChainVolunteerHours('0xnonexistent');
      expect(result).toBe(0);
    });

    it('getOnChainVolunteerHours should return 0 when wallet lookup fails', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      setMockResult('wallet_aliases', { data: null, error: { message: 'DB Error' } });

      const result = await getOnChainVolunteerHours('0x1234');
      expect(result).toBe(0);
    });

    it('getOnChainVolunteerHours should return 0 when profile not found', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      setMockResult('wallet_aliases', { data: { user_id: 'user-1' }, error: null });
      setMockResult('profiles', { data: null, error: null });

      const result = await getOnChainVolunteerHours('0x1234');
      expect(result).toBe(0);
    });

    it('getOnChainVolunteerHours should return 0 on hours fetch error', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      setMockResult('wallet_aliases', { data: { user_id: 'user-1' }, error: null });
      setMockResult('profiles', { data: { id: 'profile-1' }, error: null });
      setMockResult('self_reported_hours', { data: null, error: { message: 'DB Error' } });

      const result = await getOnChainVolunteerHours('0x1234');
      expect(result).toBe(0);
    });

    it('verifySBTByHash should return false on database error', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      setMockResult('self_reported_hours', { data: null, error: { message: 'DB Error' } });

      const result = await verifySBTByHash('0xinvalidhash');
      expect(result).toBe(false);
    });

    it('verifySBTByHash should return false when no matching record', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      setMockResult('self_reported_hours', { data: null, error: null });

      const result = await verifySBTByHash('0xnonexistent');
      expect(result).toBe(false);
    });

    it('verifySBTByHash should return true when valid SBT exists', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      setMockResult('self_reported_hours', {
        data: { id: 'hours-1', sbt_token_id: 12345 },
        error: null
      });

      const result = await verifySBTByHash('0xvalidhash');
      expect(result).toBe(true);
    });

    it('batchMintVolunteerHoursSBT should handle errors in individual mints', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      // Set up to fail profile lookup
      setMockResult('profiles', { data: null, error: { message: 'Profile not found' } });

      const records = [
        {
          volunteerId: 'user-1',
          hoursRecord: {
            id: 'hours-1',
            volunteerId: 'user-1',
            activityDate: '2024-01-15',
            hours: 4,
            activityType: ActivityType.DIRECT_SERVICE,
            description: 'Test',
            organizationName: 'Test Org',
            validationStatus: ValidationStatus.VALIDATED,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
      ];

      // Should still return results (mock returns simulated data on error)
      const result = await batchMintVolunteerHoursSBT(records);
      expect(Array.isArray(result)).toBe(true);
    });

    it('getVolunteerSBTs should map data correctly', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      const mockData = [
        {
          sbt_token_id: 123,
          hours: 5,
          activity_date: '2024-01-15',
          verification_hash: '0xhash123',
          organization_name: 'Test Org',
          validated_at: '2024-01-16T10:00:00Z',
        },
      ];
      setMockResult('self_reported_hours', { data: mockData, error: null });

      const result = await getVolunteerSBTs('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].tokenId).toBe(123);
      expect(result[0].hours).toBe(5);
      expect(result[0].activityDate).toBe('2024-01-15');
      expect(result[0].verificationHash).toBe('0xhash123');
      expect(result[0].organizationName).toBe('Test Org');
    });

    it('getOnChainVolunteerHours should sum hours correctly', async () => {
      const { setMockResult } = await import('@/test-utils/supabaseMock');
      setMockResult('wallet_aliases', { data: { user_id: 'user-1' }, error: null });
      setMockResult('profiles', { data: { id: 'profile-1' }, error: null });
      setMockResult('self_reported_hours', {
        data: [{ hours: 4 }, { hours: 3 }, { hours: 5 }],
        error: null
      });

      const result = await getOnChainVolunteerHours('0x1234');
      expect(result).toBe(12);
    });
  });
});
