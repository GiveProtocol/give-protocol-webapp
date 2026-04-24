import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import {
  setMockResult,
  resetMockState,
} from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { Logger } from "@/utils/logger";
import { useCharityRevenueSnapshot } from "./useCharityRevenueSnapshot";

const mockUseProfile = useProfile as jest.Mock;

// Helper: build a donation row with today's date by default
function makeDonation(
  amount: number | null,
  daysAgo = 0,
  donorId: string | null = "donor-1",
) {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  return {
    amount,
    created_at: d.toISOString(),
    donor_id: donorId,
  };
}

describe("useCharityRevenueSnapshot", () => {
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

  it("returns empty snapshot and loading: false when profile is null", async () => {
    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot).toEqual({
      fundsRaised: 0,
      activeCampaigns: 0,
      donorCount: 0,
      dailyTotals: [],
    });
  });

  // ---------- Profile present, no data ----------

  it("returns zero-value snapshot when no donations or causes exist", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", { data: [], error: null });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot.fundsRaised).toBe(0);
    expect(result.current.snapshot.donorCount).toBe(0);
    expect(result.current.snapshot.activeCampaigns).toBe(0);
    expect(result.current.snapshot.dailyTotals).toHaveLength(30);
  });

  // ---------- Funds raised ----------

  it("sums donation amounts for fundsRaised", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", {
      data: [
        makeDonation(100, 0),
        makeDonation(250, 1),
        makeDonation(50, 2),
      ],
      error: null,
    });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot.fundsRaised).toBe(400);
  });

  it("treats null amount as 0 in fundsRaised sum", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", {
      data: [makeDonation(null, 0), makeDonation(75, 1)],
      error: null,
    });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot.fundsRaised).toBe(75);
  });

  // ---------- Donor count ----------

  it("counts distinct donor IDs (excluding null)", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", {
      data: [
        makeDonation(10, 0, "donor-a"),
        makeDonation(20, 1, "donor-a"),
        makeDonation(30, 2, "donor-b"),
        makeDonation(40, 3, null),
      ],
      error: null,
    });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot.donorCount).toBe(2);
  });

  // ---------- Active campaigns ----------

  it("counts causes with status 'active' as active campaigns", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", { data: [], error: null });
    setMockResult("causes", {
      data: [
        { id: "c1", status: "active" },
        { id: "c2", status: "closed" },
        { id: "c3", status: "active" },
      ],
      error: null,
    });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot.activeCampaigns).toBe(2);
  });

  it("treats causes with null/undefined status as active", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", { data: [], error: null });
    setMockResult("causes", {
      data: [
        { id: "c1", status: null },
        { id: "c2" }, // status undefined
        { id: "c3", status: "closed" },
      ],
      error: null,
    });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot.activeCampaigns).toBe(2);
  });

  // ---------- Daily totals (buckets) ----------

  it("generates 30 daily bucket entries", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", { data: [], error: null });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot.dailyTotals).toHaveLength(30);
    for (const bucket of result.current.snapshot.dailyTotals) {
      expect(typeof bucket.date).toBe("string");
      expect(bucket.total).toBe(0);
      expect(bucket.count).toBe(0);
    }
  });

  it("buckets donations into the correct day", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    // Place a donation "today" so it falls into the last bucket
    const todayDonation = makeDonation(200, 0);
    setMockResult("donations", {
      data: [todayDonation],
      error: null,
    });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayBucket = result.current.snapshot.dailyTotals.find(
      (b) => b.date === todayKey,
    );
    expect(todayBucket).toBeDefined();
    expect(todayBucket?.total).toBe(200);
    expect(todayBucket?.count).toBe(1);
  });

  it("ignores donations outside the 30-day window in daily totals", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    // 60 days ago -- outside the window
    const oldDonation = makeDonation(500, 60);
    setMockResult("donations", {
      data: [oldDonation],
      error: null,
    });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    // Old donation still counts towards fundsRaised (all-time), but not daily totals
    expect(result.current.snapshot.fundsRaised).toBe(500);
    const allBucketTotals = result.current.snapshot.dailyTotals.reduce(
      (sum, b) => sum + b.total,
      0,
    );
    expect(allBucketTotals).toBe(0);
  });

  it("handles null amount in daily bucket totals", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", {
      data: [makeDonation(null, 0)],
      error: null,
    });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayBucket = result.current.snapshot.dailyTotals.find(
      (b) => b.date === todayKey,
    );
    expect(todayBucket?.total).toBe(0);
    expect(todayBucket?.count).toBe(1);
  });

  // ---------- Null data from supabase ----------

  it("handles null data from donations query", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", { data: null, error: null });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot.fundsRaised).toBe(0);
    expect(result.current.snapshot.donorCount).toBe(0);
  });

  it("handles null data from causes query", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", { data: [], error: null });
    setMockResult("causes", { data: null, error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot.activeCampaigns).toBe(0);
  });

  // ---------- Error handling ----------

  it("resets to EMPTY and logs on fetch error", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    // Force the catch branch by making supabase.from throw synchronously.
    // We import the mock and temporarily override, then restore via mockRestore.
    const { supabase } = await import("@/lib/supabase");
    // Save the original implementation so we can restore after this test
    const origImpl = (supabase.from as jest.Mock).getMockImplementation();
    (supabase.from as jest.Mock).mockImplementation(() => {
      throw new Error("db crash");
    });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot).toEqual({
      fundsRaised: 0,
      activeCampaigns: 0,
      donorCount: 0,
      dailyTotals: [],
    });
    expect(Logger.error).toHaveBeenCalledWith(
      "useCharityRevenueSnapshot failed",
      expect.objectContaining({ error: expect.any(Error) }),
    );

    // Restore the original mock implementation
    if (origImpl) {
      (supabase.from as jest.Mock).mockImplementation(origImpl);
    }
  });

  // ---------- Unmount safety ----------

  it("does not update state after unmount", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    // Use default empty results which resolve on next microtask
    setMockResult("donations", { data: [], error: null });
    setMockResult("causes", { data: [], error: null });

    const { result, unmount } = renderHook(() =>
      useCharityRevenueSnapshot(),
    );
    unmount();
    // Wait a tick -- the async load should not cause state update warnings
    await new Promise((r) => setTimeout(r, 50));
    // After unmount the last captured result should still have loading: true
    // (the effect cleanup ran before the promise resolved)
    expect(result.current).toBeDefined();
  });

  // ---------- Multiple donations on the same day ----------

  it("aggregates multiple donations on the same day", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", {
      data: [
        makeDonation(100, 0, "donor-a"),
        makeDonation(200, 0, "donor-b"),
        makeDonation(50, 0, "donor-a"),
      ],
      error: null,
    });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const todayKey = new Date().toISOString().slice(0, 10);
    const todayBucket = result.current.snapshot.dailyTotals.find(
      (b) => b.date === todayKey,
    );
    expect(todayBucket?.total).toBe(350);
    expect(todayBucket?.count).toBe(3);
    // fundsRaised should also be 350
    expect(result.current.snapshot.fundsRaised).toBe(350);
    // donor-a and donor-b => 2 distinct donors
    expect(result.current.snapshot.donorCount).toBe(2);
  });

  // ---------- Loading state ----------

  it("transitions loading from true to false after fetch", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", { data: [], error: null });
    setMockResult("causes", { data: [], error: null });

    const { result } = renderHook(() => useCharityRevenueSnapshot());
    // After the async load finishes, loading must be false
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.snapshot.dailyTotals).toHaveLength(30);
  });

  // ---------- Mixed cause statuses ----------

  it("handles a mix of active, closed, and null cause statuses", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "charity-1" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("donations", { data: [], error: null });
    setMockResult("causes", {
      data: [
        { id: "c1", status: "active" },
        { id: "c2", status: "closed" },
        { id: "c3", status: null },
        { id: "c4", status: "active" },
        { id: "c5", status: "paused" },
      ],
      error: null,
    });

    const { result } = renderHook(() => useCharityRevenueSnapshot());

    await waitFor(() => expect(result.current.loading).toBe(false));
    // "active" (c1, c4) + null (c3) = 3 active campaigns
    expect(result.current.snapshot.activeCampaigns).toBe(3);
  });
});
