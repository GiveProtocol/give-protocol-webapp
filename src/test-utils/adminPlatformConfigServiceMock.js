// Mock for @/services/adminPlatformConfigService
// Mapped via moduleNameMapper — each export is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const configKeyLabel = jest.fn((key) => key);
export const configValueInputType = jest.fn(() => "number");
export const getConfig = jest.fn(() => Promise.resolve([]));
export const updateConfig = jest.fn(() => Promise.resolve(true));
export const getConfigAudit = jest.fn(() => Promise.resolve([]));
