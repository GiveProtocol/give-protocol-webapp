/**
 * Mock providers for testing components that require context
 * This file provides lightweight mock implementations of all app contexts
 */

import React, { createContext } from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { jest } from "@jest/globals";

// ============================================================================
// Mock Context Values
// ============================================================================

/**
 * Default mock values for SettingsContext
 */
export const mockSettingsContextValue = {
  language: "en" as const,
  setLanguage: jest.fn(),
  currency: "USD" as const,
  setCurrency: jest.fn(),
  theme: "light" as const,
  setTheme: jest.fn(),
  languageOptions: [{ value: "en", label: "English" }],
  currencyOptions: [{ value: "USD", label: "US Dollar", symbol: "$" }],
};

/**
 * Default mock values for ToastContext
 */
export const mockToastContextValue = {
  showToast: jest.fn(),
};

/**
 * Default mock values for AuthContext
 */
export const mockAuthContextValue = {
  user: null,
  loading: false,
  error: null,
  userType: null,
  login: jest.fn(),
  loginWithGoogle: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
  refreshSession: jest.fn(),
  register: jest.fn(),
  sendUsernameReminder: jest.fn(),
};

/**
 * Default mock values for Web3Context
 */
export const mockWeb3ContextValue = {
  provider: null,
  signer: null,
  address: null,
  chainId: 1287,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: jest.fn(),
  disconnect: jest.fn(),
  switchChain: jest.fn(),
};

/**
 * Default mock values for CurrencyContext
 */
export const mockCurrencyContextValue = {
  selectedCurrency: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    coingeckoId: "usd",
  },
  setSelectedCurrency: jest.fn(),
  tokenPrices: {},
  isLoading: false,
  refreshPrices: jest.fn(),
  convertToFiat: jest.fn((amount: number) => amount),
  convertFromFiat: jest.fn((amount: number) => amount),
};

// ============================================================================
// Mock Context Providers
// ============================================================================

// Create mock contexts
const MockSettingsContext = createContext(mockSettingsContextValue);
const MockToastContext = createContext(mockToastContextValue);
const MockAuthContext = createContext(mockAuthContextValue);
const MockWeb3Context = createContext(mockWeb3ContextValue);
const MockCurrencyContext = createContext(mockCurrencyContextValue);

// Export context hooks for use in tests
export const MockSettingsProvider = MockSettingsContext.Provider;
export const MockToastProvider = MockToastContext.Provider;
export const MockAuthProvider = MockAuthContext.Provider;
export const MockWeb3Provider = MockWeb3Context.Provider;
export const MockCurrencyProvider = MockCurrencyContext.Provider;

// ============================================================================
// Query Client for Testing
// ============================================================================

/**
 * Creates a new QueryClient configured for testing
 * Disables retries and caching for predictable test behavior
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// ============================================================================
// Test Wrapper Components
// ============================================================================

interface AllProvidersProps {
  children: React.ReactNode;
  settings?: Partial<typeof mockSettingsContextValue>;
  toast?: Partial<typeof mockToastContextValue>;
  auth?: Partial<typeof mockAuthContextValue>;
  web3?: Partial<typeof mockWeb3ContextValue>;
  currency?: Partial<typeof mockCurrencyContextValue>;
  queryClient?: QueryClient;
  initialEntries?: string[];
}

/**
 * Comprehensive test wrapper that includes all app providers
 * Use this for component tests that need full context support
 */
export const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  settings = {},
  toast = {},
  auth = {},
  web3 = {},
  currency = {},
  queryClient,
  initialEntries,
}) => {
  const client = queryClient || createTestQueryClient();

  const settingsValue = { ...mockSettingsContextValue, ...settings };
  const toastValue = { ...mockToastContextValue, ...toast };
  const authValue = { ...mockAuthContextValue, ...auth };
  const web3Value = { ...mockWeb3ContextValue, ...web3 };
  const currencyValue = { ...mockCurrencyContextValue, ...currency };

  const Router = initialEntries ? MemoryRouter : BrowserRouter;
  const routerProps = initialEntries ? { initialEntries } : {};

  return (
    <QueryClientProvider client={client}>
      <MockSettingsContext.Provider value={settingsValue}>
        <MockToastContext.Provider value={toastValue}>
          <MockAuthContext.Provider value={authValue}>
            <MockWeb3Context.Provider value={web3Value}>
              <MockCurrencyContext.Provider value={currencyValue}>
                <Router {...routerProps}>{children}</Router>
              </MockCurrencyContext.Provider>
            </MockWeb3Context.Provider>
          </MockAuthContext.Provider>
        </MockToastContext.Provider>
      </MockSettingsContext.Provider>
    </QueryClientProvider>
  );
};

/**
 * Hook replacement exports - these can be used to mock the actual hooks
 */
export const createMockUseSettings =
  (overrides = {}) =>
  () => ({
    ...mockSettingsContextValue,
    ...overrides,
  });

export const createMockUseToast =
  (overrides = {}) =>
  () => ({
    ...mockToastContextValue,
    ...overrides,
  });

export const createMockUseAuth =
  (overrides = {}) =>
  () => ({
    ...mockAuthContextValue,
    ...overrides,
  });

export const createMockUseWeb3 =
  (overrides = {}) =>
  () => ({
    ...mockWeb3ContextValue,
    ...overrides,
  });

export const createMockUseCurrency =
  (overrides = {}) =>
  () => ({
    ...mockCurrencyContextValue,
    ...overrides,
  });
