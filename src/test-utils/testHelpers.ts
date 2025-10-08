import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

/**
 * Wrapper component for routing in tests
 * @param props - Component props containing children
 * @returns BrowserRouter wrapper element
 */
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => 
  React.createElement(BrowserRouter, {}, children);

/**
 * Helper function to render components with router wrapper
 * @param component - React component to render
 * @returns Rendered component with router context
 */
export const renderWithRouter = (component: React.ReactElement) => {
  return render(React.createElement(TestWrapper, {}, component));
};

/**
 * Common test expectation for blockchain explorer links
 * @param element - HTML element to test
 * @param hash - Transaction hash for the link
 */
export const expectBlockchainLink = (element: HTMLElement, hash: string) => {
  expect(element).toHaveAttribute('href', `https://moonbase.moonscan.io/tx/${hash}`);
  expect(element).toHaveAttribute('target', '_blank');
  expect(element).toHaveAttribute('rel', 'noopener noreferrer');
};

/**
 * Standard validation error messages for tests
 */
export const validationErrors = {
  emptyAlias: 'Alias cannot be empty',
  aliasLength: 'Alias must be between 3 and 20 characters',
  invalidCharacters: 'Alias can only contain letters, numbers, underscores, and hyphens',
};

/**
 * Common CSS classes for testing UI components
 */
export const cssClasses = {
  card: {
    default: ['bg-white', 'border', 'border-gray-200', 'rounded-lg', 'p-4'],
    success: ['bg-green-50', 'border', 'border-green-200', 'rounded-lg', 'p-4'],
    error: ['p-3', 'bg-red-50', 'text-red-700', 'text-sm', 'rounded-md'],
  },
  button: {
    primary: ['flex', 'items-center'],
  },
};