import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderHook, act } from "@testing-library/react";
import { supabase } from "@/lib/supabase";
import { useAdminCharities } from "../useAdminCharities";

const mockRpc = supabase.rpc as ReturnType<
  typeof import("@jest/globals").jest.fn
>;

const makeMockRow = (overrides: Record<string, unknown> = {}) => ({
  id: "charity-1",
  user_id: "user-1",
  name: "Clean Water Foundation",
  category: "environment",
  logo_url: "https://example.com/logo.png",
  mission: "Provide clean water",
  verification_id: "ver-1",
  verification_status: "pending",
  review_notes: null,
  reviewed_at: null,
  wallet_address: "0xabc123",
  created_at: "2026-01-15T10:00:00Z",
  updated_at: "2026-01-15T10:00:00Z",
  total_count: 1,
  ...overrides,
});

describe("useAdminCharities", () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it("should return default empty result initially", () => {
    mockRpc.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useAdminCharities());

    expect(result.current.result).toEqual({
      charities: [],
      totalCount: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.updating).toBe(false);
  });

  describe("fetchCharities", () => {
    it("should call admin_list_charities RPC with correct params", async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useAdminCharities());

      await act(async () => {
        await result.current.fetchCharities({
          status: "pending",
          search: "water",
          page: 2,
          limit: 25,
        });
      });

      expect(mockRpc).toHaveBeenCalledWith(
        "admin_list_charities",
        expect.objectContaining({
          p_status: "pending",
          p_search: "water",
          p_page: 2,
          p_limit: 25,
        }),
      );
    });

    it("should update result state on success", async () => {
      mockRpc.mockResolvedValue({ data: [makeMockRow()], error: null });

      const { result } = renderHook(() => useAdminCharities());

      await act(async () => {
        await result.current.fetchCharities();
      });

      expect(result.current.result.charities).toHaveLength(1);
      expect(result.current.result.charities[0]).toMatchObject({
        id: "charity-1",
        name: "Clean Water Foundation",
        category: "environment",
        verificationStatus: "pending",
        walletAddress: "0xabc123",
      });
      expect(result.current.result.totalCount).toBe(1);
      expect(result.current.result.totalPages).toBe(1);
    });

    it("should set loading state", async () => {
      let resolveRpc: (_value: Record<string, unknown>) => void;
      const rpcPromise = new Promise<Record<string, unknown>>((resolve) => {
        resolveRpc = resolve;
      });
      mockRpc.mockReturnValue(rpcPromise);

      const { result } = renderHook(() => useAdminCharities());

      let fetchPromise: Promise<unknown>;
      act(() => {
        fetchPromise = result.current.fetchCharities();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveRpc!({ data: [], error: null });
        await fetchPromise!;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe("approveCharity", () => {
    it("should call admin_update_charity_status with verified status", async () => {
      mockRpc
        .mockResolvedValueOnce({ data: "ver-uuid-1", error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useAdminCharities());

      await act(async () => {
        await result.current.approveCharity("charity-1");
      });

      expect(mockRpc).toHaveBeenCalledWith("admin_update_charity_status", {
        p_charity_id: "charity-1",
        p_new_status: "verified",
        p_reason: null,
      });
    });
  });

  describe("rejectCharity", () => {
    it("should call admin_update_charity_status with rejected status and reason", async () => {
      mockRpc
        .mockResolvedValueOnce({ data: "ver-uuid-2", error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useAdminCharities());

      await act(async () => {
        await result.current.rejectCharity(
          "charity-1",
          "Incomplete documentation",
        );
      });

      expect(mockRpc).toHaveBeenCalledWith("admin_update_charity_status", {
        p_charity_id: "charity-1",
        p_new_status: "rejected",
        p_reason: "Incomplete documentation",
      });
    });
  });

  describe("suspendCharity", () => {
    it("should call admin_update_charity_status with suspended status", async () => {
      mockRpc
        .mockResolvedValueOnce({ data: "ver-uuid-3", error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useAdminCharities());

      await act(async () => {
        await result.current.suspendCharity("charity-1", "Policy violation");
      });

      expect(mockRpc).toHaveBeenCalledWith("admin_update_charity_status", {
        p_charity_id: "charity-1",
        p_new_status: "suspended",
        p_reason: "Policy violation",
      });
    });
  });

  describe("reinstateCharity", () => {
    it("should call admin_update_charity_status with verified status", async () => {
      mockRpc
        .mockResolvedValueOnce({ data: "ver-uuid-4", error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useAdminCharities());

      await act(async () => {
        await result.current.reinstateCharity("charity-1");
      });

      expect(mockRpc).toHaveBeenCalledWith("admin_update_charity_status", {
        p_charity_id: "charity-1",
        p_new_status: "verified",
        p_reason: null,
      });
    });
  });
});
