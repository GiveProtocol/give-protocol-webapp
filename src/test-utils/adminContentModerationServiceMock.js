// Mock for @/services/adminContentModerationService
// Mapped via moduleNameMapper — each export is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const listOpportunities = jest.fn(() =>
  Promise.resolve({
    opportunities: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  }),
);

export const listCauses = jest.fn(() =>
  Promise.resolve({
    causes: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  }),
);

export const moderateContent = jest.fn(() => Promise.resolve("audit-id-1"));
export const cascadeCharityModeration = jest.fn(() => Promise.resolve(null));
