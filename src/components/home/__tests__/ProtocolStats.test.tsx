import { render, screen } from '@testing-library/react';
import { ProtocolStats } from '../ProtocolStats';

describe('ProtocolStats', () => {
  it('renders protocol statistics', () => {
    render(<ProtocolStats />);

    // Check for stat labels
    expect(screen.getByText('Total Value Donated')).toBeInTheDocument();
    expect(screen.getByText('Total Donations')).toBeInTheDocument();
  });

  it('displays the total value donated', () => {
    render(<ProtocolStats />);

    expect(screen.getByText('$1,245,392')).toBeInTheDocument();
  });

  it('displays the total donations count', () => {
    render(<ProtocolStats />);

    expect(screen.getByText('3,427')).toBeInTheDocument();
  });

  it('renders with proper styling', () => {
    render(<ProtocolStats />);

    // Check that the container has the grid layout
    const container = screen.getByText('Total Value Donated').closest('.grid');
    expect(container).toHaveClass('grid-cols-2', 'gap-8');
  });

  it('renders icons for each stat', () => {
    const { container } = render(<ProtocolStats />);

    // Check that SVG icons are rendered
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBe(2);
  });
});
