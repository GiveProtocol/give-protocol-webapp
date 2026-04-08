import { jest } from "@jest/globals";

export const useWallet = jest.fn(() => ({
  getInstalledWallets: jest.fn(() => []),
  connectWallet: jest.fn(),
}));

export const useUnifiedWallets = jest.fn(() => ({
  wallets: [
    {
      name: "Phantom",
      icon: "phantom",
      category: "multichain",
      supportedChainTypes: ["evm", "solana"],
      isInstalled: () => true,
    },
    {
      name: "MetaMask",
      icon: "metamask",
      category: "browser",
      supportedChainTypes: ["evm"],
      isInstalled: () => true,
    },
  ],
  isLoading: false,
}));
