import React from 'react'; // eslint-disable-line no-unused-vars
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplicationAcceptance } from '../ApplicationAcceptance';
import { useVolunteerVerification } from '@/hooks/useVolunteerVerification';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  createMockVolunteerVerification, 
  createMockTranslation, 
  testPropsDefaults,
  setupCommonMocks
} from '@/test-utils/mockSetup';
import { cssClasses } from '@/test-utils/types';

// Setup common mocks to reduce duplication
setupCommonMocks();

// Mock the specific dependencies
jest.mock('@/hooks/useVolunteerVerification');
jest.mock('@/hooks/useTranslation');

describe('ApplicationAcceptance', () => {
  const mockAcceptApplication = jest.fn();
  const mockOnAccepted = jest.fn();
  const mockT = jest.fn((key: string, fallback?: string) => fallback || key);

  const defaultProps = {
    ...testPropsDefaults.applicationAcceptance,
    onAccepted: mockOnAccepted,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useVolunteerVerification as jest.Mock).mockReturnValue(createMockVolunteerVerification({
      acceptApplication: mockAcceptApplication,
    }));

    (useTranslation as jest.Mock).mockReturnValue(createMockTranslation({
      t: mockT,
    }));

    mockAcceptApplication.mockResolvedValue('0x1234567890abcdef');
  });

  describe('initial state', () => {
    it('renders the application card with applicant information', () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      expect(screen.getByText(testPropsDefaults.applicationAcceptance.applicantName)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(testPropsDefaults.applicationAcceptance.opportunityTitle))).toBeInTheDocument();
    });

    it('shows accept and reject buttons', () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      expect(screen.getByText('volunteer.accept')).toBeInTheDocument();
      expect(screen.getByText('volunteer.reject')).toBeInTheDocument();
    });

    it('does not show acceptance hash initially', () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      expect(screen.queryByText('volunteer.acceptanceHash')).not.toBeInTheDocument();
    });
  });

  describe('acceptance flow', () => {
    it('calls acceptApplication when accept button is clicked', async () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      fireEvent.click(screen.getByText('volunteer.accept'));
      
      await waitFor(() => {
        expect(mockAcceptApplication).toHaveBeenCalledWith('app-123');
      });
    });

    it('shows loading state during acceptance', () => {
      (useVolunteerVerification as jest.Mock).mockReturnValue(createMockVolunteerVerification({
        acceptApplication: mockAcceptApplication,
        loading: true,
      }));

      render(<ApplicationAcceptance {...defaultProps} />);
      
      expect(screen.getByText('volunteer.processing')).toBeInTheDocument();
    });

    it('disables button during loading', () => {
      (useVolunteerVerification as jest.Mock).mockReturnValue(createMockVolunteerVerification({
        acceptApplication: mockAcceptApplication,
        loading: true,
      }));

      render(<ApplicationAcceptance {...defaultProps} />);
      
      const acceptButton = screen.getByText('volunteer.processing');
      expect(acceptButton).toBeDisabled();
    });

    it('calls onAccepted callback when acceptance succeeds', async () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      fireEvent.click(screen.getByText('volunteer.accept'));
      
      await waitFor(() => {
        expect(mockOnAccepted).toHaveBeenCalledWith('0x1234567890abcdef');
      });
    });

    it('shows success state after acceptance', async () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      fireEvent.click(screen.getByText('volunteer.accept'));
      
      await waitFor(() => {
        expect(screen.getByText('volunteer.applicationAccepted')).toBeInTheDocument();
        expect(screen.getByText('volunteer.applicationRecorded')).toBeInTheDocument();
      });
    });

    it('displays acceptance hash in success state', async () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      fireEvent.click(screen.getByText('volunteer.accept'));
      
      await waitFor(() => {
        expect(screen.getByText('volunteer.acceptanceHash')).toBeInTheDocument();
        expect(screen.getByText('0x1234567890abcdef')).toBeInTheDocument();
      });
    });

    it('includes blockchain explorer link for hash', async () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      fireEvent.click(screen.getByText('volunteer.accept'));
      
      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://moonbase.moonscan.io/tx/0x1234567890abcdef');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('error handling', () => {
    it('displays error message when provided', () => {
      (useVolunteerVerification as jest.Mock).mockReturnValue(createMockVolunteerVerification({
        acceptApplication: mockAcceptApplication,
        error: 'Connection failed',
      }));

      render(<ApplicationAcceptance {...defaultProps} />);
      
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('handles acceptance failure gracefully', async () => {
      mockAcceptApplication.mockRejectedValue(new Error('Transaction failed'));
      
      render(<ApplicationAcceptance {...defaultProps} />);
      
      fireEvent.click(screen.getByText('volunteer.accept'));
      
      await waitFor(() => {
        expect(mockAcceptApplication).toHaveBeenCalled();
      });

      // Logger.error should have been called with the error
      const { Logger } = jest.requireMock('@/utils/logger');
      expect(Logger.error).toHaveBeenCalledWith('Acceptance failed:', expect.any(Error));
    });

    it('handles null hash response', async () => {
      mockAcceptApplication.mockResolvedValue(null);
      
      render(<ApplicationAcceptance {...defaultProps} />);
      
      fireEvent.click(screen.getByText('volunteer.accept'));
      
      await waitFor(() => {
        expect(mockAcceptApplication).toHaveBeenCalled();
      });

      // Should not show success state
      expect(screen.queryByText('volunteer.applicationAccepted')).not.toBeInTheDocument();
    });
  });

  describe('optional props', () => {
    it('works without onAccepted callback', async () => {
      const propsWithoutCallback = testPropsDefaults.applicationAcceptance;

      render(<ApplicationAcceptance {...propsWithoutCallback} />);
      
      fireEvent.click(screen.getByText('volunteer.accept'));
      
      await waitFor(() => {
        expect(mockAcceptApplication).toHaveBeenCalled();
      });

      // Should not throw error
      expect(screen.getByText('volunteer.applicationAccepted')).toBeInTheDocument();
    });
  });

  describe('UI styling and classes', () => {
    it('applies correct styling to initial state', () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      const container = screen.getByText(testPropsDefaults.applicationAcceptance.applicantName).closest('div');
      expect(container?.parentElement).toHaveClass(...cssClasses.card.default);
    });

    it('applies success styling after acceptance', async () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      fireEvent.click(screen.getByText('volunteer.accept'));
      
      await waitFor(() => {
        const successContainer = screen.getByText('volunteer.applicationAccepted').closest('div');
        expect(successContainer).toHaveClass(...cssClasses.card.success);
      });
    });

    it('applies error styling when error present', () => {
      (useVolunteerVerification as jest.Mock).mockReturnValue(createMockVolunteerVerification({
        acceptApplication: mockAcceptApplication,
        error: 'Error message',
      }));

      render(<ApplicationAcceptance {...defaultProps} />);
      
      const errorElement = screen.getByText('Error message');
      expect(errorElement.closest('div')).toHaveClass(...cssClasses.card.error);
    });
  });

  describe('translation integration', () => {
    it('uses translation hook for all text', () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      expect(mockT).toHaveBeenCalledWith('volunteer.appliedFor');
      expect(mockT).toHaveBeenCalledWith('volunteer.accept');
      expect(mockT).toHaveBeenCalledWith('volunteer.reject');
    });

    it('uses translation for dynamic loading text', () => {
      (useVolunteerVerification as jest.Mock).mockReturnValue(createMockVolunteerVerification({
        acceptApplication: mockAcceptApplication,
        loading: true,
      }));

      render(<ApplicationAcceptance {...defaultProps} />);
      
      expect(mockT).toHaveBeenCalledWith('volunteer.processing', 'Processing...');
    });
  });

  describe('button interactions', () => {
    it('reject button is clickable but has no handler', () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      const rejectButton = screen.getByText('volunteer.reject');
      expect(rejectButton).toBeInTheDocument();
      
      // Should not throw error when clicked
      fireEvent.click(rejectButton);
    });

    it('accept button has proper styling classes', () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      const acceptButton = screen.getByText('volunteer.accept');
      expect(acceptButton).toHaveClass(...cssClasses.button.primary);
    });

    it('reject button has secondary variant', () => {
      render(<ApplicationAcceptance {...defaultProps} />);
      
      const rejectButton = screen.getByText('volunteer.reject');
      expect(rejectButton).toHaveAttribute('data-variant', 'secondary');
    });
  });
});