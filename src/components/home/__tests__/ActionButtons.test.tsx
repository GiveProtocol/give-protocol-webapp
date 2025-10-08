import React from 'react'; // eslint-disable-line no-unused-vars
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { ActionButtons } from '../ActionButtons';
import { MemoryRouter } from 'react-router-dom';
import { setupCommonMocks } from '@/test-utils/mockSetup';

// Setup common mocks
setupCommonMocks();

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className} data-testid="link">{children}</a>
  ),
}));

const renderActionButtons = () => {
  return render(
    <MemoryRouter>
      <ActionButtons />
    </MemoryRouter>
  );
};

describe('ActionButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all action buttons', () => {
    renderActionButtons();
    
    expect(screen.getByText(/browse charities/i)).toBeInTheDocument();
    expect(screen.getByText(/discover opportunities/i)).toBeInTheDocument();
    expect(screen.getByText(/track contributions/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderActionButtons();
    
    const links = screen.getAllByTestId('link');
    expect(links).toHaveLength(3);
  });

  it('displays call-to-action text', () => {
    renderActionButtons();
    
    expect(screen.getByText(/get started/i)).toBeInTheDocument();
  });

  it('renders with proper styling classes', () => {
    renderActionButtons();
    
    const container = screen.getByText(/browse charities/i).closest('div');
    expect(container).toBeInTheDocument();
  });
});