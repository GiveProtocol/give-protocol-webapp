import { jest } from "@jest/globals";
import { RateLimiter } from "./rateLimiter";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = RateLimiter.getInstance();
  });

  describe("Singleton pattern", () => {
    it("returns the same instance on repeated calls", () => {
      expect(RateLimiter.getInstance()).toBe(RateLimiter.getInstance());
    });
  });

  describe("isRateLimited", () => {
    it("returns false for a new key (initializes record)", () => {
      const key = `rl-new-${Date.now()}`;
      expect(limiter.isRateLimited(key)).toBe(false);
    });

    it("returns false for auth endpoint before limit reached", () => {
      const key = `rl-auth-under-${Date.now()}`;
      limiter.isRateLimited(key, true);
      limiter.increment(key);
      limiter.increment(key);
      // authConfig.maxAttempts = 5, only 2 so far
      expect(limiter.isRateLimited(key, true)).toBe(false);
    });

    it("returns false for public endpoint before limit reached", () => {
      const key = `rl-public-under-${Date.now()}`;
      limiter.isRateLimited(key, false);
      limiter.increment(key);
      limiter.increment(key);
      // publicConfig.maxAttempts = 3, only 2 so far
      expect(limiter.isRateLimited(key, false)).toBe(false);
    });

    it("returns true after hitting auth max attempts (5)", () => {
      const key = `rl-auth-max-${Date.now()}`;
      limiter.isRateLimited(key, true);
      for (let i = 0; i < 5; i++) {
        limiter.increment(key);
      }
      expect(limiter.isRateLimited(key, true)).toBe(true);
    });

    it("returns true for public endpoint after hitting max attempts (3)", () => {
      const key = `rl-public-max-${Date.now()}`;
      limiter.isRateLimited(key, false);
      for (let i = 0; i < 3; i++) {
        limiter.increment(key);
      }
      // publicConfig.maxAttempts = 3: attempts (3) >= maxAttempts (3) => true
      expect(limiter.isRateLimited(key, false)).toBe(true);
    });

    it("returns true while blockedUntil is in the future", () => {
      const key = `rl-blocked-${Date.now()}`;
      limiter.isRateLimited(key, true);
      for (let i = 0; i < 5; i++) {
        limiter.increment(key);
      }
      // Now blocked; isRateLimited should return true regardless of auth flag
      expect(limiter.isRateLimited(key, true)).toBe(true);
    });

    it("resets window when time has elapsed", () => {
      const key = `rl-window-${Date.now()}`;
      limiter.isRateLimited(key, true);
      limiter.increment(key);
      limiter.increment(key);

      // Mock Date.now to return a time past the 15-minute auth window
      const realNow = Date.now;
      Date.now = jest.fn(() => realNow() + 16 * 60 * 1000) as typeof Date.now;

      const result = limiter.isRateLimited(key, true);

      Date.now = realNow;
      // After window reset, attempts = 0 => not rate limited
      expect(result).toBe(false);
    });
  });

  describe("increment", () => {
    it("does not throw when key does not exist", () => {
      expect(() =>
        limiter.increment(`rl-nonexistent-${Date.now()}`),
      ).not.toThrow();
    });

    it("increments attempts count", () => {
      const key = `rl-inc-${Date.now()}`;
      limiter.isRateLimited(key, true); // initialize
      limiter.increment(key);
      limiter.increment(key);
      limiter.increment(key);
      // 3 attempts out of 5 — still not rate-limited for auth
      expect(limiter.isRateLimited(key, true)).toBe(false);
    });

    it("sets blockedUntil after reaching authConfig.maxAttempts", () => {
      const key = `rl-block-after-${Date.now()}`;
      limiter.isRateLimited(key, true);
      for (let i = 0; i < 5; i++) {
        limiter.increment(key);
      }
      // 5th increment triggers block
      expect(limiter.isRateLimited(key, true)).toBe(true);
    });
  });

  describe("reset", () => {
    it("removes the record so the key is no longer rate-limited", () => {
      const key = `rl-reset-${Date.now()}`;
      limiter.isRateLimited(key, true);
      for (let i = 0; i < 5; i++) {
        limiter.increment(key);
      }
      limiter.reset(key);
      expect(limiter.isRateLimited(key, true)).toBe(false);
    });

    it("does not throw for an unknown key", () => {
      expect(() =>
        limiter.reset(`rl-unknown-reset-${Date.now()}`),
      ).not.toThrow();
    });
  });
});
