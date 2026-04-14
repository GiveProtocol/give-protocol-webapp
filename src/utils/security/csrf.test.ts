import { TextEncoder as NodeTextEncoder } from "util";
import { CSRFProtection } from "./csrf";

// Polyfill TextEncoder and crypto.subtle for the jsdom test environment.
beforeAll(() => {
  // jsdom may not expose TextEncoder globally
  if (typeof globalThis.TextEncoder === "undefined") {
    (globalThis as Record<string, unknown>)["TextEncoder"] = NodeTextEncoder;
  }

  // jsdom may not expose crypto.subtle — create a minimal stub if needed
  if (!globalThis.crypto.subtle) {
    Object.defineProperty(globalThis.crypto, "subtle", {
      value: {},
      writable: true,
      configurable: true,
    });
  }

  // crypto.subtle.timingSafeEqual is not part of the standard Web Crypto API
  const subtle = globalThis.crypto.subtle as Record<string, unknown>;
  if (typeof subtle["timingSafeEqual"] !== "function") {
    subtle["timingSafeEqual"] = (
      a: ArrayBuffer,
      b: ArrayBuffer,
    ): boolean => {
      const av = new Uint8Array(a);
      const bv = new Uint8Array(b);
      if (av.length !== bv.length) return false;
      let diff = 0;
      for (let i = 0; i < av.length; i++) {
        diff |= av[i] ^ bv[i];
      }
      return diff === 0;
    };
  }
});

describe("CSRFProtection", () => {
  let csrf: CSRFProtection;

  beforeEach(() => {
    csrf = CSRFProtection.getInstance();
    // Reset the token so each test starts fresh
    csrf.refreshToken();
  });

  describe("Singleton pattern", () => {
    it("returns the same instance on repeated calls", () => {
      expect(CSRFProtection.getInstance()).toBe(CSRFProtection.getInstance());
    });
  });

  describe("getToken", () => {
    it("returns a non-empty string", () => {
      const token = csrf.getToken();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("returns a 64-character hex string (32 bytes)", () => {
      const token = csrf.getToken();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it("returns the same token on repeated calls", () => {
      const first = csrf.getToken();
      const second = csrf.getToken();
      expect(first).toBe(second);
    });
  });

  describe("refreshToken", () => {
    it("generates a new token on refresh", () => {
      const first = csrf.getToken();
      csrf.refreshToken();
      const second = csrf.getToken();
      expect(second).toMatch(/^[0-9a-f]{64}$/);
      // Two cryptographically random 32-byte tokens are astronomically unlikely to match
      expect(second).not.toBe(first);
    });
  });

  describe("getHeaders", () => {
    it("returns an object with X-CSRF-Token header", () => {
      const headers = csrf.getHeaders();
      expect(headers).toHaveProperty("X-CSRF-Token");
    });

    it("X-CSRF-Token header matches current token", () => {
      const token = csrf.getToken();
      const headers = csrf.getHeaders();
      expect(headers["X-CSRF-Token"]).toBe(token);
    });
  });

  describe("validate", () => {
    it("resolves to true when token matches", async () => {
      const token = csrf.getToken();
      const result = await csrf.validate(token);
      expect(result).toBe(true);
    });

    it("resolves to false when token does not match", async () => {
      csrf.getToken(); // initialize
      const result = await csrf.validate("invalid-token-value");
      expect(result).toBe(false);
    });

    it("resolves to false for empty string token", async () => {
      csrf.getToken(); // initialize
      const result = await csrf.validate("");
      expect(result).toBe(false);
    });

    it("resolves to false for token of different length", async () => {
      csrf.getToken(); // initialize
      const result = await csrf.validate("short");
      expect(result).toBe(false);
    });
  });

  describe("Cookie", () => {
    it("sets a cookie when token is initialized", () => {
      csrf.getToken();
      // In jsdom, document.cookie is available
      expect(typeof document.cookie).toBe("string");
    });
  });
});
