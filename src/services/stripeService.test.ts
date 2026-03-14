import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { loadStripe } from "@stripe/stripe-js";

// Mock @stripe/stripe-js
jest.mock("@stripe/stripe-js", () => ({
  loadStripe: jest.fn(),
}));

// Mock getEnv to return a publishable key so Stripe.js path is exercised
jest.mock("@/config/env", () => ({
  getEnv: jest.fn((key: string) => {
    if (key === "VITE_STRIPE_PUBLISHABLE_KEY") return "pk_test_mock";
    return undefined;
  }),
}));

jest.mock("@/utils/logger", () => ({
  Logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import {
  createStripeCheckout,
  redirectToStripeCheckout,
} from "./stripeService";
import { supabase } from "@/lib/supabase";
import { Logger } from "@/utils/logger";

describe("stripeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createStripeCheckout", () => {
    const params = {
      amount: 5000,
      currency: "usd",
      charityId: "charity-1",
      donationType: "one-time" as const,
    };

    it("should create a checkout session successfully", async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
        data: {
          success: true,
          sessionId: "cs_test_123",
          url: "https://checkout.stripe.com/pay/cs_test_123",
        },
        error: null,
      });

      const result = await createStripeCheckout(params);

      expect(result.sessionId).toBe("cs_test_123");
      expect(result.url).toBe("https://checkout.stripe.com/pay/cs_test_123");
    });

    it("should throw on edge function error", async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: "Function error" },
      });

      await expect(createStripeCheckout(params)).rejects.toThrow(
        "Failed to create checkout session",
      );
    });

    it("should throw when response indicates failure", async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
        data: { success: false, error: "Invalid amount" },
        error: null,
      });

      await expect(createStripeCheckout(params)).rejects.toThrow(
        "Invalid amount",
      );
    });

    it("should throw generic error when no error message in response", async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
        data: { success: false },
        error: null,
      });

      await expect(createStripeCheckout(params)).rejects.toThrow(
        "Failed to create checkout session",
      );
    });
  });

  describe("redirectToStripeCheckout", () => {
    const sessionId = "cs_test_123";
    const checkoutUrl = "https://checkout.stripe.com/pay/cs_test_123";

    it("should redirect via Stripe.js when successful", async () => {
      const mockRedirect = jest.fn().mockResolvedValue({ error: null });
      (loadStripe as jest.Mock).mockResolvedValueOnce({
        redirectToCheckout: mockRedirect,
      });

      // Suppress jsdom navigation error
      try {
        await redirectToStripeCheckout(sessionId, checkoutUrl);
      } catch {
        // jsdom throws on location.href assignment - expected
      }

      expect(loadStripe).toHaveBeenCalledWith("pk_test_mock");
      expect(mockRedirect).toHaveBeenCalledWith({ sessionId });
    });

    it("should fall back to URL redirect when Stripe.js redirect returns error", async () => {
      const mockRedirect = jest.fn().mockResolvedValue({
        error: { message: "Redirect failed" },
      });
      (loadStripe as jest.Mock).mockResolvedValueOnce({
        redirectToCheckout: mockRedirect,
      });

      // Suppress jsdom navigation error
      try {
        await redirectToStripeCheckout(sessionId, checkoutUrl);
      } catch {
        // jsdom throws on location.href assignment - expected
      }

      expect(mockRedirect).toHaveBeenCalledWith({ sessionId });
      expect(Logger.warn).toHaveBeenCalledWith(
        "Stripe.js redirect failed, using URL fallback",
        expect.objectContaining({ error: "Redirect failed" }),
      );
    });

    it("should fall back to URL redirect when loadStripe returns null", async () => {
      (loadStripe as jest.Mock).mockResolvedValueOnce(null);

      // Suppress jsdom navigation error
      try {
        await redirectToStripeCheckout(sessionId, checkoutUrl);
      } catch {
        // jsdom throws on location.href assignment - expected
      }

      expect(loadStripe).toHaveBeenCalledWith("pk_test_mock");
    });

    it("should fall back to URL redirect when loadStripe throws", async () => {
      (loadStripe as jest.Mock).mockRejectedValueOnce(
        new Error("Script load failed"),
      );

      // Suppress jsdom navigation error
      try {
        await redirectToStripeCheckout(sessionId, checkoutUrl);
      } catch {
        // jsdom throws on location.href assignment - expected
      }

      expect(loadStripe).toHaveBeenCalledWith("pk_test_mock");
      expect(Logger.warn).toHaveBeenCalledWith(
        "Failed to load Stripe.js, using URL fallback",
        expect.objectContaining({ error: expect.any(Error) }),
      );
    });
  });
});
