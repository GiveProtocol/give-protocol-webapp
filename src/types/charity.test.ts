import { describe, it, expect } from '@jest/globals';
import {
  CharityStatus,
  CharityCategory,
  MAX_CAUSES_PER_CHARITY,
  MAX_OPPORTUNITIES_PER_CHARITY,
  hasReachedCauseLimit,
  hasReachedOpportunityLimit,
} from './charity';

describe('charity types', () => {
  describe('CharityStatus enum', () => {
    it('should have correct values', () => {
      expect(CharityStatus._PENDING).toBe('pending');
      expect(CharityStatus._ACTIVE).toBe('active');
      expect(CharityStatus._PAUSED).toBe('paused');
      expect(CharityStatus._COMPLETED).toBe('completed');
      expect(CharityStatus._ARCHIVED).toBe('archived');
    });
  });

  describe('CharityCategory enum', () => {
    it('should have correct values', () => {
      expect(CharityCategory._EDUCATION).toBe('education');
      expect(CharityCategory._HEALTHCARE).toBe('healthcare');
      expect(CharityCategory._ENVIRONMENT).toBe('environment');
      expect(CharityCategory._POVERTY).toBe('poverty');
      expect(CharityCategory._DISASTER_RELIEF).toBe('disaster_relief');
      expect(CharityCategory._ANIMAL_WELFARE).toBe('animal_welfare');
      expect(CharityCategory._ARTS_CULTURE).toBe('arts_culture');
      expect(CharityCategory._COMMUNITY).toBe('community');
    });
  });

  describe('constants', () => {
    it('should have correct max causes per charity', () => {
      expect(MAX_CAUSES_PER_CHARITY).toBe(3);
    });

    it('should have correct max opportunities per charity', () => {
      expect(MAX_OPPORTUNITIES_PER_CHARITY).toBe(3);
    });
  });

  describe('hasReachedCauseLimit', () => {
    it('should return false when under limit', () => {
      expect(hasReachedCauseLimit(0)).toBe(false);
      expect(hasReachedCauseLimit(1)).toBe(false);
      expect(hasReachedCauseLimit(2)).toBe(false);
    });

    it('should return true when at limit', () => {
      expect(hasReachedCauseLimit(3)).toBe(true);
    });

    it('should return true when over limit', () => {
      expect(hasReachedCauseLimit(4)).toBe(true);
      expect(hasReachedCauseLimit(10)).toBe(true);
    });
  });

  describe('hasReachedOpportunityLimit', () => {
    it('should return false when under limit', () => {
      expect(hasReachedOpportunityLimit(0)).toBe(false);
      expect(hasReachedOpportunityLimit(1)).toBe(false);
      expect(hasReachedOpportunityLimit(2)).toBe(false);
    });

    it('should return true when at limit', () => {
      expect(hasReachedOpportunityLimit(3)).toBe(true);
    });

    it('should return true when over limit', () => {
      expect(hasReachedOpportunityLimit(4)).toBe(true);
      expect(hasReachedOpportunityLimit(10)).toBe(true);
    });
  });
});
