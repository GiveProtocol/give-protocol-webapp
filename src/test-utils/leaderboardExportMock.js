// Mock for @/utils/leaderboardExport
import { jest } from "@jest/globals";

export const exportLeaderboardToPDF = jest.fn(async () => {
  // Empty mock to prevent actual PDF export during tests
});
export const exportDonationLeaderboardToCSV = jest.fn();
export const exportVolunteerLeaderboardToCSV = jest.fn();
