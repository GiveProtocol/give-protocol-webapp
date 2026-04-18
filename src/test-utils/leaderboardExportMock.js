// Mock for @/utils/leaderboardExport
import { jest } from "@jest/globals";

export const exportLeaderboardToPDF = jest.fn().mockResolvedValue(undefined);
export const exportDonationLeaderboardToCSV = jest.fn();
export const exportVolunteerLeaderboardToCSV = jest.fn();
