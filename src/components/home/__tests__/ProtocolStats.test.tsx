import React from 'react'; // eslint-disable-line no-unused-vars
import { jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { ProtocolStats } from '../ProtocolStats';
import { setupCommonMocks } from '@/test-utils/mockSetup';

// Setup common mocks
setupCommonMocks();

// Mock the supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve({ 
        data: { 
          total_donations: 25000,
          total_volunteers: 150,
          charities_count: 12,
          volunteer_hours: 800
        }, 
        error: null 
      })),
    })),
  })),
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('ProtocolStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<ProtocolStats />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays protocol statistics after loading', async () => {
    render(<ProtocolStats />);
    
    await waitFor(() => {
      expect(screen.getByText('$25,000')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('800')).toBeInTheDocument();
    });
  });

  it('shows stat labels', async () => {
    render(<ProtocolStats />);
    
    await waitFor(() => {
      expect(screen.getByText(/total donated/i)).toBeInTheDocument();
      expect(screen.getByText(/active volunteers/i)).toBeInTheDocument();
      expect(screen.getByText(/partner charities/i)).toBeInTheDocument();
      expect(screen.getByText(/volunteer hours/i)).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ 
          data: null, 
          error: { message: 'Failed to fetch stats' } 
        })),
      })),
    });

    render(<ProtocolStats />);
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('handles null data gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ 
          data: null, 
          error: null 
        })),
      })),
    });

    render(<ProtocolStats />);
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});