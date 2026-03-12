import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mock @stripe/stripe-js
jest.mock("@stripe/stripe-js", () => ({
  loadStripe: jest.fn(),
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
    it("should not throw when called", async () => {
      // VITE_STRIPE_PUBLISHABLE_KEY is not set in test env,
      // so it falls through to window.location.href assignment
      await expect(
        redirectToStripeCheckout(
          "cs_test_123",
          "https://checkout.stripe.com/pay/cs_test_123",
        ),
      ).resolves.not.toThrow();
    });
  });
});
