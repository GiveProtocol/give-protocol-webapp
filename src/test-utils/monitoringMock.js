import { jest } from "@jest/globals";

export const MonitoringService = {
  getInstance: jest.fn(() => ({
    trackError: jest.fn(),
    trackEvent: jest.fn(),
    setUser: jest.fn(),
  })),
};
