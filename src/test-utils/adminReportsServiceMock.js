// Mock for @/services/adminReportsService
// Mapped via moduleNameMapper — each export is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const getCharityGrowthReport = jest.fn(() => Promise.resolve([]));
export const getDonorActivityReport = jest.fn(() => Promise.resolve([]));
export const getVolunteerReport = jest.fn(() => Promise.resolve([]));
export const getPlatformHealthSummary = jest.fn(() => Promise.resolve([]));
export const charityGrowthToCsv = jest.fn(() => "");
export const donorActivityToCsv = jest.fn(() => "");
export const volunteerReportToCsv = jest.fn(() => "");
export const platformHealthToCsv = jest.fn(() => "");
export const auditLogToCsv = jest.fn(() => "");
export const donationSummaryToCsv = jest.fn(() => "");
export const downloadReport = jest.fn();
