import { describe, it, expect } from "@jest/globals";
import {
  isEVMChain,
  isSolanaChain,
  isPolkadotChain,
  type AnyChainConfig,
} from "./chains";

const evmConfig: AnyChainConfig = {
  type: "evm",
  id: 8453,
  name: "Base",
  shortName: "base",
  isTestnet: false,
  iconPath: "/chains/base.svg",
  color: "#0052FF",
  description: "Base L2",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
  ecosystem: "Ethereum L2",
};

const solanaConfig: AnyChainConfig = {
  type: "solana",
  id: "mainnet-beta",
  name: "Solana",
  shortName: "sol",
  isTestnet: false,
  iconPath: "/chains/solana.svg",
  color: "#9945FF",
  description: "Solana mainnet",
  cluster: "mainnet-beta",
  rpcUrl: "https://api.mainnet-beta.solana.com",
  wsUrl: "wss://api.mainnet-beta.solana.com",
  explorerUrl: "https://explorer.solana.com",
};

const polkadotConfig: AnyChainConfig = {
  type: "polkadot",
  id: "polkadot",
  name: "Polkadot",
  shortName: "dot",
  isTestnet: false,
  iconPath: "/chains/polkadot.svg",
  color: "#E6007A",
  description: "Polkadot relay chain",
  ss58Prefix: 0,
  wsEndpoint: "wss://rpc.polkadot.io",
  nativeToken: { name: "DOT", symbol: "DOT", decimals: 10 },
  explorerUrl: "https://polkadot.subscan.io",
};

describe("chain type guards", () => {
  describe("isEVMChain", () => {
    it("should return true for EVM config", () => {
      expect(isEVMChain(evmConfig)).toBe(true);
    });

    it("should return false for non-EVM configs", () => {
      expect(isEVMChain(solanaConfig)).toBe(false);
      expect(isEVMChain(polkadotConfig)).toBe(false);
    });
  });

  describe("isSolanaChain", () => {
    it("should return true for Solana config", () => {
      expect(isSolanaChain(solanaConfig)).toBe(true);
    });

    it("should return false for non-Solana configs", () => {
      expect(isSolanaChain(evmConfig)).toBe(false);
      expect(isSolanaChain(polkadotConfig)).toBe(false);
    });
  });

  describe("isPolkadotChain", () => {
    it("should return true for Polkadot config", () => {
      expect(isPolkadotChain(polkadotConfig)).toBe(true);
    });

    it("should return false for non-Polkadot configs", () => {
      expect(isPolkadotChain(evmConfig)).toBe(false);
      expect(isPolkadotChain(solanaConfig)).toBe(false);
    });
  });
});
