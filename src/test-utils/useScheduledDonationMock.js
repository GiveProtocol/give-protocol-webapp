// Mock for @/hooks/web3/useScheduledDonation
// Mapped via moduleNameMapper — useScheduledDonation is a jest.fn() so tests
// can call mockReturnValue to provide per-test schedules/state.
import { jest } from "@jest/globals";

export const useScheduledDonation = jest.fn(() => ({
  getDonorSchedules: jest.fn().mockResolvedValue([]),
  cancelSchedule: jest.fn(),
  loading: false,
  error: null,
}));
