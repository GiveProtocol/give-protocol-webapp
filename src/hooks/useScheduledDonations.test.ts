import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { useScheduledDonation } from "@/hooks/web3/useScheduledDonation";
import { Logger } from "@/utils/logger";
import { useScheduledDonations } from "./useScheduledDonations";

// Type the mock for per-test overrides
const mockUseScheduledDonation = useScheduledDonation as jest.Mock;

describe("useScheduledDonations", () => {
  beforeEach(() => {
    mockUseScheduledDonation.mockReturnValue({
      getDonorSchedules: jest
        .fn<() => Promise<unknown[]>>()
        .mockResolvedValue([]),
      cancelSchedule: jest.fn(),
      loading: false,
      error: null,
    });
    (Logger.error as jest.Mock).mockClear();
  });

  it("returns loading: true initially", () => {
    const { result } = renderHook(() => useScheduledDonations());
    expect(result.current.loading).toBe(true);
  });

  it("returns count: 0 and loading: false when no schedules exist", async () => {
    const { result } = renderHook(() => useScheduledDonations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.count).toBe(0);
  });

  it("counts only active schedules", async () => {
    const schedules = [
      { id: "1", active: true },
      { id: "2", active: false },
      { id: "3", active: true },
    ];
    mockUseScheduledDonation.mockReturnValue({
      getDonorSchedules: jest
        .fn<() => Promise<unknown[]>>()
        .mockResolvedValue(schedules),
      cancelSchedule: jest.fn(),
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useScheduledDonations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.count).toBe(2);
  });

  it("sets count to 0 and logs on error", async () => {
    mockUseScheduledDonation.mockReturnValue({
      getDonorSchedules: jest
        .fn<() => Promise<never>>()
        .mockRejectedValue(new Error("network failure")),
      cancelSchedule: jest.fn(),
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useScheduledDonations());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.count).toBe(0);
    expect(Logger.error).toHaveBeenCalledWith(
      "useScheduledDonations failed",
      expect.objectContaining({ error: expect.any(Error) }),
    );
  });

  it("does not update state after unmount", async () => {
    // Use a deferred promise so we can unmount before it resolves
    let resolveSchedules!: (v: unknown[]) => void;
    const deferred = new Promise<unknown[]>((resolve) => {
      resolveSchedules = resolve;
    });
    mockUseScheduledDonation.mockReturnValue({
      getDonorSchedules: jest
        .fn<() => Promise<unknown[]>>()
        .mockReturnValue(deferred),
      cancelSchedule: jest.fn(),
      loading: false,
      error: null,
    });

    const { result, unmount } = renderHook(() => useScheduledDonations());
    unmount();
    // Resolve after unmount -- should not cause a React state update warning
    resolveSchedules([{ id: "1", active: true }]);
    // The count should remain at initial value (0)
    expect(result.current.count).toBe(0);
  });
});
