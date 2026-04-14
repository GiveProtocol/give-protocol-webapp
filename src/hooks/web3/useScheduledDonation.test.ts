import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { renderHook, act } from "@testing-library/react";
import { useScheduledDonation } from "./useScheduledDonation";
import { useWeb3 } from "@/contexts/Web3Context";

describe("useScheduledDonation", () => {
  beforeEach(() => {
    jest.mocked(useWeb3).mockReturnValue({
      provider: null,
      signer: null,
      address: null,
      chainId: 1287,
      isConnected: false,
      isConnecting: false,
      error: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchChain: jest.fn(),
    });
  });

  it("initial state has loading false and error null", () => {
    const { result } = renderHook(() => useScheduledDonation());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe("when wallet is not connected", () => {
    it("createSchedule throws Wallet not connected", async () => {
      const { result } = renderHook(() => useScheduledDonation());
      await expect(
        result.current.createSchedule({
          charityAddress: "0xabc",
          tokenAddress: "0xdef",
          totalAmount: "1.0",
        }),
      ).rejects.toThrow("Wallet not connected");
    });

    it("cancelSchedule throws Wallet not connected", async () => {
      const { result } = renderHook(() => useScheduledDonation());
      await expect(result.current.cancelSchedule(1)).rejects.toThrow(
        "Wallet not connected",
      );
    });

    it("getDonorSchedules returns empty array", async () => {
      const { result } = renderHook(() => useScheduledDonation());
      let schedules: Awaited<ReturnType<typeof result.current.getDonorSchedules>>;
      await act(async () => {
        schedules = await result.current.getDonorSchedules();
      });
      expect(schedules!).toEqual([]);
    });
  });

  describe("when wallet is connected with dummy dev contract address", () => {
    beforeEach(() => {
      const mockProvider = {
        getSigner: jest.fn<() => Promise<object>>().mockResolvedValue({}),
      };
      jest.mocked(useWeb3).mockReturnValue({
        provider: mockProvider as unknown as ReturnType<typeof useWeb3>["provider"],
        signer: null,
        address: "0xTestDonorAddress",
        chainId: 1287,
        isConnected: true,
        isConnecting: false,
        error: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        switchChain: jest.fn(),
      });
    });

    it("createSchedule throws dev mode error for dummy contract", async () => {
      const { result } = renderHook(() => useScheduledDonation());
      await act(async () => {
        await expect(
          result.current.createSchedule({
            charityAddress: "0xabc",
            tokenAddress: "0xdef",
            totalAmount: "1.0",
          }),
        ).rejects.toThrow(
          "Scheduled donations are not available in development mode.",
        );
      });
    });

    it("cancelSchedule throws dev mode error for dummy contract", async () => {
      const { result } = renderHook(() => useScheduledDonation());
      await act(async () => {
        await expect(result.current.cancelSchedule(1)).rejects.toThrow(
          "Scheduled donations are not available in development mode.",
        );
      });
    });

    it("getDonorSchedules returns empty array for dummy contract", async () => {
      const { result } = renderHook(() => useScheduledDonation());
      let schedules: Awaited<ReturnType<typeof result.current.getDonorSchedules>>;
      await act(async () => {
        schedules = await result.current.getDonorSchedules();
      });
      expect(schedules!).toEqual([]);
    });
  });
});
