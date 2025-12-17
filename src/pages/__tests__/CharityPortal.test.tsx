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
  setupCommonMocks,
  createMockSupabase 
} from '@/test-utils/mockSetup';
import { mockCharityData, mockDonationData } from '@/test-utils/supabaseMocks';
import { MemoryRouter } from 'react-router-dom';

// Mock all dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/useProfile');
jest.mock('@/hooks/useTranslation');

// Setup common mocks to reduce duplication
setupCommonMocks();

// Mock export modal component
jest.mock('@/components/contribution/DonationExportModal', () => ({
  DonationExportModal: ({ donations, onClose }: { donations: Array<{ id: string; [key: string]: unknown }>; onClose: () => void }) => (
    <div data-testid="donation-export-modal">
      <button onClick={onClose} data-testid="export-modal-close">Close</button>
      <div>Exporting {donations.length} donations</div>
    </div>
  ),
}));

// Mock Supabase with test data
jest.mock('@/lib/supabase', () => ({
  supabase: createMockSupabase({
    charities: { data: mockCharityData, error: null },
    donations: { data: mockDonationData, error: null },
    volunteer_hours: { data: [], error: null }
  })
}));

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
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });

    it('shows loading state when profile is loading', () => {
      mockUseProfile.mockReturnValue(createMockProfile({
        profile: null,
        loading: true
      }));

      renderWithRouter();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('handles missing profile gracefully', async () => {
      mockUseProfile.mockReturnValue(createMockProfile({
        profile: null,
        loading: false
      }));

      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('displays charity information when available', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('Test Charity')).toBeInTheDocument();
      });
    });

    it('handles donation data display', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByTestId('currency-display')).toBeInTheDocument();
      });
    });

    it('shows appropriate message when no donations exist', async () => {
      // Mock empty donations
      jest.doMock('@/lib/supabase', () => ({
        supabase: createMockSupabase({
          donations: { data: [], error: null }
        })
      }));

      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('opens export modal when export button is clicked', async () => {
      renderWithRouter();
      
      const exportButton = screen.getByRole('button');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('donation-export-modal')).toBeInTheDocument();
      });
    });

    it('closes export modal when close button is clicked', async () => {
      renderWithRouter();
      
      // Open modal
      const exportButton = screen.getByRole('button');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('donation-export-modal')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByTestId('export-modal-close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('donation-export-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles auth errors gracefully', async () => {
      mockUseAuth.mockReturnValue(createMockAuth({
        user: null,
        userType: null,
        loading: false,
        error: 'Authentication failed'
      }));

      expect(() => renderWithRouter()).not.toThrow();
    });

    it('handles profile fetch errors', async () => {
      mockUseProfile.mockReturnValue(createMockProfile({
        profile: null,
        loading: false,
        error: 'Failed to fetch profile'
      }));

      expect(() => renderWithRouter()).not.toThrow();
    });

    it('handles data fetch errors gracefully', async () => {
      // Mock API error
      jest.doMock('@/lib/supabase', () => ({
        supabase: createMockSupabase({
          donations: { data: null, error: { message: 'Database error' } }
        })
      }));

      expect(() => renderWithRouter()).not.toThrow();
    });
  });

  describe('User Type Restrictions', () => {
    it('handles non-charity user access', async () => {
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
      const mockT = jest.fn((key, fallback) => fallback || key);
      mockUseTranslation.mockReturnValue(createMockTranslation({
        t: mockT,
        language: 'es'
      }));

      renderWithRouter();
      
      await waitFor(() => {
        expect(mockT).toHaveBeenCalled();
      });
    });

    it('handles different language settings', async () => {
      mockUseTranslation.mockReturnValue(createMockTranslation({
        t: jest.fn((key) => `es_${key}`),
        language: 'es'
      }));

      expect(() => renderWithRouter()).not.toThrow();
    });
  });
});