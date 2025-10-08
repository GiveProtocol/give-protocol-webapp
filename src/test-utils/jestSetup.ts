
/**
 * Common Jest mock configurations
 * This file provides reusable mock objects to eliminate duplication across test files
 */

/**
 * Standard mock implementations for common utilities
 */
export const commonMocks = {
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
  formatDate: jest.fn((date: string) => new Date(date).toLocaleDateString()),
  shortenAddress: jest.fn((address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`
  ),
};

/**
 * Standard mock factories for hooks
 */
export const createHookMocks = () => ({
  web3: {
    address: null,
    chainId: null,
    isConnected: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    switchChain: jest.fn(),
  },
  auth: {
    user: null,
    signOut: jest.fn(),
  },
  wallet: {
    getInstalledWallets: jest.fn(() => [
      { name: 'MetaMask', id: 'metamask' },
      { name: 'WalletConnect', id: 'walletconnect' },
    ]),
    connectWallet: jest.fn(),
  },
  walletAlias: {
    alias: null,
    aliases: {},
    isLoading: false,
    loading: false,
    error: null,
    setWalletAlias: jest.fn(),
    deleteWalletAlias: jest.fn(),
  },
  volunteerVerification: {
    verifyHours: jest.fn(),
    acceptApplication: jest.fn(),
    loading: false,
    error: null,
  },
  translation: {
    t: jest.fn((key: string, fallback?: string) => fallback || key),
  },
});

/**
 * Note: Component mocks have been moved to mockSetup.ts to eliminate duplication.
 * Use MockButton, MockInput, MockCard from @/test-utils/mockSetup instead.
 */