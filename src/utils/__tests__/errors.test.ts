/**
 * Test coverage for errors.ts utility functions
 */

import { getAuthErrorMessage, createAuthError } from '../errors';

describe('errors utilities', () => {
  describe('getAuthErrorMessage', () => {
    it('should return message for invalid credentials', () => {
      const message = getAuthErrorMessage('invalid_credentials');
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
      expect(message).toContain('Invalid');
    });

    it('should return message for email taken', () => {
      const message = getAuthErrorMessage('email_taken');
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
      expect(message).toContain('email');
    });

    it('should return message for weak password', () => {
      const message = getAuthErrorMessage('weak_password');
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
      expect(message).toContain('Password');
    });

    it('should return default message for unknown error', () => {
      // Test with an unknown error code by using type assertion with unknown first
      const unknownCode = 'unknown_error' as unknown;
      const message = getAuthErrorMessage(unknownCode as Parameters<typeof getAuthErrorMessage>[0]);
      expect(typeof message).toBe('string');
      expect(message).toBe('An unexpected error occurred');
    });
  });

  describe('createAuthError', () => {
    it('should create error with correct code and message', () => {
      const error = createAuthError('invalid_credentials');
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe('invalid_credentials');
      expect(error.message).toBe(getAuthErrorMessage('invalid_credentials'));
    });

    it('should create error for email taken', () => {
      const error = createAuthError('email_taken');
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe('email_taken');
      expect(error.message).toBe(getAuthErrorMessage('email_taken'));
    });

    it('should create error for network error', () => {
      const error = createAuthError('network_error');
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe('network_error');
      expect(error.message).toBe(getAuthErrorMessage('network_error'));
    });
  });
});