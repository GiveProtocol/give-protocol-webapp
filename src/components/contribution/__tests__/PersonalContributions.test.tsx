import React from 'react';
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { PersonalContributions } from '../PersonalContributions';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-123' } })
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [
            { amount: '50', created_at: '2024-01-01', charity: { name: 'Test Charity' } },
            { amount: '75', created_at: '2024-01-02', charity: { name: 'Another Charity' } }
          ],
          error: null
        }))
      }))
    }))
  }
}));

describe('PersonalContributions', () => {
  it('renders personal contributions', async () => {
    render(<PersonalContributions />);
    
    await screen.findByText(/test charity/i);
    expect(screen.getByText(/another charity/i)).toBeInTheDocument();
  });

  it('displays total personal contributions', async () => {
    render(<PersonalContributions />);
    
    await screen.findByText(/125/); // 50 + 75
  });

  it('shows loading state', () => {
    render(<PersonalContributions />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles empty contributions', async () => {
    const mockSupabase = jest.requireMock('@/lib/supabase').supabase;
    mockSupabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null })
      })
    });
    
    render(<PersonalContributions />);
    
    await screen.findByText(/no contributions/i);
  });
});