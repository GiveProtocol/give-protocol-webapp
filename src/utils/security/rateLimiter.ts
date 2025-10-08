import { Logger } from "../logger";

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDuration: number;
}

interface RateLimitRecord {
  attempts: number;
  resetAt: number;
  blockedUntil?: number;
}

/**
 * Rate limiting service for preventing abuse and brute force attacks
 * @class RateLimiter
 * @description Singleton class that implements configurable rate limiting with automatic cleanup. Supports different rate limit profiles for authentication vs public endpoints. Uses sliding window algorithm with automatic blocking for exceeded attempts and periodic cleanup of expired records.
 * @example
 * ```typescript
 * const rateLimiter = RateLimiter.getInstance();
 *
 * // Check if IP is rate limited for authentication
 * const isBlocked = rateLimiter.isRateLimited('192.168.1.1', true);
 * if (isBlocked) {
 *   throw new Error('Rate limit exceeded, try again later');
 * }
 *
 * // Increment attempt counter after failed login
 * rateLimiter.increment('192.168.1.1');
 *
 * // Check public API rate limits (more restrictive)
 * const isPublicBlocked = rateLimiter.isRateLimited('192.168.1.1', false);
 *
 * // Reset rate limit for user after successful authentication
 * rateLimiter.reset('192.168.1.1');
 * ```
 */
export class RateLimiter {
  private static instance: RateLimiter;
  private store: Map<string, RateLimitRecord> = new Map();

  private readonly authConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDuration: 30 * 60 * 1000, // 30 minutes
  };

  private readonly publicConfig: RateLimitConfig = {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxAttempts: 3,
    blockDuration: 60 * 60 * 1000, // 60 minutes - more restrictive for public
  };

  private constructor() {
    // Clean up expired records periodically
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  static getInstance(): RateLimiter {
    if (!this.instance) {
      this.instance = new RateLimiter();
    }
    return this.instance;
  }

  isRateLimited(key: string, isAuth = false): boolean {
    const config = isAuth ? this.authConfig : this.publicConfig;
    const now = Date.now();
    const record = this.store.get(key);

    if (!record) {
      this.store.set(key, {
        attempts: 0,
        resetAt: now + config.windowMs,
      });
      return false;
    }

    // Check if blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return true;
    }

    // Reset if window expired
    if (now > record.resetAt) {
      record.attempts = 0;
      record.resetAt = now + config.windowMs;
      delete record.blockedUntil;
    }

    return record.attempts >= config.maxAttempts;
  }

  increment(key: string): void {
    const record = this.store.get(key);
    if (!record) return;

    record.attempts++;

    // Block if max attempts exceeded
    if (record.attempts >= this.authConfig.maxAttempts) {
      record.blockedUntil = Date.now() + this.authConfig.blockDuration;
      Logger.warn("Rate limit exceeded", {
        key,
        attempts: record.attempts,
        blockedUntil: new Date(record.blockedUntil),
      });
    }
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (
        record.resetAt < now &&
        (!record.blockedUntil || record.blockedUntil < now)
      ) {
        this.store.delete(key);
      }
    }
  }
}
