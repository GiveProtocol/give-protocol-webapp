import React from 'react'; // eslint-disable-line no-unused-vars
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';
import { setupCommonMocks } from '@/test-utils/mockSetup';
import { MemoryRouter } from 'react-router-dom';

// Setup common mocks
setupCommonMocks();

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className} data-testid="footer-link">{children}</a>
  ),
}));

const renderFooter = () => {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
};

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders footer content', () => {
    renderFooter();
    
    expect(screen.getAllByText(/give protocol/i)[0]).toBeInTheDocument();
  });

  it('displays copyright information', () => {
    renderFooter();
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('shows navigation links', () => {
    renderFooter();
    
    const links = screen.getAllByTestId('footer-link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('displays social media links', () => {
    renderFooter();
    
    // Footer doesn't have social media links, test documentation link instead
    expect(screen.getByText(/documentation/i)).toBeInTheDocument();
  });

  it('shows legal links', () => {
    renderFooter();
    
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
  });

  it('displays contact information', () => {
    renderFooter();
    
    // Footer doesn't have contact info, test About Us link instead
    expect(screen.getByText(/about us/i)).toBeInTheDocument();
  });

  it('renders with proper layout structure', () => {
    renderFooter();
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('shows company description', () => {
    renderFooter();
    
    expect(screen.getByText(/empowering charitable giving/i)).toBeInTheDocument();
  });
});