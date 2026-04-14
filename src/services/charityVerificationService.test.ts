import { describe, it, expect, beforeEach } from "@jest/globals";
import { supabase } from "@/lib/supabase";
import { getCharityVerificationStatus } from "./charityVerificationService";

const mockRpc = supabase.rpc as ReturnType<
  typeof import("@jest/globals").jest.fn
>;

describe("charityVerificationService", () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  describe("getCharityVerificationStatus", () => {
    it("should return null for empty userId without calling RPC", async () => {
      const result = await getCharityVerificationStatus("");
      expect(result).toBeNull();
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it("should call RPC with correct params", async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });

      await getCharityVerificationStatus("user-123");

      expect(mockRpc).toHaveBeenCalledWith("get_charity_verification_status", {
        p_user_id: "user-123",
      });
    });

    it("should return status and reviewNotes when RPC returns a row", async () => {
      mockRpc.mockResolvedValue({
        data: [{ status: "pending", review_notes: null }],
        error: null,
      });

      const result = await getCharityVerificationStatus("user-1");

      expect(result).toEqual({ status: "pending", reviewNotes: null });
    });

    it("should return reviewNotes when present", async () => {
      mockRpc.mockResolvedValue({
        data: [
          { status: "rejected", review_notes: "Incomplete documentation" },
        ],
        error: null,
      });

      const result = await getCharityVerificationStatus("user-1");

      expect(result).toEqual({
        status: "rejected",
        reviewNotes: "Incomplete documentation",
      });
    });

    it("should return null when RPC returns empty array", async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });

      const result = await getCharityVerificationStatus("user-1");

      expect(result).toBeNull();
    });

    it("should return null when RPC returns null data", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      const result = await getCharityVerificationStatus("user-1");

      expect(result).toBeNull();
    });

    it("should return null on RPC error", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Permission denied" },
      });

      const result = await getCharityVerificationStatus("user-1");

      expect(result).toBeNull();
    });

    it("should return null when RPC throws", async () => {
      mockRpc.mockRejectedValue(new Error("Network error"));

      const result = await getCharityVerificationStatus("user-1");

      expect(result).toBeNull();
    });

    it("should handle suspended status with review notes", async () => {
      mockRpc.mockResolvedValue({
        data: [{ status: "suspended", review_notes: "Terms violation" }],
        error: null,
      });

      const result = await getCharityVerificationStatus("user-2");

      expect(result).toEqual({
        status: "suspended",
        reviewNotes: "Terms violation",
      });
    });

    it("should handle approved status", async () => {
      mockRpc.mockResolvedValue({
        data: [{ status: "approved", review_notes: null }],
        error: null,
      });

      const result = await getCharityVerificationStatus("user-3");

      expect(result).toEqual({ status: "approved", reviewNotes: null });
    });
  });
});
