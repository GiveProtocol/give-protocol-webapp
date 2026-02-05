import { jest } from "@jest/globals";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { ConnectButton } from "../ConnectButton";
import { useWeb3 } from "@/contexts/Web3Context";
import { useWalletAlias } from "@/hooks/useWalletAlias";
import { renderWithRouter } from "@/test-utils/testHelpers";
import {
  createMockWeb3,
  createMockWalletAlias,
  testAddresses,
} from "@/test-utils/mockSetup";

// Setup common mocks using shared utilities
jest.mock("@/contexts/Web3Context");
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    user: null,
    logout: jest.fn(),
    signOut: jest.fn(),
  })),
}));
jest.mock("@/hooks/useWallet", () => ({
  useWallet: jest.fn(() => ({
    getInstalledWallets: jest.fn(() => [
      { name: "MetaMask", id: "metamask" },
      { name: "WalletConnect", id: "walletconnect" },
    ]),
    connectWallet: jest.fn(),
  })),
}));
jest.mock("@/hooks/useWalletAlias");
jest.mock("@/utils/web3", () => ({
  shortenAddress: jest.fn(
    (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`,
  ),
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
  },
  CHAIN_CONFIGS: {},
}));

describe("ConnectButton", () => {
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();
  const mockSwitchChain = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useWeb3 as jest.Mock).mockReturnValue(
      createMockWeb3({
        connect: mockConnect,
        disconnect: mockDisconnect,
        switchChain: mockSwitchChain,
      }),
    );

    (useWalletAlias as jest.Mock).mockReturnValue(createMockWalletAlias());
  });

  describe("when wallet is not connected", () => {
    it("renders connect button", () => {
      renderWithRouter(<ConnectButton />);

      expect(screen.getByText("Connect")).toBeInTheDocument();
    });

    it("shows wallet selection when connect button is clicked", async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText("Connect"));
      await waitFor(() => {
        expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
      });
    });
  });

  describe("when wallet is connected", () => {
    beforeEach(() => {
      (useWeb3 as jest.Mock).mockReturnValue(
        createMockWeb3({
          address: testAddresses.mainWallet,
          chainId: 1287,
          isConnected: true,
          connect: mockConnect,
          disconnect: mockDisconnect,
          switchChain: mockSwitchChain,
        }),
      );
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

    it("calls disconnect when disconnect is clicked", async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText(testAddresses.shortAddress));

      await waitFor(() => {
        expect(screen.getByText("Disconnect")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Disconnect"));

      await waitFor(() => {
        expect(mockDisconnect).toHaveBeenCalled();
      });
    });
  });

  describe("when wrong network is connected", () => {
    beforeEach(() => {
      (useWeb3 as jest.Mock).mockReturnValue(
        createMockWeb3({
          address: testAddresses.mainWallet,
          chainId: 1, // Wrong network
          isConnected: true,
          connect: mockConnect,
          disconnect: mockDisconnect,
          switchChain: mockSwitchChain,
        }),
      );
    });

    it("still renders wallet address button when on wrong network", () => {
      renderWithRouter(<ConnectButton />);

      expect(screen.getByText(testAddresses.shortAddress)).toBeInTheDocument();
    });

    it("shows account menu when wallet button is clicked on wrong network", async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText(testAddresses.shortAddress));

      await waitFor(() => {
        expect(screen.getByText("Disconnect")).toBeInTheDocument();
      });
    });
  });

  describe("with wallet alias", () => {
    beforeEach(() => {
      (useWeb3 as jest.Mock).mockReturnValue(
        createMockWeb3({
          address: testAddresses.mainWallet,
          chainId: 1287,
          isConnected: true,
          connect: mockConnect,
          disconnect: mockDisconnect,
          switchChain: mockSwitchChain,
        }),
      );

      (useWalletAlias as jest.Mock).mockReturnValue(
        createMockWalletAlias({
          alias: "My Wallet",
        }),
      );
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

  describe("AccountMenuHeader component", () => {
    it("displays wallet connection info", () => {
      (useWeb3 as jest.Mock).mockReturnValue(
        createMockWeb3({
          address: testAddresses.mainWallet,
          chainId: 1287,
          isConnected: true,
          connect: mockConnect,
          disconnect: mockDisconnect,
          switchChain: mockSwitchChain,
        }),
      );

      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText(testAddresses.shortAddress));

      expect(screen.getByText(/Connected with/)).toBeInTheDocument();
    });
  });

  describe("wallet selection", () => {
    it("shows wallet selection when connecting", async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText("Connect"));

      // The component should show wallet selection dropdown
      await waitFor(() => {
        expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("handles connection errors gracefully", async () => {
      (useWeb3 as jest.Mock).mockReturnValue(
        createMockWeb3({
          error: new Error("Connection failed"),
          connect: mockConnect,
          disconnect: mockDisconnect,
          switchChain: mockSwitchChain,
        }),
      );

      renderWithRouter(<ConnectButton />);

      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });
});
