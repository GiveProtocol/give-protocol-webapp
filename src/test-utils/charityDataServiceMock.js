// Mock for @/services/charityDataService
// Mapped via moduleNameMapper — each export is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const getCharityRecordByEin = jest.fn(() => Promise.resolve(null));
export const submitRemovalRequest = jest.fn(() => Promise.resolve(false));
export const submitCharityRequest = jest.fn(() => Promise.resolve(false));
export const hasUserRequestedCharity = jest.fn(() => Promise.resolve(false));
