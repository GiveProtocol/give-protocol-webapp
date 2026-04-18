// Mock for @/services/adminPlatformConfigService
import { jest } from "@jest/globals";

export const getConfig = jest.fn(() => Promise.resolve([]));
export const updateConfig = jest.fn(() => Promise.resolve(true));
export const getConfigAudit = jest.fn(() => Promise.resolve([]));
export const configKeyLabel = jest.fn((key) => key);
export const configValueInputType = jest.fn(() => "number");
