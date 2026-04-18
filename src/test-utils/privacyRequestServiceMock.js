// Mock for @/services/privacyRequestService
import { jest } from "@jest/globals";

export const requestDataExport = jest.fn(() => Promise.resolve({ requestId: "req-1", status: "pending" }));
export const getExportStatus = jest.fn(() => Promise.resolve(null));
export const requestAccountErasure = jest.fn(() => Promise.resolve({ requestId: "era-1", status: "pending" }));
export const cancelErasureRequest = jest.fn(() => Promise.resolve({ requestId: "era-1", status: "cancelled" }));
export const getActiveErasureRequest = jest.fn(() => Promise.resolve(null));
export const getMostRecentExportRequest = jest.fn(() => Promise.resolve(null));
