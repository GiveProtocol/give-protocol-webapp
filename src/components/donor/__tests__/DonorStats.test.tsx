import React from 'react'; // eslint-disable-line no-unused-vars
import { jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { DonorStats } from '../DonorStats';
import { useAuth } from '@/contexts/AuthContext';
import { createMockAuth, setupCommonMocks } from '@/test-utils/mockSetup';

// Setup common mocks
setupCommonMocks();

// Mock dependencies
jest.mock('@/contexts/AuthContext');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ 
        data: [
          { amount: '100' },
          { amount: '250' },
          { amount: '75' }
        ], 
        error: null 
      })),
    })),
  })),
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('DonorStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue(createMockAuth({
      user: { id: 'donor-123' },
      userType: 'donor',
    }));
  });

  it('renders loading state when user is not available', () => {
    mockUseAuth.mockReturnValue(createMockAuth({ user: null }));
    
    render(<DonorStats />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays donor statistics after loading', async () => {
    render(<DonorStats />);
    
    await waitFor(() => {
      expect(screen.getByText('$425')).toBeInTheDocument(); // 100 + 250 + 75
      expect(screen.getByText('3')).toBeInTheDocument(); // Number of donations
    });
  });

  it('shows stat labels', async () => {
    render(<DonorStats />);
    
    await waitFor(() => {
      expect(screen.getByText(/total donated/i)).toBeInTheDocument();
      expect(screen.getByText(/donations made/i)).toBeInTheDocument();
    });
  });

  it('handles empty donation history', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ 
          data: [], 
          error: null 
        })),
      })),
    });

    render(<DonorStats />);
    
    await waitFor(() => {
      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('handles database errors gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ 
          data: null, 
          error: { message: 'Database error' } 
        })),
      })),
    });

    render(<DonorStats />);
    
    await waitFor(() => {
      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  it('handles null amounts in donations', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ 
          data: [
            { amount: '100' },
            { amount: null },
            { amount: '50' }
          ], 
          error: null 
        })),
      })),
    });

    render(<DonorStats />);
    
    await waitFor(() => {
      expect(screen.getByText('$150')).toBeInTheDocument(); // Only valid amounts counted
      expect(screen.getByText('3')).toBeInTheDocument(); // All records counted
    });
  });
});