import _React from 'react';
import { jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { setupAllRouteMocks } from '@/test-utils/routeMocks';
import { AppRoutes } from '../index';

// Setup all route mocks using shared utility
setupAllRouteMocks();

// Mock auth context
jest.mock('@/contexts/AuthContext');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AppRoutes', () => {
  const renderWithRouter = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <AppRoutes />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        userType: null,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        resetPassword: jest.fn(),
        loginWithGoogle: jest.fn(),
        refreshSession: jest.fn(),
        sendUsernameReminder: jest.fn()
      });
    });

    const publicRoutes = [
      { path: '/', testId: 'home', name: 'Home' },
      { path: '/login', testId: 'login', name: 'Login' },
      { path: '/register', testId: 'register', name: 'Register' },
      { path: '/charities', testId: 'charity-browser', name: 'Charity Browser' },
      { path: '/about', testId: 'about', name: 'About' },
      { path: '/legal', testId: 'legal', name: 'Legal' },
      { path: '/privacy', testId: 'privacy', name: 'Privacy' },
      { path: '/whitepaper', testId: 'whitepaper', name: 'Whitepaper' }
    ];

    const testPublicRoute = async (path: string, testId: string, _name: string) => {
      renderWithRouter([path]);
      await waitFor(() => {
        expect(screen.getByTestId(testId)).toBeInTheDocument();
      });
    };

    for (const { path, testId, name } of publicRoutes) {
      // eslint-disable-next-line jest/expect-expect
      it(`renders ${name} page at ${path}`, async () => {
        await testPublicRoute(path, testId, name);
      });
    }

    const charityRoutes = [
      { path: '/charities/global-water-foundation', testId: 'global-water', name: 'Global Water Foundation' },
      { path: '/charities/education-for-all', testId: 'education-for-all', name: 'Education For All' },
      { path: '/charities/climate-action-now', testId: 'climate-action', name: 'Climate Action Now' }
    ];

    for (const { path, testId, name } of charityRoutes) {
      // eslint-disable-next-line jest/expect-expect
      it(`renders ${name} page at ${path}`, async () => {
        await testPublicRoute(path, testId, name);
      });
    }

    const portfolioRoutes = [
      { path: '/portfolios/environment', testId: 'environment-portfolio', name: 'Environment Portfolio' },
      { path: '/portfolios/education', testId: 'education-portfolio', name: 'Education Portfolio' },
      { path: '/portfolios/poverty', testId: 'poverty-portfolio', name: 'Poverty Portfolio' }
    ];

    for (const { path, testId, name } of portfolioRoutes) {
      // eslint-disable-next-line jest/expect-expect
      it(`renders ${name} page at ${path}`, async () => {
        await testPublicRoute(path, testId, name);
      });
    }
  });

  describe('Protected Routes', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { user_type: 'donor' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        userType: 'donor',
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        resetPassword: jest.fn(),
        loginWithGoogle: jest.fn(),
        refreshSession: jest.fn(),
        sendUsernameReminder: jest.fn()
      });
    });

    const protectedRoutes = [
      { path: '/dashboard', testId: 'give-dashboard', name: 'Give Dashboard' },
      { path: '/charity-portal', testId: 'charity-portal', name: 'Charity Portal' },
      { path: '/volunteer-dashboard', testId: 'volunteer-dashboard', name: 'Volunteer Dashboard' },
      { path: '/admin', testId: 'admin-dashboard', name: 'Admin Dashboard' },
      { path: '/contributions', testId: 'contribution-tracker', name: 'Contribution Tracker' },
      { path: '/volunteer-opportunities', testId: 'volunteer-opportunities', name: 'Volunteer Opportunities' }
    ];

    const testProtectedRoute = async (path: string, _name: string) => {
      renderWithRouter([path]);
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    };

    for (const { path, testId: _testId, name } of protectedRoutes) {
      // eslint-disable-next-line jest/expect-expect
      it(`renders ${name} page at ${path} when authenticated`, async () => {
        await testProtectedRoute(path, name);
      });
    }
  });

  describe('Loading State', () => {
    it('shows loading spinner when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userType: null,
        loading: true,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        resetPassword: jest.fn(),
        loginWithGoogle: jest.fn(),
        refreshSession: jest.fn(),
        sendUsernameReminder: jest.fn()
      });

      renderWithRouter(['/']);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles auth errors gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userType: null,
        loading: false,
        error: 'Authentication failed',
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        resetPassword: jest.fn(),
        loginWithGoogle: jest.fn(),
        refreshSession: jest.fn(),
        sendUsernameReminder: jest.fn()
      });

      expect(() => renderWithRouter(['/'])).not.toThrow();
    });
  });

  describe('Lazy Loading', () => {
    it('handles lazy-loaded components', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userType: null,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        resetPassword: jest.fn(),
        loginWithGoogle: jest.fn(),
        refreshSession: jest.fn(),
        sendUsernameReminder: jest.fn()
      });

      renderWithRouter(['/']);
      
      await waitFor(() => {
        expect(screen.getByTestId('home')).toBeInTheDocument();
      });
    });
  });
});