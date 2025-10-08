/**
 * Shared route mock utilities to reduce duplication across test files
 */

import React from 'react';

/**
 * Creates a mock page component for testing route components
 * @param testId - The data-testid attribute value for the mock component
 * @param displayName - The text content to display in the mock component
 * @returns Mock module object with default export
 */
export const mockPageComponent = (testId: string, displayName: string) => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': testId }, displayName)
});

/**
 * Creates a mock component with named export for testing
 * @param testId - The data-testid attribute value for the mock component
 * @param displayName - The text content to display in the mock component
 * @param componentName - The name of the exported component
 * @returns Mock module object with named export
 */
export const mockNamedComponent = (testId: string, displayName: string, componentName: string) => ({
  [componentName]: () => React.createElement('div', { 'data-testid': testId }, displayName)
});

/**
 * Sets up common route-related mocks used across all route tests
 * Includes RouteTransition, ProtectedRoute, and LoadingSpinner components
 */
export const setupCommonRouteMocks = () => {
  // Mock route utilities
  jest.mock('./RouteTransition', () => ({
    RouteTransition: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children)
  }));
  
  jest.mock('./ProtectedRoute', () => ({
    ProtectedRoute: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'protected-route' }, children)
  }));
  
  jest.mock('@/components/ui/LoadingSpinner', () => ({
    LoadingSpinner: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'loading-spinner', 'data-size': size }, 'Loading...')
  }));
};

/**
 * Sets up Jest mocks for basic page components
 * Includes authentication pages, utility pages, and static content pages
 */
export const setupPageMocks = () => {
  // Basic pages
  jest.mock('@/pages/ComingSoon', () => mockPageComponent('coming-soon', 'Coming Soon'));
  jest.mock('@/pages/Login', () => mockPageComponent('login', 'Login'));
  jest.mock('@/pages/Register', () => mockPageComponent('register', 'Register'));
  jest.mock('@/pages/Home', () => mockPageComponent('home', 'Home'));
  jest.mock('@/pages/CharityBrowser', () => mockPageComponent('charity-browser', 'Charity Browser'));
  jest.mock('@/pages/SentryTest', () => mockPageComponent('sentry-test', 'Sentry Test'));
  jest.mock('@/pages/ContributionTracker', () => mockPageComponent('contribution-tracker', 'Contribution Tracker'));
  jest.mock('@/pages/VolunteerOpportunities', () => mockPageComponent('volunteer-opportunities', 'Volunteer Opportunities'));
  
  // Named export pages
  jest.mock('@/pages/About', () => mockNamedComponent('about', 'About', 'About'));
  jest.mock('@/pages/Legal', () => mockNamedComponent('legal', 'Legal', 'Legal'));
  jest.mock('@/pages/Privacy', () => mockNamedComponent('privacy', 'Privacy', 'Privacy'));
  jest.mock('@/pages/Whitepaper', () => mockNamedComponent('whitepaper', 'Whitepaper', 'Whitepaper'));
};

/**
 * Sets up Jest mocks for charity-specific page components
 * Mocks GlobalWaterFoundation, EducationForAll, and ClimateActionNow pages
 */
export const setupCharityPageMocks = () => {
  jest.mock('@/pages/charities/GlobalWaterFoundation', () => mockPageComponent('global-water', 'Global Water Foundation'));
  jest.mock('@/pages/charities/EducationForAll', () => mockPageComponent('education-for-all', 'Education For All'));
  jest.mock('@/pages/charities/ClimateActionNow', () => mockPageComponent('climate-action', 'Climate Action Now'));
};

/**
 * Sets up Jest mocks for portfolio page components
 * Mocks Environment, Education, and Poverty portfolio detail pages
 */
export const setupPortfolioPageMocks = () => {
  jest.mock('@/pages/portfolio/EnvironmentPortfolioDetail', () => mockPageComponent('environment-portfolio', 'Environment Portfolio'));
  jest.mock('@/pages/portfolio/EducationPortfolioDetail', () => mockPageComponent('education-portfolio', 'Education Portfolio'));
  jest.mock('@/pages/portfolio/PovertyPortfolioDetail', () => mockPageComponent('poverty-portfolio', 'Poverty Portfolio'));
};

/**
 * Sets up Jest mocks for dashboard page components
 * Mocks GiveDashboard, CharityPortal, VolunteerDashboard, and AdminDashboard pages
 */
export const setupDashboardPageMocks = () => {
  jest.mock('@/pages/donor/GiveDashboard', () => mockPageComponent('give-dashboard', 'Give Dashboard'));
  jest.mock('@/pages/charity/CharityPortal', () => mockPageComponent('charity-portal', 'Charity Portal'));
  jest.mock('@/pages/volunteer/VolunteerDashboard', () => mockPageComponent('volunteer-dashboard', 'Volunteer Dashboard'));
  jest.mock('@/pages/admin/AdminDashboard', () => mockPageComponent('admin-dashboard', 'Admin Dashboard'));
};

/**
 * Sets up all route-related mocks for comprehensive route testing
 * Combines common route mocks, page mocks, charity pages, portfolio pages, and dashboard pages
 */
export const setupAllRouteMocks = () => {
  setupCommonRouteMocks();
  setupPageMocks();
  setupCharityPageMocks();
  setupPortfolioPageMocks();
  setupDashboardPageMocks();
};