import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import {
  processPayment,
  createSubscription,
  fetchHelcimCheckoutToken,
  loadHelcimScript,
  resetHelcimScriptState,
  initializeHelcimFields,
  updateHelcimAmount,
  submitHelcimFields,
} from "./helcimService";
import type { FiatPaymentData } from "@/components/web3/donation/types/donation";

// Mock the Logger
jest.mock("@/utils/logger", () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

const mockPaymentData: FiatPaymentData = {
  checkoutToken: "test-checkout-token",
  amount: 50,
  coverFees: true,
  charityId: "charity-123",
  charityName: "Test Charity",
  name: "John Doe",
  email: "john@example.com",
  frequency: "once",
};

function createMockHelcimPay() {
  return {
    init: jest.fn(),
    setAmount: jest.fn(),
    appendTo: jest.fn(),
    on: jest.fn(),
    validate: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
    submit: jest.fn<() => Promise<{ cardToken: string }>>().mockResolvedValue({ cardToken: "card-token-123" }),
  };
}

describe("helcimService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    delete window.HelcimPay;
    resetHelcimScriptState();
  });

  afterEach(() => {
    // Clean up script tags added during tests
    document.querySelectorAll('script[src*="helcim-pay"]').forEach((el) => el.remove());
    delete window.HelcimPay;
  });

  describe("processPayment", () => {
    it("should process a successful payment", async () => {
      const mockResponse = {
        success: true,
        transactionId: "txn-456",
        approvalCode: "APR-789",
        cardType: "Visa",
        cardLastFour: "4242",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await processPayment(mockPaymentData);

      expect(result).toEqual({
        transactionId: "txn-456",
        approvalCode: "APR-789",
        amountCents: 5000,
        cardType: "Visa",
        cardLastFour: "4242",
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.amount).toBe(5000);
      expect(body.charityId).toBe("charity-123");
      expect(body.donorName).toBe("John Doe");
    });

    it("should throw on failed payment response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, error: "Card declined" }),
      } as unknown as Response);

      await expect(processPayment(mockPaymentData)).rejects.toThrow("Card declined");
    });

    it("should throw default message when no error provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      } as Response);

      await expect(processPayment(mockPaymentData)).rejects.toThrow("Payment processing failed");
    });

    it("should return empty strings for missing optional fields", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await processPayment(mockPaymentData);

      expect(result.transactionId).toBe("");
      expect(result.approvalCode).toBe("");
    });
  });

  describe("createSubscription", () => {
    it("should create a successful subscription", async () => {
      const mockResponse = {
        success: true,
        subscriptionId: "sub-123",
        customerId: "cust-456",
        nextBillingDate: "2026-03-12",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await createSubscription(mockPaymentData);

      expect(result).toEqual({
        subscriptionId: "sub-123",
        customerId: "cust-456",
        nextBillingDate: "2026-03-12",
      });
    });

    it("should throw on failed subscription response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false, error: "Server error" }),
      } as unknown as Response);

      await expect(createSubscription(mockPaymentData)).rejects.toThrow("Server error");
    });

    it("should throw default message when no error provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      } as Response);

      await expect(createSubscription(mockPaymentData)).rejects.toThrow("Subscription creation failed");
    });

    it("should return empty strings for missing optional fields", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await createSubscription(mockPaymentData);

      expect(result.subscriptionId).toBe("");
      expect(result.customerId).toBe("");
      expect(result.nextBillingDate).toBe("");
    });
  });

  describe("fetchHelcimCheckoutToken", () => {
    it("should fetch checkout token for one-time donation", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          checkoutToken: "checkout-token-abc",
          secretToken: "secret-xyz",
        }),
      } as Response);

      const result = await fetchHelcimCheckoutToken(25, "once");

      expect(result).toEqual({
        checkoutToken: "checkout-token-abc",
        secretToken: "secret-xyz",
      });

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.donationType).toBe("one-time");
      expect(body.amount).toBe(25);
      expect(body.currency).toBe("USD");
    });

    it("should fetch checkout token for monthly donation", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          checkoutToken: "checkout-token-abc",
          secretToken: "secret-xyz",
        }),
      } as Response);

      await fetchHelcimCheckoutToken(25, "monthly");

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.donationType).toBe("subscription");
    });

    it("should throw when response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, error: "Unauthorized" }),
      } as unknown as Response);

      await expect(fetchHelcimCheckoutToken(25, "once")).rejects.toThrow("Unauthorized");
    });

    it("should throw default message when no error provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      } as Response);

      await expect(fetchHelcimCheckoutToken(25, "once")).rejects.toThrow(
        "Failed to initialize payment form",
      );
    });

    it("should throw when no checkout token in response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, checkoutToken: "" }),
      } as Response);

      await expect(fetchHelcimCheckoutToken(25, "once")).rejects.toThrow(
        "No checkout token received",
      );
    });

    it("should return empty string for missing secretToken", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, checkoutToken: "tok-123" }),
      } as Response);

      const result = await fetchHelcimCheckoutToken(25, "once");
      expect(result.secretToken).toBe("");
    });
  });

  describe("loadHelcimScript", () => {
    it("should resolve immediately when window.HelcimPay already exists", async () => {
      window.HelcimPay = createMockHelcimPay();

      await expect(loadHelcimScript()).resolves.toBeUndefined();
    });

    it("should create a script tag and resolve when global becomes available", async () => {
      jest.useFakeTimers();

      const promise = loadHelcimScript();

      // Find the script element that was appended
      const script = document.querySelector('script[src*="helcim-pay"]') as HTMLScriptElement;
      expect(script).not.toBeNull();
      expect(script.async).toBe(true);

      // Simulate script load, then global appears
      window.HelcimPay = createMockHelcimPay();
      script.onload?.(new Event("load"));

      // Advance past the poll interval
      jest.advanceTimersByTime(100);

      await promise;
      jest.useRealTimers();
    });

    it("should reject when script fails to load", async () => {
      const promise = loadHelcimScript();

      const script = document.querySelector('script[src*="helcim-pay"]') as HTMLScriptElement;
      script.onerror?.(new Event("error"));

      await expect(promise).rejects.toThrow("Failed to load payment processor");
    });

    it("should return the same promise when called multiple times", async () => {
      const promise1 = loadHelcimScript();
      const promise2 = loadHelcimScript();

      expect(promise1).toBe(promise2);

      // Clean up - trigger error to settle the promise
      const script = document.querySelector('script[src*="helcim-pay"]') as HTMLScriptElement;
      script.onerror?.(new Event("error"));

      // Catch the rejection to prevent unhandled promise rejection
      await expect(promise1).rejects.toThrow();
    });

    it("should reject when global not available after timeout", async () => {
      jest.useFakeTimers();

      const promise = loadHelcimScript();

      const script = document.querySelector('script[src*="helcim-pay"]') as HTMLScriptElement;
      // Script loads but global never appears
      script.onload?.(new Event("load"));

      // Advance past the 5s timeout
      jest.advanceTimersByTime(5100);

      await expect(promise).rejects.toThrow("HelcimPay.js global not available after script load");
      jest.useRealTimers();
    });

    it("should handle existing script tag and wait for load", async () => {
      jest.useFakeTimers();

      // Pre-create a script tag
      const existingScript = document.createElement("script");
      existingScript.src = "https://secure.helcim.app/helcim-pay/services/start.js";
      document.head.appendChild(existingScript);

      const promise = loadHelcimScript();

      // Simulate load event on existing script
      window.HelcimPay = createMockHelcimPay();
      existingScript.dispatchEvent(new Event("load"));

      jest.advanceTimersByTime(100);

      await expect(promise).resolves.toBeUndefined();
      jest.useRealTimers();
    });

    it("should handle existing script tag with error", async () => {
      // Pre-create a script tag
      const existingScript = document.createElement("script");
      existingScript.src = "https://secure.helcim.app/helcim-pay/services/start.js";
      document.head.appendChild(existingScript);

      const promise = loadHelcimScript();

      existingScript.dispatchEvent(new Event("error"));

      await expect(promise).rejects.toThrow("Failed to load payment processor");
    });

    it("should resolve immediately for existing script when global already available", async () => {
      // Pre-create a script tag
      const existingScript = document.createElement("script");
      existingScript.src = "https://secure.helcim.app/helcim-pay/services/start.js";
      document.head.appendChild(existingScript);

      // Global already available
      window.HelcimPay = createMockHelcimPay();

      await expect(loadHelcimScript()).resolves.toBeUndefined();
    });
  });

  describe("resetHelcimScriptState", () => {
    it("should allow a fresh load after reset", async () => {
      jest.useFakeTimers();

      // First load attempt - fails
      const promise1 = loadHelcimScript();
      const script1 = document.querySelector('script[src*="helcim-pay"]') as HTMLScriptElement;
      script1.onerror?.(new Event("error"));
      await expect(promise1).rejects.toThrow();

      // Remove the failed script tag
      script1.remove();

      // Reset state
      resetHelcimScriptState();

      // Second load attempt should create a new script
      const promise2 = loadHelcimScript();
      const script2 = document.querySelector('script[src*="helcim-pay"]') as HTMLScriptElement;
      expect(script2).not.toBeNull();

      window.HelcimPay = createMockHelcimPay();
      script2.onload?.(new Event("load"));
      jest.advanceTimersByTime(100);

      await promise2;
      jest.useRealTimers();
    });
  });

  describe("initializeHelcimFields", () => {
    it("should initialize fields with correct config", () => {
      const mockHelcim = createMockHelcimPay();
      window.HelcimPay = mockHelcim;

      initializeHelcimFields("card-container", "checkout-token", 50, true);

      expect(mockHelcim.init).toHaveBeenCalledWith({
        token: "checkout-token",
        test: true,
        amount: 50,
        currency: "USD",
        avs: true,
      });
      expect(mockHelcim.appendTo).toHaveBeenCalledWith("card-container");
    });

    it("should default to test mode true", () => {
      const mockHelcim = createMockHelcimPay();
      window.HelcimPay = mockHelcim;

      initializeHelcimFields("card-container", "checkout-token", 50);

      expect(mockHelcim.init).toHaveBeenCalledWith(
        expect.objectContaining({ test: true }),
      );
    });

    it("should throw when HelcimPay is not loaded", () => {
      expect(() => initializeHelcimFields("card-container", "checkout-token", 50)).toThrow(
        "HelcimPay.js not loaded",
      );
    });

    it("should throw when checkout token is empty", () => {
      window.HelcimPay = createMockHelcimPay();

      expect(() => initializeHelcimFields("card-container", "", 50)).toThrow(
        "Checkout token is required",
      );
    });
  });

  describe("updateHelcimAmount", () => {
    it("should update amount when HelcimPay is available", () => {
      const mockHelcim = createMockHelcimPay();
      window.HelcimPay = mockHelcim;

      updateHelcimAmount(75);

      expect(mockHelcim.setAmount).toHaveBeenCalledWith(75);
    });

    it("should not throw when HelcimPay is not available", () => {
      expect(() => updateHelcimAmount(75)).not.toThrow();
    });
  });

  describe("submitHelcimFields", () => {
    it("should validate and submit fields", async () => {
      const mockHelcim = createMockHelcimPay();
      window.HelcimPay = mockHelcim;

      const token = await submitHelcimFields();

      expect(mockHelcim.validate).toHaveBeenCalled();
      expect(mockHelcim.submit).toHaveBeenCalled();
      expect(token).toBe("card-token-123");
    });

    it("should throw when HelcimPay is not loaded", async () => {
      await expect(submitHelcimFields()).rejects.toThrow("HelcimPay.js not loaded");
    });

    it("should throw when validation fails", async () => {
      const mockHelcim = createMockHelcimPay();
      mockHelcim.validate.mockResolvedValue(false);
      window.HelcimPay = mockHelcim;

      await expect(submitHelcimFields()).rejects.toThrow("Please check your card details");
      expect(mockHelcim.submit).not.toHaveBeenCalled();
    });
  });
});
