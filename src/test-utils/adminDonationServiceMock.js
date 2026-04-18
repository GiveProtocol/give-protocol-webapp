// Mock for @/services/adminDonationService
// Mapped via moduleNameMapper — each export is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const listDonations = jest.fn(() => Promise.resolve({ donations: [], totalCount: 0, page: 1, limit: 50, totalPages: 0 }));
export const getDonationSummary = jest.fn(() => Promise.resolve([]));
export const flagDonation = jest.fn(() => Promise.resolve("flag-id-1"));
export const resolveFlag = jest.fn(() => Promise.resolve(true));
export const summaryToCsv = jest.fn(() => "");
