// Mock for @/config/chains
import { jest } from "@jest/globals";

export const getEVMChainConfig = jest.fn((chainId) => ({
  id: chainId,
  name: chainId === 1287 ? "Moonbase Alpha" : "Base",
  blockExplorerUrls:
    chainId === 1287
      ? ["https://moonbase.moonscan.io"]
      : ["https://basescan.org"],
}));

export const DEFAULT_EVM_CHAIN_ID = 8453;
