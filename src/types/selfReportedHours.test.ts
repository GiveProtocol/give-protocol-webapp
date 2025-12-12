import { describe, it, expect } from '@jest/globals';
import {
  ActivityType,
  ValidationStatus,
  RejectionReason,
  ACTIVITY_TYPE_LABELS,
  REJECTION_REASON_LABELS,
  VALIDATION_WINDOW_DAYS,
  MIN_HOURS_PER_RECORD,
  MAX_HOURS_PER_RECORD,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  calculateDaysUntilExpiration,
  isValidationExpired,
  canEditRecord,
  canDeleteRecord,
  canRequestValidation,
} from './selfReportedHours';

describe('selfReportedHours types', () => {
  describe('ActivityType enum', () => {
    it('should have correct values', () => {
      expect(ActivityType.DIRECT_SERVICE).toBe('direct_service');
      expect(ActivityType.ADMINISTRATIVE_SUPPORT).toBe('administrative_support');
      expect(ActivityType.PROFESSIONAL_TECHNICAL).toBe('professional_technical');
      expect(ActivityType.EVENT_SUPPORT).toBe('event_support');
      expect(ActivityType.MENTORING_TEACHING).toBe('mentoring_teaching');
      expect(ActivityType.LEADERSHIP_COORDINATION).toBe('leadership_coordination');
      expect(ActivityType.GOVERNANCE).toBe('governance');
      expect(ActivityType.ADVOCACY_AWARENESS).toBe('advocacy_awareness');
      expect(ActivityType.FUNDRAISING).toBe('fundraising');
      expect(ActivityType.TRANSPORTATION_DELIVERY).toBe('transportation_delivery');
      expect(ActivityType.DIGITAL_VIRTUAL).toBe('digital_virtual');
      expect(ActivityType.PHYSICAL_LABOR).toBe('physical_labor');
      expect(ActivityType.ENVIRONMENTAL_STEWARDSHIP).toBe('environmental_stewardship');
      expect(ActivityType.OTHER).toBe('other');
    });

    it('should have labels for all activity types', () => {
      const activityTypes = Object.values(ActivityType);
      activityTypes.forEach((type) => {
        expect(ACTIVITY_TYPE_LABELS[type]).toBeDefined();
        expect(typeof ACTIVITY_TYPE_LABELS[type]).toBe('string');
      });
    });
  });

  describe('ValidationStatus enum', () => {
    it('should have correct values', () => {
      expect(ValidationStatus.PENDING).toBe('pending');
      expect(ValidationStatus.VALIDATED).toBe('validated');
      expect(ValidationStatus.REJECTED).toBe('rejected');
      expect(ValidationStatus.UNVALIDATED).toBe('unvalidated');
      expect(ValidationStatus.EXPIRED).toBe('expired');
    });
  });

  describe('RejectionReason enum', () => {
    it('should have correct values', () => {
      expect(RejectionReason.HOURS_INACCURATE).toBe('hours_inaccurate');
      expect(RejectionReason.DATE_INCORRECT).toBe('date_incorrect');
      expect(RejectionReason.ACTIVITY_NOT_RECOGNIZED).toBe('activity_not_recognized');
      expect(RejectionReason.VOLUNTEER_NOT_RECOGNIZED).toBe('volunteer_not_recognized');
      expect(RejectionReason.DESCRIPTION_INSUFFICIENT).toBe('description_insufficient');
      expect(RejectionReason.OTHER).toBe('other');
    });

    it('should have labels for all rejection reasons', () => {
      const reasons = Object.values(RejectionReason);
      reasons.forEach((reason) => {
        expect(REJECTION_REASON_LABELS[reason]).toBeDefined();
        expect(typeof REJECTION_REASON_LABELS[reason]).toBe('string');
      });
    });
  });

  describe('constants', () => {
    it('should have correct validation window', () => {
      expect(VALIDATION_WINDOW_DAYS).toBe(90);
    });

    it('should have correct hours range', () => {
      expect(MIN_HOURS_PER_RECORD).toBe(0.5);
      expect(MAX_HOURS_PER_RECORD).toBe(24);
    });

    it('should have correct description length range', () => {
      expect(MIN_DESCRIPTION_LENGTH).toBe(50);
      expect(MAX_DESCRIPTION_LENGTH).toBe(500);
    });
  });

  describe('calculateDaysUntilExpiration', () => {
    it('should return correct days for recent date', () => {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const daysUntil = calculateDaysUntilExpiration(todayString);
      expect(daysUntil).toBe(VALIDATION_WINDOW_DAYS);
    });

    it('should return fewer days for older date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      const pastString = pastDate.toISOString().split('T')[0];
      const daysUntil = calculateDaysUntilExpiration(pastString);
      expect(daysUntil).toBe(VALIDATION_WINDOW_DAYS - 30);
    });

    it('should return undefined for expired date', () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - (VALIDATION_WINDOW_DAYS + 1));
      const expiredString = expiredDate.toISOString().split('T')[0];
      const daysUntil = calculateDaysUntilExpiration(expiredString);
      expect(daysUntil).toBeUndefined();
    });
  });

  describe('isValidationExpired', () => {
    it('should return false for recent date', () => {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      expect(isValidationExpired(todayString)).toBe(false);
    });

    it('should return false for date within window', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 50);
      const recentString = recentDate.toISOString().split('T')[0];
      expect(isValidationExpired(recentString)).toBe(false);
    });

    it('should return true for date outside window', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - (VALIDATION_WINDOW_DAYS + 1));
      const oldString = oldDate.toISOString().split('T')[0];
      expect(isValidationExpired(oldString)).toBe(true);
    });
  });

  describe('canEditRecord', () => {
    it('should return true for unvalidated status', () => {
      expect(canEditRecord(ValidationStatus.UNVALIDATED)).toBe(true);
    });

    it('should return true for rejected status', () => {
      expect(canEditRecord(ValidationStatus.REJECTED)).toBe(true);
    });

    it('should return false for validated status', () => {
      expect(canEditRecord(ValidationStatus.VALIDATED)).toBe(false);
    });

    it('should return false for pending status', () => {
      expect(canEditRecord(ValidationStatus.PENDING)).toBe(false);
    });

    it('should return true for expired status (can edit expired)', () => {
      // Per implementation: expired records CAN be edited
      expect(canEditRecord(ValidationStatus.EXPIRED)).toBe(true);
    });
  });

  describe('canDeleteRecord', () => {
    it('should return true for unvalidated status', () => {
      expect(canDeleteRecord(ValidationStatus.UNVALIDATED)).toBe(true);
    });

    it('should return true for rejected status', () => {
      expect(canDeleteRecord(ValidationStatus.REJECTED)).toBe(true);
    });

    it('should return true for expired status', () => {
      expect(canDeleteRecord(ValidationStatus.EXPIRED)).toBe(true);
    });

    it('should return false for validated status', () => {
      expect(canDeleteRecord(ValidationStatus.VALIDATED)).toBe(false);
    });

    it('should return true for pending status (can delete pending)', () => {
      // Per implementation: only VALIDATED records cannot be deleted
      expect(canDeleteRecord(ValidationStatus.PENDING)).toBe(true);
    });
  });

  describe('canRequestValidation', () => {
    it('should return true for unvalidated status with non-expired date and verified org', () => {
      const recentDate = new Date().toISOString().split('T')[0];
      expect(canRequestValidation(ValidationStatus.UNVALIDATED, recentDate, true)).toBe(true);
    });

    it('should return true for rejected status with non-expired date and verified org', () => {
      const recentDate = new Date().toISOString().split('T')[0];
      expect(canRequestValidation(ValidationStatus.REJECTED, recentDate, true)).toBe(true);
    });

    it('should return false for validated status', () => {
      const recentDate = new Date().toISOString().split('T')[0];
      expect(canRequestValidation(ValidationStatus.VALIDATED, recentDate, true)).toBe(false);
    });

    it('should return false for pending status', () => {
      const recentDate = new Date().toISOString().split('T')[0];
      expect(canRequestValidation(ValidationStatus.PENDING, recentDate, true)).toBe(false);
    });

    it('should return false when no verified org', () => {
      const recentDate = new Date().toISOString().split('T')[0];
      expect(canRequestValidation(ValidationStatus.UNVALIDATED, recentDate, false)).toBe(false);
    });

    it('should return false for expired activity date', () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - (VALIDATION_WINDOW_DAYS + 1));
      const expiredString = expiredDate.toISOString().split('T')[0];
      expect(canRequestValidation(ValidationStatus.UNVALIDATED, expiredString, true)).toBe(false);
    });
  });
});
