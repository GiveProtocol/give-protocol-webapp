// Mock for @/contexts/MultiChainContext
// Mapped via moduleNameMapper so all MultiChainContext imports get this mock.
// useMultiChainContext is a jest.fn() so tests can call mockReturnValue to override per-test.
import { jest } from "@jest/globals";

export const useMultiChainContext = jest.fn(() => ({
  wallet: null,
  accounts: [],
  activeAccount: null,
  activeChainType: "evm",
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: jest.fn(),
  disconnect: jest.fn(),
  switchAccount: jest.fn(),
  switchChainType: jest.fn(),
  switchChain: jest.fn(),
  clearError: jest.fn(),
}));

/** Mock MultiChainProvider pass-through */
export const MultiChainProvider = ({ children }) => children;
