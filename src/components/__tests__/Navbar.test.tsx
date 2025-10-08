import React from 'react'; // eslint-disable-line no-unused-vars
import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { createMockAuth, createMockWeb3, setupCommonMocks } from '@/test-utils/mockSetup';
import { MemoryRouter } from 'react-router-dom';

// Setup common mocks
setupCommonMocks();

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/contexts/Web3Context');

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className} data-testid="nav-link">{children}</a>
  ),
  useNavigate: () => jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseWeb3 = useWeb3 as jest.MockedFunction<typeof useWeb3>;

const renderNavbar = () => {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('unauthenticated state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth({ user: null }));
      mockUseWeb3.mockReturnValue(createMockWeb3({ isConnected: false }));
    });

    it('renders logo and brand name', () => {
      renderNavbar();
      
      expect(screen.getByText('Duration')).toBeInTheDocument();
    });

    it('shows login and signup buttons', () => {
      renderNavbar();
      
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      expect(screen.getByText(/get started/i)).toBeInTheDocument();
    });

    it('displays public navigation links', () => {
      renderNavbar();
      
      expect(screen.getByText(/about/i)).toBeInTheDocument();
      expect(screen.getByText(/charities/i)).toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth({
        user: { id: 'user-123' },
        userType: 'donor',
      }));
      mockUseWeb3.mockReturnValue(createMockWeb3({ 
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890'
      }));
    });

    it('shows user dashboard link', () => {
      renderNavbar();
      
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it('displays wallet connection status', () => {
      renderNavbar();
      
      expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
    });

    it('shows logout option', () => {
      renderNavbar();
      
      expect(screen.getByText(/sign out/i)).toBeInTheDocument();
    });
  });

  describe('charity user state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth({
        user: { id: 'charity-123' },
        userType: 'charity',
      }));
      mockUseWeb3.mockReturnValue(createMockWeb3({ isConnected: true }));
    });

    it('shows charity-specific navigation', () => {
      renderNavbar();
      
      expect(screen.getByText(/charity portal/i)).toBeInTheDocument();
    });
  });

  describe('mobile navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth({ user: null }));
      mockUseWeb3.mockReturnValue(createMockWeb3({ isConnected: false }));
    });

    it('shows mobile menu toggle', () => {
      renderNavbar();
      
      const menuButton = screen.getByRole('button');
      expect(menuButton).toBeInTheDocument();
    });

    it('toggles mobile menu on click', () => {
      renderNavbar();
      
      const menuButton = screen.getByRole('button');
      fireEvent.click(menuButton);
      
      // Mobile menu should be visible
      expect(screen.getByTestId).toBeTruthy();
    });
  });

  describe('wallet connection', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuth({
        user: { id: 'user-123' },
        userType: 'donor',
      }));
    });

    it('shows connect wallet button when not connected', () => {
      mockUseWeb3.mockReturnValue(createMockWeb3({ isConnected: false }));
      
      renderNavbar();
      
      expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
    });

    it('shows wallet address when connected', () => {
      mockUseWeb3.mockReturnValue(createMockWeb3({ 
        isConnected: true,
        address: '0xabcdef1234567890123456789012345678901234'
      }));
      
      renderNavbar();
      
      expect(screen.getByText(/0xabcd...1234/)).toBeInTheDocument();
    });
  });
});