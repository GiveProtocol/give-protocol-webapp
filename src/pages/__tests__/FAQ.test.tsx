import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FAQ from '../FAQ';

const renderFAQ = () =>
  render(
    <MemoryRouter>
      <FAQ />
    </MemoryRouter>,
  );

describe('FAQ', () => {
  describe('Page structure', () => {
    it('renders the page heading', () => {
      renderFAQ();
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    });

    it('renders the page subtitle', () => {
      renderFAQ();
      expect(
        screen.getByText(
          'Everything you need to know about giving, volunteering, and blockchain transparency.',
        ),
      ).toBeInTheDocument();
    });

    it('renders all five section headings', () => {
      renderFAQ();
      expect(screen.getByText('About Give Protocol')).toBeInTheDocument();
      expect(screen.getByText('Crypto & Donations')).toBeInTheDocument();
      expect(screen.getByText('Trust & Safety')).toBeInTheDocument();
      expect(screen.getByText('Volunteering')).toBeInTheDocument();
      expect(screen.getByText('For Organizations')).toBeInTheDocument();
    });
  });

  describe('FAQ questions visible', () => {
    it('renders CPO-required question: What is Give Protocol?', () => {
      renderFAQ();
      expect(screen.getByText('What is Give Protocol?')).toBeInTheDocument();
    });

    it('renders CPO-required question: How do crypto donations work?', () => {
      renderFAQ();
      expect(
        screen.getByText('How do crypto donations work?'),
      ).toBeInTheDocument();
    });

    it('renders CPO-required question about money going to charity', () => {
      renderFAQ();
      expect(
        screen.getByText('How do I know my money goes to the charity?'),
      ).toBeInTheDocument();
    });

    it('renders question about wallet requirement', () => {
      renderFAQ();
      expect(
        screen.getByText('Do I need a crypto wallet to donate?'),
      ).toBeInTheDocument();
    });

    it('renders question about volunteer verification', () => {
      renderFAQ();
      expect(
        screen.getByText('How does volunteer hour verification work?'),
      ).toBeInTheDocument();
    });
  });

  describe('Accordion behavior', () => {
    it('answers are not visible before clicking a question', () => {
      renderFAQ();
      expect(
        screen.queryByText(
          /Give Protocol is a transparent, blockchain-powered platform/,
        ),
      ).not.toBeInTheDocument();
    });

    it('clicking a question reveals the answer', () => {
      renderFAQ();
      fireEvent.click(screen.getByText('What is Give Protocol?'));
      expect(
        screen.getByText(
          /Give Protocol is a transparent, blockchain-powered platform/,
        ),
      ).toBeInTheDocument();
    });

    it('clicking the same question again hides the answer', () => {
      renderFAQ();
      const question = screen.getByText('What is Give Protocol?');
      fireEvent.click(question);
      expect(
        screen.getByText(
          /Give Protocol is a transparent, blockchain-powered platform/,
        ),
      ).toBeInTheDocument();
      fireEvent.click(question);
      expect(
        screen.queryByText(
          /Give Protocol is a transparent, blockchain-powered platform/,
        ),
      ).not.toBeInTheDocument();
    });

    it('multiple questions can be open simultaneously', () => {
      renderFAQ();
      fireEvent.click(screen.getByText('What is Give Protocol?'));
      fireEvent.click(screen.getByText('How do crypto donations work?'));
      expect(
        screen.getByText(
          /Give Protocol is a transparent, blockchain-powered platform/,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Connect your crypto wallet/),
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('question buttons have aria-expanded=false by default', () => {
      renderFAQ();
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('question button sets aria-expanded=true when opened', () => {
      renderFAQ();
      const btn = screen.getByText('What is Give Protocol?').closest('button');
      expect(btn).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(btn as HTMLElement);
      expect(btn).toHaveAttribute('aria-expanded', 'true');
    });

    it('answer panel has id matching button aria-controls', () => {
      renderFAQ();
      const btn = screen.getByText('What is Give Protocol?').closest('button');
      fireEvent.click(btn as HTMLElement);
      const controls = btn?.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls as string)).toBeInTheDocument();
    });
  });
});
