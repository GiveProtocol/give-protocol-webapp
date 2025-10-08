// TEMPORARY MOCK OVERRIDE - REMOVE FOR PRODUCTION
// This file overrides the useScheduledDonation hook to return mock data for testing

import { useState, useCallback } from "react";
import { Logger } from "@/utils/logger";

interface ScheduleParams {
  charityAddress: string;
  tokenAddress: string;
  totalAmount: string;
}

interface DonorSchedule {
  id: number;
  charity: string;
  charityName?: string;
  token: string;
  tokenSymbol?: string;
  totalAmount: string;
  amountPerMonth: string;
  monthsRemaining: number;
  nextDistribution: Date;
  active: boolean;
}

// Mock data for testing
const MOCK_SCHEDULES: DonorSchedule[] = [
  {
    id: 1,
    charity: "0x1234567890123456789012345678901234567890",
    charityName: "Clean Water Initiative",
    token: "0xAcc15dC74880C9944775448304B263D191c6077F",
    tokenSymbol: "WGLMR",
    totalAmount: "120.0",
    amountPerMonth: "10.0",
    monthsRemaining: 8,
    nextDistribution: "2025-08-31T00:58:09.389Z",
    active: true,
  },
  {
    id: 2,
    charity: "0x2345678901234567890123456789012345678901",
    charityName: "Education for All Foundation",
    token: "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
    tokenSymbol: "USDC",
    totalAmount: "360.0",
    amountPerMonth: "30.0",
    monthsRemaining: 5,
    nextDistribution: "2025-09-08T00:58:09.389Z",
    active: true,
  },
];

/**
 * Hook for managing scheduled charitable donations on the blockchain
 * @returns Object containing functions to create, cancel, and retrieve scheduled donations
 */
export function useScheduledDonation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSchedule = useCallback(
    async ({ charityAddress, tokenAddress, totalAmount }: ScheduleParams) => {
      setLoading(true);
      setError(null);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setLoading(false);
      Logger.info("Mock schedule created", {
        charityAddress,
        tokenAddress,
        totalAmount,
      });

      // Return mock transaction hash
      return "0x123456789abcdef...";
    },
    [],
  );

  const cancelSchedule = useCallback(async (scheduleId: number) => {
    setLoading(true);
    setError(null);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    Logger.info("Mock schedule cancelled", { scheduleId });

    // Return mock transaction hash
    return "0xabcdef123456789...";
  }, []);

  const getDonorSchedules = useCallback(async (): Promise<DonorSchedule[]> => {
    setLoading(true);
    setError(null);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);
    Logger.info("Retrieved mock scheduled donations", {
      count: MOCK_SCHEDULES.length,
    });

    // Convert date strings to Date objects
    return MOCK_SCHEDULES.map((schedule) => ({
      ...schedule,
      nextDistribution: new Date(schedule.nextDistribution),
    }));
  }, []);

  return {
    createSchedule,
    cancelSchedule,
    getDonorSchedules,
    loading,
    error,
  };
}
