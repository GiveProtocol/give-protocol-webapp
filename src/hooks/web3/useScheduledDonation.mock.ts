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
  token: string;
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
    token: "0xMockTokenAddress",
    totalAmount: "120.0",
    amountPerMonth: "10.0",
    monthsRemaining: 8,
    nextDistribution: "2025-08-31T00:58:09.389Z",
    active: true,
  },
  {
    id: 2,
    charity: "0x2345678901234567890123456789012345678901",
    token: "0xMockTokenAddress",
    totalAmount: "360.0",
    amountPerMonth: "30.0",
    monthsRemaining: 5,
    nextDistribution: "2025-09-08T00:58:09.389Z",
    active: true,
  },
];

/**
 * Mock implementation of useScheduledDonation hook for testing purposes
 * @returns Object containing functions to manage scheduled donations and state
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

    return MOCK_SCHEDULES;
  }, []);

  return {
    createSchedule,
    cancelSchedule,
    getDonorSchedules,
    loading,
    error,
  };
}
