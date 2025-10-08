import type { Screen } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';

// Type definitions for auth test helpers
interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

interface AuthResponse {
  data: {
    user: {
      id: string;
      email: string;
    } | null;
    session: Record<string, unknown> | null;
  };
  error: AuthError | null;
}

interface MockSupabase extends Partial<SupabaseClient> {
  auth: {
    getSession: jest.Mock;
    onAuthStateChange: jest.Mock;
    signInWithPassword: jest.Mock;
    signInWithOAuth: jest.Mock;
    signOut: jest.Mock;
    signUp: jest.Mock;
    resetPasswordForEmail: jest.Mock;
    refreshSession: jest.Mock;
    [key: string]: jest.Mock;
  };
}

interface _MockToast {
  showToast: jest.Mock;
}

interface ScreenWithMock extends Screen {
  __mockShowToast?: jest.Mock;
}

// Shared test helpers to reduce duplication in auth tests
export const createMockAuthFlow = (mockType: 'success' | 'error', errorDetails?: AuthError): AuthResponse => {
  if (mockType === 'success') {
    return {
      data: { user: { id: '123', email: 'test@example.com' }, session: {} },
      error: null
    };
  }
  return {
    data: { user: null, session: null },
    error: errorDetails || { message: 'Test error' }
  };
};

export const createMockWeb3Flow = (mockType: 'success' | 'error', errorDetails?: Error): string[] => {
  if (mockType === 'success') {
    return ['0x1234567890123456789012345678901234567890'];
  }
  throw errorDetails || new Error('Test error');
};

// Shared mock user object
export const MOCK_USER = {
  id: '123',
  email: 'test@example.com',
  user_metadata: { user_type: 'donor' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01'
};

// Common Supabase auth method mocks
export const createAuthMocks = () => ({
  getSession: jest.fn().mockResolvedValue({ 
    data: { session: null }, 
    error: null 
  }),
  onAuthStateChange: jest.fn().mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } }
  }),
  signInWithPassword: jest.fn(),
  signInWithOAuth: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  refreshSession: jest.fn(),
});

// Standard auth test patterns
export const setupAuthTest = (mockSupabase: MockSupabase, mockUseToast: jest.Mock): { mockShowToast: jest.Mock } => {
  const mockShowToast = jest.fn();
  
  mockUseToast.mockReturnValue({
    showToast: mockShowToast,
  });

  mockSupabase.auth = createAuthMocks();

  // Mock console methods to avoid test output noise
  jest.spyOn(console, 'error').mockImplementation(() => {
    // Empty mock to suppress console.error output during tests
  });
  jest.spyOn(console, 'log').mockImplementation(() => {
    // Empty mock to suppress console.log output during tests
  });

  return { mockShowToast };
};

// Common test flow handler
export const testAuthFlow = async (
  mockSupabase: MockSupabase,
  method: string,
  mockResponse: AuthResponse | Error,
  screen: ScreenWithMock,
  buttonTestId: string,
  expectedToast: [string, string]
) => {
  if (mockResponse instanceof Error) {
    mockSupabase.auth[method].mockRejectedValue(mockResponse);
  } else {
    mockSupabase.auth[method].mockResolvedValue(mockResponse);
  }

  const { act, waitFor } = await import('@testing-library/react');
  const mockShowToast = screen.__mockShowToast;
  
  if (!mockShowToast) {
    throw new Error('mockShowToast not found on screen object');
  }
  
  await act(async () => screen.getByTestId(buttonTestId).click());
  await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith(...expectedToast));
};

export const commonExpectations = {
  authSuccess: (screen: Screen) => {
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  },
  authError: (screen: Screen, message: string) => {
    expect(screen.getByTestId('error')).toHaveTextContent(message);
  },
  web3Connected: (screen: Screen) => {
    expect(screen.getByTestId('connected')).toHaveTextContent('connected');
  },
  web3Disconnected: (screen: Screen) => {
    expect(screen.getByTestId('connected')).toHaveTextContent('disconnected');
  }
};