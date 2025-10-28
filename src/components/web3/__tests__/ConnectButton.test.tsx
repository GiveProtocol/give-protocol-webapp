import _React from 'react';
import { jest } from '@jest/globals';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ConnectButton } from '../ConnectButton';
import { useWeb3 } from '@/contexts/Web3Context';
import { useWalletAlias } from '@/hooks/useWalletAlias';
import { renderWithRouter } from '@/test-utils/testHelpers';
import { createMockWeb3, createMockWalletAlias, testAddresses } from '@/test-utils/mockSetup';

// Setup common mocks using shared utilities
jest.mock('@/contexts/Web3Context');
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    signOut: jest.fn(),
  })),
}));
jest.mock('@/hooks/useWallet', () => ({
  useWallet: jest.fn(() => ({
    getInstalledWallets: jest.fn(() => [
      { name: 'MetaMask', id: 'metamask' },
      { name: 'WalletConnect', id: 'walletconnect' },
    ]),
    connectWallet: jest.fn(),
  })),
}));
jest.mock('@/hooks/useWalletAlias');
jest.mock('@/utils/web3', () => ({
  shortenAddress: jest.fn((address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`
  ),
}));
jest.mock('@/utils/logger', () => ({
  Logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));
jest.mock('@/config/contracts', () => ({
  CHAIN_IDS: {
    moonbase: 1287,
  },
}));

describe('ConnectButton', () => {
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();
  const mockSwitchChain = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useWeb3 as jest.Mock).mockReturnValue(createMockWeb3({
      connect: mockConnect,
      disconnect: mockDisconnect,
      switchChain: mockSwitchChain,
    }));
  });

  describe('when wallet is not connected', () => {
    it('renders connect wallet button', () => {
      renderWithRouter(<ConnectButton />);

      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('calls connect when connect button is clicked', async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText('Connect Wallet'));
      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalled();
      });
    });
  });

  describe('when wallet is connected', () => {
    beforeEach(() => {
      (useWeb3 as jest.Mock).mockReturnValue(createMockWeb3({
        address: testAddresses.mainWallet,
        chainId: 1287,
        isConnected: true,
        connect: mockConnect,
        disconnect: mockDisconnect,
        switchChain: mockSwitchChain,
      }));
    });

    it('renders wallet address button', () => {
      renderWithRouter(<ConnectButton />);

      expect(screen.getByText(testAddresses.shortAddress)).toBeInTheDocument();
    });

    it('shows account menu when wallet button is clicked', async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText(testAddresses.shortAddress));
      
      await waitFor(() => {
        expect(screen.getByText('Set Wallet Alias')).toBeInTheDocument();
        expect(screen.getByText('Disconnect')).toBeInTheDocument();
      });
    });

    it('calls disconnect when disconnect is clicked', async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText(testAddresses.shortAddress));
      
      await waitFor(() => {
        expect(screen.getByText('Disconnect')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Disconnect'));
      
      await waitFor(() => {
        expect(mockDisconnect).toHaveBeenCalled();
      });
    });
  });

  describe('when wrong network is connected', () => {
    beforeEach(() => {
      (useWeb3 as jest.Mock).mockReturnValue(createMockWeb3({
        address: testAddresses.mainWallet,
        chainId: 1, // Wrong network
        isConnected: true,
        connect: mockConnect,
        disconnect: mockDisconnect,
        switchChain: mockSwitchChain,
      }));
    });

    it('renders switch network button', () => {
      renderWithRouter(<ConnectButton />);

      expect(screen.getByText('Switch Network')).toBeInTheDocument();
    });

    it('calls switchChain when switch network is clicked', async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText('Switch Network'));
      
      await waitFor(() => {
        expect(mockSwitchChain).toHaveBeenCalledWith(1287);
      });
    });
  });

  describe('with wallet alias', () => {
    beforeEach(() => {
      (useWeb3 as jest.Mock).mockReturnValue(createMockWeb3({
        address: testAddresses.mainWallet,
        chainId: 1287,
        isConnected: true,
        connect: mockConnect,
        disconnect: mockDisconnect,
        switchChain: mockSwitchChain,
      }));

      (useWalletAlias as jest.Mock).mockReturnValue(createMockWalletAlias({
        alias: 'My Wallet',
      }));
    });

    it('renders wallet alias instead of address', () => {
      renderWithRouter(<ConnectButton />);

      expect(screen.getByText('My Wallet')).toBeInTheDocument();
    });

    it('shows change alias option in menu', async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText('My Wallet'));
      
      await waitFor(() => {
        expect(screen.getByText('Change Wallet Alias')).toBeInTheDocument();
      });
    });
  });

  describe('AccountMenuHeader component', () => {
    it('displays wallet connection info', () => {
      (useWeb3 as jest.Mock).mockReturnValue(createMockWeb3({
        address: testAddresses.mainWallet,
        chainId: 1287,
        isConnected: true,
        connect: mockConnect,
        disconnect: mockDisconnect,
        switchChain: mockSwitchChain,
      }));

      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText(testAddresses.shortAddress));
      
      expect(screen.getByText(/Connected with/)).toBeInTheDocument();
    });
  });

  describe('wallet selection', () => {
    it('shows wallet selection when connecting', async () => {
      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText('Connect Wallet'));
      
      // The component should trigger wallet connection logic
      expect(mockConnect).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('handles connection errors gracefully', async () => {
      mockConnect.mockRejectedValue(new Error('Connection failed'));

      renderWithRouter(<ConnectButton />);

      fireEvent.click(screen.getByText('Connect Wallet'));
      
      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalled();
      });
    });
  });
});