import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useProfile } from "@/hooks/useProfile";
import { supabase, setMockResult, resetMockState } from "@/lib/supabase";
import { Logger } from "@/utils/logger";
import { useWithdrawals } from "./useWithdrawals";

// useProfile, supabase, and logger are all mocked via moduleNameMapper.
const mockUseProfile = useProfile as jest.Mock;

describe("useWithdrawals", () => {
  beforeEach(() => {
    resetMockState();
    mockUseProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    (Logger.error as jest.Mock).mockClear();
  });

  // ---------- No profile ----------

  it("returns empty withdrawals when profile is null", async () => {
    const { result } = renderHook(() => useWithdrawals());

    expect(result.current.withdrawals).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.requestWithdrawal).toBe("function");
  });

  // ---------- Successful fetch ----------

  it("fetches and returns withdrawal records when profile exists", async () => {
    const withdrawalData = [
      {
        id: "w1",
        amount: 500,
        status: "pending",
        created_at: "2024-06-01T00:00:00Z",
        processed_at: null,
      },
      {
        id: "w2",
        amount: 300,
        status: "approved",
        created_at: "2024-05-15T00:00:00Z",
        processed_at: "2024-05-16T00:00:00Z",
      },
    ];

    mockUseProfile.mockReturnValue({
      profile: {
        id: "charity-1",
        user_id: "u1",
        type: "charity",
        created_at: "2024-01-01",
      },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });

    setMockResult("withdrawal_requests", { data: withdrawalData, error: null });

    const { result } = renderHook(() => useWithdrawals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.withdrawals).toHaveLength(2);
    expect(result.current.withdrawals[0].id).toBe("w1");
    expect(result.current.withdrawals[1].status).toBe("approved");
    expect(result.current.error).toBeNull();
  });

  it("handles null data from supabase by setting empty array", async () => {
    mockUseProfile.mockReturnValue({
      profile: {
        id: "charity-1",
        user_id: "u1",
        type: "charity",
        created_at: "2024-01-01",
      },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });

    setMockResult("withdrawal_requests", { data: null, error: null });

    const { result } = renderHook(() => useWithdrawals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.withdrawals).toEqual([]);
  });

  // ---------- Fetch error ----------

  it("sets error when fetch fails", async () => {
    mockUseProfile.mockReturnValue({
      profile: {
        id: "charity-1",
        user_id: "u1",
        type: "charity",
        created_at: "2024-01-01",
      },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });

    setMockResult("withdrawal_requests", {
      data: null,
      error: { message: "db error" },
    });

    const { result } = renderHook(() => useWithdrawals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Error fetching withdrawals");
    expect(result.current.withdrawals).toEqual([]);
    expect(Logger.error).toHaveBeenCalled();
  });

  // ---------- Request withdrawal ----------

  it("adds a new withdrawal to the list on successful request", async () => {
    const existingWithdrawals = [
      {
        id: "w1",
        amount: 500,
        status: "pending",
        created_at: "2024-06-01T00:00:00Z",
        processed_at: null,
      },
    ];

    const newWithdrawal = {
      id: "w2",
      amount: 200,
      status: "pending",
      created_at: "2024-06-15T00:00:00Z",
      processed_at: null,
    };

    mockUseProfile.mockReturnValue({
      profile: {
        id: "charity-1",
        user_id: "u1",
        type: "charity",
        created_at: "2024-01-01",
      },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });

    setMockResult("withdrawal_requests", {
      data: existingWithdrawals,
      error: null,
    });

    const { result } = renderHook(() => useWithdrawals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.withdrawals).toHaveLength(1);

    // Override supabase.from to handle the insert call
    const origImpl = (supabase.from as jest.Mock).getMockImplementation();
    (supabase.from as jest.Mock).mockImplementation(() => {
      const chain = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({ data: newWithdrawal, error: null }),
            ),
          })),
        })),
        select: jest.fn(() => chain),
        eq: jest.fn(() => chain),
        order: jest.fn(() =>
          Promise.resolve({ data: existingWithdrawals, error: null }),
        ),
      };
      return chain;
    });

    await act(async () => {
      await result.current.requestWithdrawal(200);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // New withdrawal should be prepended to the list
    expect(result.current.withdrawals).toHaveLength(2);
    expect(result.current.withdrawals[0].id).toBe("w2");

    // Restore original mock
    if (origImpl) {
      (supabase.from as jest.Mock).mockImplementation(origImpl);
    }
  });

  it("does nothing when requestWithdrawal is called without a profile id", async () => {
    const { result } = renderHook(() => useWithdrawals());

    await act(async () => {
      await result.current.requestWithdrawal(100);
    });

    // Should not throw and withdrawals should remain empty
    expect(result.current.withdrawals).toEqual([]);
  });

  it("sets error and re-throws when requestWithdrawal fails", async () => {
    mockUseProfile.mockReturnValue({
      profile: {
        id: "charity-1",
        user_id: "u1",
        type: "charity",
        created_at: "2024-01-01",
      },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });

    setMockResult("withdrawal_requests", { data: [], error: null });

    const { result } = renderHook(() => useWithdrawals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Override supabase.from to make insert fail
    const origImpl = (supabase.from as jest.Mock).getMockImplementation();
    (supabase.from as jest.Mock).mockImplementation(() => {
      const chain = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: "insert failed" },
              }),
            ),
          })),
        })),
        select: jest.fn(() => chain),
        eq: jest.fn(() => chain),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      };
      return chain;
    });

    let caughtError: Error | undefined;
    await act(async () => {
      try {
        await result.current.requestWithdrawal(100);
      } catch (err) {
        caughtError = err as Error;
      }
    });

    expect(caughtError).toBeDefined();
    expect(result.current.error).toBe("Error requesting withdrawal");

    // Restore original mock
    if (origImpl) {
      (supabase.from as jest.Mock).mockImplementation(origImpl);
    }
  });

  // ---------- Return shape ----------

  it("exposes withdrawals, requestWithdrawal, loading, and error", () => {
    const { result } = renderHook(() => useWithdrawals());

    expect(result.current).toHaveProperty("withdrawals");
    expect(result.current).toHaveProperty("requestWithdrawal");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
  });
});
