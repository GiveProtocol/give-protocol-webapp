import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletAliasSettings } from '../WalletAliasSettings';
import { useWalletAlias } from '@/hooks/useWalletAlias';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  createMockWalletAlias, 
  createMockWeb3,
  testAddresses,
  mockShortenAddress,
  setupCommonMocks
} from '@/test-utils/mockSetup';

// Setup common mocks to reduce duplication
setupCommonMocks();

// Mock the specific dependencies
jest.mock('@/hooks/useWalletAlias');
jest.mock('@/contexts/Web3Context');
jest.mock('@/utils/web3', () => ({
  shortenAddress: mockShortenAddress,
}));

// Override Input component for test specificity
jest.mock('@/components/ui/Input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} data-testid="alias-input" />,
}));

describe('WalletAliasSettings', () => {
  const mockSetWalletAlias = jest.fn();
  const mockDeleteWalletAlias = jest.fn();

  const defaultMocks = {
    walletAlias: createMockWalletAlias({
      setWalletAlias: mockSetWalletAlias,
      deleteWalletAlias: mockDeleteWalletAlias,
    }),
    web3: createMockWeb3({
      address: testAddresses.mainWallet,
      isConnected: true,
    })
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useWalletAlias as jest.Mock).mockReturnValue(defaultMocks.walletAlias);
    (useWeb3 as jest.Mock).mockReturnValue(defaultMocks.web3);
    mockSetWalletAlias.mockResolvedValue(true);
    mockDeleteWalletAlias.mockResolvedValue(true);
  });

  // Helper function to test validation cases - reduces nesting
  const testValidationCase = async (value: string, expectedError: string) => {
    render(<WalletAliasSettings />);
    
    const input = screen.getByTestId('alias-input');
    const submitButton = screen.getByText('Set Alias');
    
    if (value) fireEvent.change(input, { target: { value } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(expectedError)).toBeInTheDocument();
    });
  };

  // Helper function to test rendering cases - reduces nesting
  const testRenderingCase = (expectationFn: () => void) => {
    render(<WalletAliasSettings />);
    expectationFn();
  };

  // Helper function to test no-alias cases - reduces nesting
  const testNoAliasCase = (actionFn?: () => void, expectationFn?: () => void) => {
    render(<WalletAliasSettings />);
    if (actionFn) actionFn();
    if (expectationFn) expectationFn();
  };

  describe('Component Rendering', () => {
    it('renders the wallet alias settings component', () => {
      testRenderingCase(() => expect(screen.getByText('Wallet Alias')).toBeInTheDocument());
    });

    it('shows current wallet address when connected', () => {
      testRenderingCase(() => expect(screen.getByText('0x1234...7890')).toBeInTheDocument());
    });

    it('renders the card container', () => {
      testRenderingCase(() => expect(screen.getByTestId('card')).toBeInTheDocument());
    });
  });

  describe('No Alias Set', () => {
    it('shows set alias form by default', () => {
      testNoAliasCase(undefined, () => {
        expect(screen.getByTestId('alias-input')).toBeInTheDocument();
        expect(screen.getByText('Set Alias')).toBeInTheDocument();
      });
    });

    it('allows user to enter alias', () => {
      testNoAliasCase(
        () => fireEvent.change(screen.getByTestId('alias-input'), { target: { value: 'MyWallet' } }),
        () => expect(screen.getByTestId('alias-input')).toHaveValue('MyWallet')
      );
    });

    it('submits alias when form is submitted', async () => {
      render(<WalletAliasSettings />);
      
      fireEvent.change(screen.getByTestId('alias-input'), { target: { value: 'MyWallet' } });
      fireEvent.click(screen.getByText('Set Alias'));
      
      await waitFor(() => {
        expect(mockSetWalletAlias).toHaveBeenCalledWith('MyWallet');
      });
    });
  });

  describe('Existing Alias', () => {
    const existingAliasMock = createMockWalletAlias({
      alias: 'ExistingAlias',
      aliases: { [testAddresses.mainWallet]: 'ExistingAlias' },
      setWalletAlias: mockSetWalletAlias,
      deleteWalletAlias: mockDeleteWalletAlias,
    });

    beforeEach(() => {
      (useWalletAlias as jest.Mock).mockReturnValue(existingAliasMock);
    });

    it('displays the existing alias', () => {
      render(<WalletAliasSettings />);
      expect(screen.getByText('ExistingAlias')).toBeInTheDocument();
    });

    it('shows edit and delete buttons', () => {
      render(<WalletAliasSettings />);
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('enters edit mode when edit button is clicked', () => {
      render(<WalletAliasSettings />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      expect(screen.getByTestId('alias-input')).toBeInTheDocument();
      expect(screen.getByTestId('alias-input')).toHaveValue('ExistingAlias');
    });

    it('calls delete function when delete is clicked', async () => {
      render(<WalletAliasSettings />);
      
      fireEvent.click(screen.getByText('Delete'));
      
      await waitFor(() => {
        expect(mockDeleteWalletAlias).toHaveBeenCalled();
      });
    });

    describe('Edit Mode', () => {
      it('shows save and cancel buttons in edit mode', () => {
        render(<WalletAliasSettings />);
        
        fireEvent.click(screen.getByText('Edit'));
        
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      it('cancels edit mode when cancel is clicked', () => {
        render(<WalletAliasSettings />);
        
        fireEvent.click(screen.getByText('Edit'));
        fireEvent.click(screen.getByText('Cancel'));
        
        expect(screen.getByText('ExistingAlias')).toBeInTheDocument();
        expect(screen.queryByTestId('alias-input')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    // eslint-disable-next-line jest/expect-expect
    it('shows error for empty alias', async () => {
      await testValidationCase('', 'Alias cannot be empty');
    });

    // eslint-disable-next-line jest/expect-expect
    it('shows error for alias too short', async () => {
      await testValidationCase('ab', 'Alias must be between 3 and 20 characters');
    });

    // eslint-disable-next-line jest/expect-expect
    it('shows error for alias too long', async () => {
      await testValidationCase('a'.repeat(21), 'Alias must be between 3 and 20 characters');
    });

    // eslint-disable-next-line jest/expect-expect
    it('shows error for invalid characters', async () => {
      await testValidationCase('invalid@alias!', 'Alias can only contain letters, numbers, underscores, and hyphens');
    });

    it('accepts valid alias', async () => {
      render(<WalletAliasSettings />);
      
      fireEvent.change(screen.getByTestId('alias-input'), { target: { value: 'valid_alias-123' } });
      fireEvent.click(screen.getByText('Set Alias'));
      
      await waitFor(() => {
        expect(mockSetWalletAlias).toHaveBeenCalledWith('valid_alias-123');
      });
    });
  });

  describe('State Handling', () => {
    it('shows loading state when setting alias', () => {
      (useWalletAlias as jest.Mock).mockReturnValue({
        ...defaultMocks.walletAlias,
        loading: true,
      });

      render(<WalletAliasSettings />);
      expect(screen.getByText('Wallet Alias')).toBeInTheDocument();
    });

    it('handles disconnected wallet state', () => {
      (useWeb3 as jest.Mock).mockReturnValue(createMockWeb3({
        address: null,
        isConnected: false,
      }));

      render(<WalletAliasSettings />);
      expect(screen.getByText('Wallet Alias')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles setWalletAlias failure gracefully', async () => {
      mockSetWalletAlias.mockResolvedValue(false);
      render(<WalletAliasSettings />);
      
      fireEvent.change(screen.getByTestId('alias-input'), { target: { value: 'TestAlias' } });
      fireEvent.click(screen.getByText('Set Alias'));
      
      await waitFor(() => {
        expect(mockSetWalletAlias).toHaveBeenCalledWith('TestAlias');
      });
    });

    it('handles deleteWalletAlias failure gracefully', async () => {
      (useWalletAlias as jest.Mock).mockReturnValue({
        alias: 'ExistingAlias',
        aliases: { [testAddresses.mainWallet]: 'ExistingAlias' },
        loading: false,
        error: null,
        setWalletAlias: mockSetWalletAlias,
        deleteWalletAlias: mockDeleteWalletAlias,
      });
      mockDeleteWalletAlias.mockResolvedValue(false);
      
      render(<WalletAliasSettings />);
      fireEvent.click(screen.getByText('Delete'));
      
      await waitFor(() => {
        expect(mockDeleteWalletAlias).toHaveBeenCalled();
      });
    });
  });
});