import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CharityPortal } from '../CharityPortal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from '@/hooks/useTranslation';
import {
  createMockAuth,
  createMockProfile,
  createMockTranslation,
} from '@/test-utils/mockSetup';
import { MemoryRouter } from 'react-router-dom';

// Top-level mocks (must be hoisted)
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/useProfile');
jest.mock('@/hooks/useTranslation');
jest.mock('@/utils/logger', () => ({
  Logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

// Mock UI components
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>{children}</button>
  ),
}));
jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="card" className={className} {...props}>{children}</div>
  ),
}));
jest.mock('@/components/CurrencyDisplay', () => ({
  CurrencyDisplay: ({ amount }: { amount: number }) => (
    <span data-testid="currency-display">${amount}</span>
  ),
}));

// Mock sub-components to avoid deep dependency chains
jest.mock('../charity-portal/components', () => ({
  ApplicationsTab: () => <div data-testid="applications-tab">Applications</div>,
  CausesTab: () => <div data-testid="causes-tab">Causes</div>,
  HoursVerificationTab: () => <div data-testid="hours-tab">Hours Verification</div>,
  OpportunitiesTab: () => <div data-testid="opportunities-tab">Opportunities</div>,
  OrganizationProfileTab: () => <div data-testid="org-profile-tab">Organization Profile</div>,
  StatsCards: ({ stats }: { stats: { totalDonated: number }; onTransactionsClick?: () => void; onVolunteersClick?: () => void }) => (
    <div data-testid="stats-cards">
      <span data-testid="currency-display">${stats?.totalDonated || 0}</span>
    </div>
  ),
  TransactionsTab: ({ onExport }: { transactions?: unknown[]; onExport?: () => void }) => (
    <div data-testid="transactions-tab">
      <button onClick={onExport} data-testid="export-button">Export</button>
    </div>
  ),
}));

// Mock export modal component
jest.mock('@/components/contribution/DonationExportModal', () => ({
  DonationExportModal: ({ donations, onClose }: { donations: Array<{ id: string; [key: string]: unknown }>; onClose: () => void }) => (
    <div data-testid="donation-export-modal">
      <button onClick={onClose} data-testid="export-modal-close">Close</button>
      <div>Exporting {donations.length} donations</div>
    </div>
  ),
}));

// Mock Supabase - each eq() returns a thenable chain object
jest.mock('@/lib/supabase', () => {
  const defaultResponse = { data: [], error: null };
  const makeThenable = (response = defaultResponse) => {
    const obj = {
      eq: jest.fn(() => makeThenable(response)),
      order: jest.fn(() => Promise.resolve(response)),
      single: jest.fn(() => Promise.resolve(response)),
      in: jest.fn(() => makeThenable(response)),
      then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
        Promise.resolve(response).then(resolve, reject),
    };
    return obj;
  };
  return {
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn(() => makeThenable()),
      })),
    },
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('CharityPortal', () => {
  const renderWithRouter = (props = {}) => {
    return render(
      <MemoryRouter>
        <CharityPortal {...props} />
      </MemoryRouter>
    );
  };

  const mockCharityUser = {
    id: 'charity-user-123',
    email: 'charity@test.com',
    user_metadata: { user_type: 'charity' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z'
  };

  const mockCharityProfile = {
    id: 'charity-profile-123',
    user_id: 'charity-user-123',
    display_name: 'Test Charity',
    name: 'Test Charity',
    description: 'A test charity organization',
    category: 'education',
    country: 'US',
    verified: true
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue(createMockAuth({
      user: mockCharityUser,
      userType: 'charity',
      loading: false
    }));

    mockUseProfile.mockReturnValue(createMockProfile({
      profile: mockCharityProfile,
      loading: false
    }));

    mockUseTranslation.mockReturnValue(createMockTranslation({
      t: jest.fn((key, fallback) => fallback || key),
      language: 'en'
    }));
  });

  describe('Component Rendering', () => {
    it('renders charity portal layout', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Test Charity')).toBeInTheDocument();
      });
    });

    it('shows loading skeleton when profile is loading', () => {
      mockUseProfile.mockReturnValue(createMockProfile({
        profile: null,
        loading: true
      }));
      mockUseAuth.mockReturnValue(createMockAuth({
        user: mockCharityUser,
        userType: 'charity',
        loading: true
      }));

      renderWithRouter();
      // Component shows skeleton loaders (animated divs), not LoadingSpinner
      expect(screen.queryByText('Test Charity')).not.toBeInTheDocument();
    });

    it('handles missing profile gracefully', () => {
      mockUseProfile.mockReturnValue(createMockProfile({
        profile: null,
        loading: false
      }));

      // When profile is null, fetchCharityData returns early without
      // setting loading=false, so the skeleton loader stays visible
      renderWithRouter();
      expect(screen.queryByText('Test Charity')).not.toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays charity information when available', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Test Charity')).toBeInTheDocument();
      });
    });

    it('renders stats cards component', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles auth errors gracefully', () => {
      mockUseAuth.mockReturnValue(createMockAuth({
        user: null,
        userType: null,
        loading: false,
        error: 'Authentication failed'
      }));

      expect(() => renderWithRouter()).not.toThrow();
    });

    it('handles profile fetch errors', () => {
      mockUseProfile.mockReturnValue(createMockProfile({
        profile: null,
        loading: false,
        error: 'Failed to fetch profile'
      }));

      expect(() => renderWithRouter()).not.toThrow();
    });
  });

  describe('User Type Restrictions', () => {
    it('handles non-charity user access', () => {
      mockUseAuth.mockReturnValue(createMockAuth({
        user: { ...mockCharityUser, user_metadata: { user_type: 'donor' } },
        userType: 'donor',
        loading: false
      }));

      expect(() => renderWithRouter()).not.toThrow();
    });
  });

  describe('Internationalization', () => {
    it('uses translation function for text content', async () => {
      const mockT = jest.fn((key: string, fallback?: string) => fallback || key);
      mockUseTranslation.mockReturnValue(createMockTranslation({
        t: mockT,
        language: 'es'
      }));

      renderWithRouter();

      await waitFor(() => {
        expect(mockT).toHaveBeenCalled();
      });
    });

    it('handles different language settings', () => {
      mockUseTranslation.mockReturnValue(createMockTranslation({
        t: jest.fn((key: string) => `es_${key}`),
        language: 'es'
      }));

      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});
