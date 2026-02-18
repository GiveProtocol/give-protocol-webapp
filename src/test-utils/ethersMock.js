// Global mock for ethers module to prevent ESM module cache issues
// Mapped via moduleNameMapper to intercept all ethers imports in tests

import { jest } from "@jest/globals";

// Shared mock functions that individual tests can configure
export const mockLatestRoundData = jest.fn();
export const mockDecimals = jest.fn();

export const ethers = {
  Contract: jest.fn().mockImplementation(() => ({
    latestRoundData: mockLatestRoundData,
    decimals: mockDecimals,
  })),
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    _isProvider: true,
  })),
  formatUnits: (value, decimals) => {
    return (Number(value) / Math.pow(10, Number(decimals))).toString();
  },
};

// Reset helpers for use in beforeEach
export const resetEthersMock = () => {
  mockLatestRoundData.mockReset();
  mockDecimals.mockReset();
  ethers.Contract.mockClear();
  ethers.JsonRpcProvider.mockClear();
};
