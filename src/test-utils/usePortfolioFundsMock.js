// Mock for @/hooks/web3/usePortfolioFunds
// Mapped via moduleNameMapper — usePortfolioFunds is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const usePortfolioFunds = jest.fn(() => ({
  donateToFund: jest.fn(),
  donateNativeToFund: jest.fn(),
  claimFunds: jest.fn(),
  getAllFunds: jest.fn(() => Promise.resolve([])),
  getFundDetails: jest.fn(() => Promise.resolve(null)),
  getCharityClaimableAmount: jest.fn(() => Promise.resolve("0")),
  getCharityInfo: jest.fn(() => Promise.resolve(null)),
  getPlatformFee: jest.fn(() => Promise.resolve(100)),
  loading: false,
  error: null,
  contract: null,
}));
