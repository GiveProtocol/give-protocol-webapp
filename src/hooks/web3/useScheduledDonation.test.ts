import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { renderHook, act } from "@testing-library/react";
import { useScheduledDonation } from "./useScheduledDonation";
import { useWeb3 } from "@/contexts/Web3Context";
import { ethers } from "ethers";
import { getContractAddress } from "@/config/contracts";

// Real Moonbase Alpha contract address (non-dummy) for tests that reach contract call path
const REAL_CONTRACT_ADDRESS = "0xabcdef1234567890123456789012345678abcdef";

describe("useScheduledDonation", () => {
  beforeEach(() => {
    jest.mocked(getContractAddress).mockReturnValue(
      "0x1234567890123456789012345678901234567890",
    );
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

  describe("when wallet is connected with real contract address", () => {
    const mockCancelScheduleFn = jest.fn();
    const mockGetDonorSchedulesFn = jest.fn();

    beforeEach(() => {
      jest.mocked(getContractAddress).mockReturnValue(REAL_CONTRACT_ADDRESS);

      const mockSigner = {};
      const mockProvider = {
        getSigner: jest.fn<() => Promise<object>>().mockResolvedValue(mockSigner),
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

      (ethers.Contract as jest.Mock).mockImplementation(() => ({
        cancelSchedule: mockCancelScheduleFn,
        getDonorSchedules: mockGetDonorSchedulesFn,
        donationSchedules: jest.fn(),
      }));
    });

    it("cancelSchedule throws user-friendly message on wallet rejection (code 4001)", async () => {
      const rejectionError = Object.assign(new Error("user rejected transaction"), { code: 4001 });
      mockCancelScheduleFn.mockRejectedValue(rejectionError);

      const { result } = renderHook(() => useScheduledDonation());
      await act(async () => {
        await expect(result.current.cancelSchedule(42)).rejects.toThrow(
          "Transaction was rejected. Please confirm the transaction in your wallet to cancel your donation schedule.",
        );
      });
    });

    it("cancelSchedule throws user-friendly message on user rejected message", async () => {
      const rejectionError = new Error("MetaMask: user rejected");
      mockCancelScheduleFn.mockRejectedValue(rejectionError);

      const { result } = renderHook(() => useScheduledDonation());
      await act(async () => {
        await expect(result.current.cancelSchedule(42)).rejects.toThrow(
          "Transaction was rejected. Please confirm the transaction in your wallet to cancel your donation schedule.",
        );
      });
    });

    it("cancelSchedule re-throws non-rejection contract errors (e.g. gas failure)", async () => {
      const gasError = new Error("gas estimation failed: out of gas");
      mockCancelScheduleFn.mockRejectedValue(gasError);

      const { result } = renderHook(() => useScheduledDonation());
      await act(async () => {
        await expect(result.current.cancelSchedule(42)).rejects.toThrow(
          "gas estimation failed: out of gas",
        );
      });
    });

    it("getDonorSchedules returns empty array when contract returns decode error", async () => {
      mockGetDonorSchedulesFn.mockRejectedValue(
        new Error("could not decode result data (value=\"0x\", info={ method: \"getDonorSchedules\" })"),
      );

      const { result } = renderHook(() => useScheduledDonation());
      let schedules: Awaited<ReturnType<typeof result.current.getDonorSchedules>>;
      await act(async () => {
        schedules = await result.current.getDonorSchedules();
      });
      expect(schedules!).toEqual([]);
    });
  });
});
