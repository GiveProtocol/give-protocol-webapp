import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { SecurityManager } from './security';

describe('SecurityManager', () => {
  let manager: SecurityManager;

  beforeEach(() => {
    jest.useFakeTimers();
    manager = SecurityManager.getInstance();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getInstance', () => {
    it('returns the same instance on multiple calls', () => {
      const instance1 = SecurityManager.getInstance();
      const instance2 = SecurityManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('returns an instance of SecurityManager', () => {
      expect(manager).toBeInstanceOf(SecurityManager);
    });
  });

  describe('generateOAuthState', () => {
    it('returns a string', () => {
      const state = manager.generateOAuthState();
      expect(typeof state).toBe('string');
    });

    it('returns a valid UUID format', () => {
      const state = manager.generateOAuthState();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(state).toMatch(uuidRegex);
    });

    it('generates unique states on each call', () => {
      const state1 = manager.generateOAuthState();
      const state2 = manager.generateOAuthState();
      expect(state1).not.toBe(state2);
    });
  });

  describe('validateOAuthState', () => {
    it('returns true for a valid state within timeout', () => {
      const state = manager.generateOAuthState();
      const result = manager.validateOAuthState(state);
      expect(result).toBe(true);
    });

    it('returns false for an unknown state', () => {
      const result = manager.validateOAuthState('nonexistent-state');
      expect(result).toBe(false);
    });

    it('consumes the state so it cannot be reused', () => {
      const state = manager.generateOAuthState();
      expect(manager.validateOAuthState(state)).toBe(true);
      expect(manager.validateOAuthState(state)).toBe(false);
    });

    it('returns false for an expired state', () => {
      const state = manager.generateOAuthState();

      // Advance past the 10-minute timeout
      jest.advanceTimersByTime(11 * 60 * 1000);

      const result = manager.validateOAuthState(state);
      expect(result).toBe(false);
    });

    it('returns true for a state just before expiration', () => {
      const state = manager.generateOAuthState();

      // Advance to just under 10 minutes
      jest.advanceTimersByTime(9 * 60 * 1000 + 59 * 1000);

      const result = manager.validateOAuthState(state);
      expect(result).toBe(true);
    });

    it('returns false for an empty string', () => {
      const result = manager.validateOAuthState('');
      expect(result).toBe(false);
    });
  });

  describe('periodic cleanup', () => {
    it('removes expired states automatically via setInterval', () => {
      const state = manager.generateOAuthState();

      // Advance past 10-minute state timeout and then past the 60-second interval
      jest.advanceTimersByTime(11 * 60 * 1000);

      // After cleanup, the state should no longer be found
      const result = manager.validateOAuthState(state);
      expect(result).toBe(false);
    });
  });
});
