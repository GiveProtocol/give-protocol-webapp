import { jest } from "@jest/globals";
import { renderHook, act } from "@testing-library/react";
import { useOnboarding } from "../useOnboarding";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      const { [key]: _, ...rest } = store;
      store = rest;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("useOnboarding", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("shows chain selection when onboarding not completed", () => {
      const { result } = renderHook(() => useOnboarding());

      // Wait for useEffect to run
      expect(result.current.hasCompletedOnboarding).toBe(false);
      expect(result.current.showChainSelection).toBe(true);
    });

    it("hides chain selection when onboarding already completed", () => {
      localStorageMock.setItem("giveprotocol_onboarding_complete", "true");

      const { result } = renderHook(() => useOnboarding());

      expect(result.current.hasCompletedOnboarding).toBe(true);
      expect(result.current.showChainSelection).toBe(false);
    });
  });

  describe("completeOnboarding", () => {
    it("persists completion to localStorage", () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.completeOnboarding();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "giveprotocol_onboarding_complete",
        "true",
      );
    });

    it("updates state after completion", () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.completeOnboarding();
      });

      expect(result.current.hasCompletedOnboarding).toBe(true);
      expect(result.current.showChainSelection).toBe(false);
    });
  });

  describe("resetOnboarding", () => {
    it("removes completion from localStorage", () => {
      localStorageMock.setItem("giveprotocol_onboarding_complete", "true");
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.resetOnboarding();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "giveprotocol_onboarding_complete",
      );
    });

    it("updates state after reset", () => {
      localStorageMock.setItem("giveprotocol_onboarding_complete", "true");
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.resetOnboarding();
      });

      expect(result.current.hasCompletedOnboarding).toBe(false);
      expect(result.current.showChainSelection).toBe(true);
    });
  });

  describe("return values", () => {
    it("returns stable callback references", () => {
      const { result, rerender } = renderHook(() => useOnboarding());

      const completeOnboarding1 = result.current.completeOnboarding;
      const resetOnboarding1 = result.current.resetOnboarding;

      rerender();

      expect(result.current.completeOnboarding).toBe(completeOnboarding1);
      expect(result.current.resetOnboarding).toBe(resetOnboarding1);
    });
  });
});
