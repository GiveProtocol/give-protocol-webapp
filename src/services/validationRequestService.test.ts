import { describe, it, expect, beforeEach } from '@jest/globals';
import { setMockResult, resetMockState } from '@/test-utils/supabaseMock';
import {
  RejectionReason,
} from '@/types/selfReportedHours';
import {
  getValidationHistory,
} from './validationRequestService';

describe('validationRequestService', () => {
  beforeEach(() => {
    resetMockState();
  });

  // Note: Most validation request service functions require complex joins that our
  // simple mock cannot handle. These tests focus on functions that work with the mock.

  describe('getValidationHistory', () => {
    it('should return validation history', async () => {
      const now = new Date();
      const mockData = [
        {
          id: 'request-1',
          self_reported_hours_id: 'hours-1',
          organization_id: 'org-1',
          volunteer_id: 'user-1',
          status: 'approved',
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        {
          id: 'request-2',
          self_reported_hours_id: 'hours-1',
          organization_id: 'org-1',
          volunteer_id: 'user-1',
          status: 'rejected',
          rejection_reason: RejectionReason.HOURS_DISCREPANCY,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ];
      setMockResult('validation_requests', { data: mockData, error: null });

      const result = await getValidationHistory('hours-1', 'user-1');

      expect(result).toHaveLength(2);
    });

    it('should handle empty history', async () => {
      setMockResult('validation_requests', { data: [], error: null });

      const result = await getValidationHistory('hours-1', 'user-1');
      expect(result).toEqual([]);
    });

    it('should throw on error', async () => {
      setMockResult('validation_requests', { data: null, error: { message: 'DB Error' } });

      await expect(getValidationHistory('hours-1', 'user-1')).rejects.toThrow(
        'Failed to fetch history'
      );
    });
  });
});
