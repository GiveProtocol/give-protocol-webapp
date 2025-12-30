import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';
import { jest } from '@jest/globals';

describe('Tabs Component', () => {
  const TestTabs = () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
    </Tabs>
  );

  it('renders tabs with default content', () => {
    render(<TestTabs />);
    
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches content when tab is clicked', () => {
    render(<TestTabs />);
    
    // Initially shows first tab content
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    
    // Click second tab
    fireEvent.click(screen.getByText('Tab 2'));
    
    // Now shows second tab content
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('applies active styles to selected tab', () => {
    render(<TestTabs />);
    
    const tab1 = screen.getByText('Tab 1');
    const tab2 = screen.getByText('Tab 2');
    
    // Tab 1 should be active initially
    expect(tab1.closest('button')).toHaveClass('bg-white', 'text-gray-900', 'shadow');
    expect(tab2.closest('button')).toHaveClass('text-gray-600');
    
    // Click tab 2
    fireEvent.click(tab2);
    
    // Tab 2 should now be active
    expect(tab2.closest('button')).toHaveClass('bg-white', 'text-gray-900', 'shadow');
    expect(tab1.closest('button')).toHaveClass('text-gray-600');
  });

  it('throws error when TabsTrigger used outside Tabs', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Empty mock to suppress console.error output during tests
    });
    
    expect(() => {
      render(<TabsTrigger value="test">Test</TabsTrigger>);
    }).toThrow('TabsTrigger must be used within Tabs');
    
    consoleSpy.mockRestore();
  });

  it('throws error when TabsContent used outside Tabs', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Empty mock to suppress console.error output during tests
    });
    
    expect(() => {
      render(<TabsContent value="test">Test Content</TabsContent>);
    }).toThrow('TabsContent must be used within Tabs');
    
    consoleSpy.mockRestore();
  });
});