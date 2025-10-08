import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GiveDashboard } from '../GiveDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { useTranslation } from '@/hooks/useTranslation';
import { createMockAuth, createMockWeb3, createMockTranslation, setupCommonMocks } from '@/test-utils/mockSetup';

// Mock all dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/contexts/Web3Context');
jest.mock('@/hooks/useTranslation');

// Setup common mocks to reduce duplication
setupCommonMocks();

// Component-specific mocks
jest.mock('@/components/contribution/DonationExportModal', () => ({
  DonationExportModal: ({ donations, onClose }: { donations: Array<{ id: string; [key: string]: unknown }>; onClose: () => void }) => (
    <div data-testid="export-modal">
      <span>Export Modal - {donations.length} donations</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('@/components/settings/WalletAliasSettings', () => ({
  WalletAliasSettings: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="wallet-settings">
      <span>Wallet Settings</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('@/components/donor/ScheduledDonations', () => ({
  ScheduledDonations: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="scheduled-donations">
      <span>Scheduled Donations</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseWeb3 = useWeb3 as jest.MockedFunction<typeof useWeb3>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('GiveDashboard', () => {
  const mockUser = { id: '1', email: 'test@example.com' };

  beforeEach(() => {
    mockUseAuth.mockReturnValue(createMockAuth({
      user: mockUser,
      userType: 'donor',
    }));

    mockUseWeb3.mockReturnValue(createMockWeb3({
      address: '0x123',
      isConnected: true,
    }));

    mockUseTranslation.mockReturnValue(createMockTranslation());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('Authentication and Access Control', () => {
    it('redirects to login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue(createMockAuth({ user: null, userType: null }));
      renderWithRouter(<GiveDashboard />);
      expect(screen.queryByText('dashboard.title')).not.toBeInTheDocument();
    });

    it('renders dashboard when user is authenticated', () => {
      mockUseAuth.mockReturnValue(createMockAuth({ user: mockUser, userType: 'donor' }));
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('dashboard.title')).toBeInTheDocument();
    });

    it('shows loading state when auth is loading', () => {
      mockUseAuth.mockReturnValue(createMockAuth({ user: null, userType: null, loading: true }));
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('common.loading')).toBeInTheDocument();
    });
  });

  describe('Wallet Connection', () => {
    it('shows connect wallet button when not connected', () => {
      mockUseWeb3.mockReturnValue(createMockWeb3({ address: null, isConnected: false }));
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('web3.connectWallet')).toBeInTheDocument();
    });

    it('shows wallet address when connected', () => {
      mockUseWeb3.mockReturnValue(createMockWeb3({ address: '0x123...789', isConnected: true }));
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('0x123...789')).toBeInTheDocument();
    });

    it('handles wallet connection loading state', () => {
      mockUseWeb3.mockReturnValue(createMockWeb3({ address: null, isConnected: false, loading: true }));
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('web3.connecting')).toBeInTheDocument();
    });

    it('handles wallet connection', () => {
      const mockConnect = jest.fn();
      mockUseWeb3.mockReturnValue(createMockWeb3({
        address: null,
        isConnected: false,
        connect: mockConnect,
      }));

      renderWithRouter(<GiveDashboard />);
      fireEvent.click(screen.getByText('web3.connectWallet'));
      expect(mockConnect).toHaveBeenCalled();
    });
  });

  describe('Filter and Sort Functionality', () => {
    it('renders year filter dropdown', () => {
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByDisplayValue('dashboard.filters.allYears')).toBeInTheDocument();
    });

    it('renders type filter dropdown', () => {
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByDisplayValue('dashboard.filters.allTypes')).toBeInTheDocument();
    });

    it('renders status filter dropdown', () => {
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByDisplayValue('dashboard.filters.allStatuses')).toBeInTheDocument();
    });

    it('handles filter changes', () => {
      renderWithRouter(<GiveDashboard />);
      
      const yearSelect = screen.getByDisplayValue('dashboard.filters.allYears');
      fireEvent.change(yearSelect, { target: { value: '2024' } });
      expect(yearSelect).toHaveValue('2024');

      const typeSelect = screen.getByDisplayValue('dashboard.filters.allTypes');
      fireEvent.change(typeSelect, { target: { value: 'one-time' } });
      expect(typeSelect).toHaveValue('one-time');
    });

    it('handles sort configuration changes', () => {
      renderWithRouter(<GiveDashboard />);
      const dateHeader = screen.getByText('dashboard.table.date');
      fireEvent.click(dateHeader);
      expect(dateHeader).toBeInTheDocument();
    });
  });

  describe('Modal Functionality', () => {
    it('opens and closes export modal', async () => {
      renderWithRouter(<GiveDashboard />);
      
      // Open modal
      fireEvent.click(screen.getByText('dashboard.exportData'));
      expect(screen.getByTestId('export-modal')).toBeInTheDocument();
      
      // Close modal
      fireEvent.click(screen.getByText('Close'));
      await waitFor(() => {
        expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
      });
    });

    it('opens and closes wallet settings modal', async () => {
      renderWithRouter(<GiveDashboard />);
      
      // Open modal
      fireEvent.click(screen.getByText('dashboard.walletSettings'));
      expect(screen.getByTestId('wallet-settings')).toBeInTheDocument();
      
      // Close modal
      fireEvent.click(screen.getByText('Close'));
      await waitFor(() => {
        expect(screen.queryByTestId('wallet-settings')).not.toBeInTheDocument();
      });
    });

    it('opens and closes scheduled donations modal', async () => {
      renderWithRouter(<GiveDashboard />);
      
      // Open modal
      fireEvent.click(screen.getByText('dashboard.scheduledDonations'));
      expect(screen.getByTestId('scheduled-donations')).toBeInTheDocument();
      
      // Close modal
      fireEvent.click(screen.getByText('Close'));
      await waitFor(() => {
        expect(screen.queryByTestId('scheduled-donations')).not.toBeInTheDocument();
      });
    });
  });

  describe('Statistics Display', () => {
    it('displays totalDonated statistic', () => {
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('dashboard.stats.totalDonated')).toBeInTheDocument();
    });

    it('displays totalCharities statistic', () => {
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('dashboard.stats.totalCharities')).toBeInTheDocument();
    });

    it('displays avgDonation statistic', () => {
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('dashboard.stats.avgDonation')).toBeInTheDocument();
    });

    it('displays lastDonation statistic', () => {
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('dashboard.stats.lastDonation')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays transaction data in table format', () => {
      renderWithRouter(<GiveDashboard />);
      
      expect(screen.getByText('dashboard.table.charity')).toBeInTheDocument();
      expect(screen.getByText('dashboard.table.amount')).toBeInTheDocument();
      expect(screen.getByText('dashboard.table.date')).toBeInTheDocument();
      expect(screen.getByText('dashboard.table.type')).toBeInTheDocument();
      expect(screen.getByText('dashboard.table.status')).toBeInTheDocument();
    });

    it('handles empty transaction state', () => {
      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('dashboard.table.date')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles auth context errors gracefully', () => {
      mockUseAuth.mockImplementation(() => {
        throw new Error('auth context errors error');
      });

      expect(() => renderWithRouter(<GiveDashboard />)).not.toThrow();
    });

    it('handles web3 context errors gracefully', () => {
      mockUseWeb3.mockImplementation(() => {
        throw new Error('web3 context errors error');
      });

      expect(() => renderWithRouter(<GiveDashboard />)).not.toThrow();
    });
  });

  describe('User Type Specific Features', () => {
    it('shows donor-specific features for donor users', () => {
      mockUseAuth.mockReturnValue(createMockAuth({
        user: mockUser,
        userType: 'donor',
      }));

      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('dashboard.scheduledDonations')).toBeInTheDocument();
    });

    it('shows charity-specific features for charity users', () => {
      mockUseAuth.mockReturnValue(createMockAuth({
        user: mockUser,
        userType: 'charity',
      }));

      renderWithRouter(<GiveDashboard />);
      expect(screen.getByText('dashboard.title')).toBeInTheDocument();
    });
  });

  describe('Navigation and Routing', () => {
    it('handles location state for wallet settings', () => {
      const mockLocation = {
        state: { showWalletSettings: true },
        pathname: '/dashboard',
        search: '',
        hash: '',
        key: 'test',
      };

      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useLocation: () => mockLocation,
      }));

      renderWithRouter(<GiveDashboard />);
      expect(screen.getByTestId('wallet-settings')).toBeInTheDocument();
    });
  });
});