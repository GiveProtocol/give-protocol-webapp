import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { ConnectButton } from "../ConnectButton";
import { renderWithRouter } from "@/test-utils/testHelpers";
import { testAddresses } from "@/test-utils/mockSetup";

// Mock modules before imports
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockSwitchChain = jest.fn();
const mockMultiChainConnect = jest.fn();
const mockMultiChainDisconnect = jest.fn();

// Default mock values
const defaultWeb3Mock = {
  provider: null,
  signer: null,
  address: null,
  chainId: 1287,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: mockConnect,
  disconnect: mockDisconnect,
  switchChain: mockSwitchChain,
};

const defaultMultiChainMock = {
  wallet: null,
  accounts: [],
  activeAccount: null,
  activeChainType: "evm" as const,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: mockMultiChainConnect,
  disconnect: mockMultiChainDisconnect,
  switchAccount: jest.fn(),
  switchChainType: jest.fn(),
  switchChain: jest.fn(),
  clearError: jest.fn(),
};

let web3MockValue = { ...defaultWeb3Mock };
let multiChainMockValue = { ...defaultMultiChainMock };
let walletAliasMockValue = { alias: null, setAlias: jest.fn(), isLoading: false };

jest.mock("@/contexts/Web3Context", () => ({
  useWeb3: () => web3MockValue,
}));

jest.mock("@/contexts/MultiChainContext", () => ({
  useMultiChainContext: () => multiChainMockValue,
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    logout: jest.fn(),
    signOut: jest.fn(),
  }),
}));

jest.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({
    getInstalledWallets: () => [
      { name: "MetaMask", id: "metamask", icon: "metamask" },
      { name: "WalletConnect", id: "walletconnect", icon: "walletconnect" },
    ],
    connectWallet: jest.fn(),
  }),
  useUnifiedWallets: () => ({
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
  }),
}));

jest.mock("@/hooks/useWalletAlias", () => ({
  useWalletAlias: () => walletAliasMockValue,
}));

jest.mock("@/utils/web3", () => ({
  shortenAddress: (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`,
}));

jest.mock("@/utils/logger", () => ({
  Logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock("@/config/contracts", () => ({
  CHAIN_IDS: {
    MOONBASE: 1287,
    BASE: 8453,
  },
  CHAIN_CONFIGS: {
    1287: { name: "Moonbase Alpha", blockExplorerUrls: ["https://moonbase.moonscan.io"] },
    8453: { name: "Base", blockExplorerUrls: ["https://basescan.org"] },
  },
}));

jest.mock("@/config/chains", () => ({
  getEVMChainConfig: (chainId: number) => ({
    id: chainId,
    name: chainId === 1287 ? "Moonbase Alpha" : "Base",
    blockExplorerUrls: chainId === 1287 ? ["https://moonbase.moonscan.io"] : ["https://basescan.org"],
  }),
  DEFAULT_EVM_CHAIN_ID: 8453,
}));

describe("ConnectButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock values
    web3MockValue = { ...defaultWeb3Mock };
    multiChainMockValue = { ...defaultMultiChainMock };
    walletAliasMockValue = { alias: null, setAlias: jest.fn(), isLoading: false };
  });

  describe("when wallet is not connected", () => {
    it("renders connect button", () => {
      renderWithRouter(<ConnectButton />);

      expect(screen.getByText("Connect")).toBeInTheDocument();
    });

    it("shows wallet modal when connect button is clicked", async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText("Connect"));
      await waitFor(() => {
        expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
      });
    });

    it("shows chain type tabs in modal", async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText("Connect"));
      await waitFor(() => {
        // Chain type tabs are rendered - there may be multiple elements with these texts
        // (tabs and wallet badges), so we use getAllByText
        expect(screen.getAllByText("EVM").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("Solana").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("Polkadot").length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("when wallet is connected", () => {
    beforeEach(() => {
      web3MockValue = {
        ...defaultWeb3Mock,
        address: testAddresses.mainWallet,
        chainId: 1287,
        isConnected: true,
      };
      multiChainMockValue = {
        ...defaultMultiChainMock,
        isConnected: true,
        activeAccount: {
          id: "test-account",
          address: testAddresses.mainWallet,
          chainType: "evm" as const,
          chainId: 1287,
          chainName: "Moonbase Alpha",
          source: "MetaMask",
        },
      };
    });

    it("renders wallet address button", () => {
      renderWithRouter(<ConnectButton />);

      expect(screen.getByText(testAddresses.shortAddress)).toBeInTheDocument();
    });

    it("shows account menu when wallet button is clicked", async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText(testAddresses.shortAddress));

      await waitFor(() => {
        expect(screen.getByText("Set Wallet Alias")).toBeInTheDocument();
        expect(screen.getByText("Disconnect")).toBeInTheDocument();
      });
    });

    it("shows chain name in account dropdown", async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText(testAddresses.shortAddress));

      await waitFor(() => {
        expect(screen.getByText("Moonbase Alpha")).toBeInTheDocument();
      });
    });

    it("calls disconnect when disconnect is clicked", async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText(testAddresses.shortAddress));

      await waitFor(() => {
        expect(screen.getByText("Disconnect")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Disconnect"));

      await waitFor(() => {
        expect(mockMultiChainDisconnect).toHaveBeenCalled();
      });
    });
  });

  describe("with wallet alias", () => {
    beforeEach(() => {
      web3MockValue = {
        ...defaultWeb3Mock,
        address: testAddresses.mainWallet,
        chainId: 1287,
        isConnected: true,
      };
      multiChainMockValue = {
        ...defaultMultiChainMock,
        isConnected: true,
        activeAccount: {
          id: "test-account",
          address: testAddresses.mainWallet,
          chainType: "evm" as const,
          chainId: 1287,
          chainName: "Moonbase Alpha",
          source: "MetaMask",
        },
      };
      walletAliasMockValue = {
        alias: "My Wallet",
        setAlias: jest.fn(),
        isLoading: false,
      };
    });

    it("renders wallet alias instead of address", () => {
      renderWithRouter(<ConnectButton />);

      expect(screen.getByText("My Wallet")).toBeInTheDocument();
    });

    it("shows change alias option in menu", async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText("My Wallet"));

      await waitFor(() => {
        expect(screen.getByText("Change Wallet Alias")).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("shows error button when connection error occurs", () => {
      web3MockValue = {
        ...defaultWeb3Mock,
        error: new Error("Connection failed"),
      };

      renderWithRouter(<ConnectButton />);

      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("shows error message on larger screens", () => {
      multiChainMockValue = {
        ...defaultMultiChainMock,
        error: new Error("User rejected connection"),
      };

      renderWithRouter(<ConnectButton />);

      expect(screen.getByText(/User rejected connection/)).toBeInTheDocument();
    });
  });

  describe("connecting state", () => {
    it("shows connecting text when connecting", () => {
      web3MockValue = {
        ...defaultWeb3Mock,
        isConnecting: true,
      };

      renderWithRouter(<ConnectButton />);

      expect(screen.getByText("Connecting...")).toBeInTheDocument();
    });

    it("disables button when connecting", () => {
      multiChainMockValue = {
        ...defaultMultiChainMock,
        isConnecting: true,
      };

      renderWithRouter(<ConnectButton />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });
});
