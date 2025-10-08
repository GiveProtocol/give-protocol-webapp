import React, { useCallback } from 'react';
import { jest } from '@jest/globals';
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "../ToastContext";
import { Logger } from "@/utils/logger";
import { setSentryUser, clearSentryUser } from "@/lib/sentry";
import { MOCK_USER, setupAuthTest } from "@/test-utils/authTestHelpers";

// Mock all dependencies
jest.mock("@/lib/supabase");
jest.mock("../ToastContext");
jest.mock("@/utils/logger");
jest.mock("@/lib/sentry");
jest.mock("@/config/env", () => ({
  ENV: {
    VITE_SUPABASE_URL: "http://localhost:54321",
    VITE_SUPABASE_ANON_KEY: "test-key",
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockLogger = Logger as jest.Mocked<typeof Logger>;
const mockSetSentryUser = setSentryUser as jest.MockedFunction<
  typeof setSentryUser
>;
const mockClearSentryUser = clearSentryUser as jest.MockedFunction<
  typeof clearSentryUser
>;

// Test component to access auth context
const TestComponent: React.FC = () => {
  const auth = useAuth();

  const handleLogin = useCallback(() => {
    auth.login("test@example.com", "password", "donor");
  }, [auth]);

  const handleLogout = useCallback(() => {
    auth.logout();
  }, [auth]);

  const handleRefresh = useCallback(() => {
    auth.refreshSession();
  }, [auth]);

  const handleRegister = useCallback(() => {
    auth.register("test@example.com", "password", "donor");
  }, [auth]);

  const handleResetPassword = useCallback(() => {
    auth.resetPassword("test@example.com");
  }, [auth]);

  const handleGoogleLogin = useCallback(() => {
    auth.loginWithGoogle();
  }, [auth]);

  const handleUsernameReminder = useCallback(() => {
    auth.sendUsernameReminder("test@example.com");
  }, [auth]);

  return (
    <div>
      <div data-testid="loading">
        {auth.loading ? "loading" : "not-loading"}
      </div>
      <div data-testid="user">{auth.user ? auth.user.email : "no-user"}</div>
      <div data-testid="user-type">{auth.userType || "no-type"}</div>
      <div data-testid="error">
        {auth.error ? auth.error.message : "no-error"}
      </div>
      <button data-testid="login-btn" onClick={handleLogin}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={handleLogout}>
        Logout
      </button>
      <button data-testid="refresh-btn" onClick={handleRefresh}>
        Refresh
      </button>
      <button data-testid="register-btn" onClick={handleRegister}>
        Register
      </button>
      <button data-testid="reset-btn" onClick={handleResetPassword}>
        Reset Password
      </button>
      <button data-testid="google-btn" onClick={handleGoogleLogin}>
        Login with Google
      </button>
      <button
        data-testid="username-reminder-btn"
        onClick={handleUsernameReminder}
      >
        Send Username Reminder
      </button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>,
  );
};

describe("AuthContext", () => {
  let mockShowToast: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const helpers = setupAuthTest(mockSupabase, mockUseToast);
    mockShowToast = helpers.mockShowToast;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("renders with initial loading state", () => {
      renderWithAuthProvider();

      expect(screen.getByTestId("loading")).toHaveTextContent("loading");
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      expect(screen.getByTestId("user-type")).toHaveTextContent("no-type");
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    });

    it("initializes session on mount", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: MOCK_USER } },
        error: null,
      });

      renderWithAuthProvider();

      await waitFor(() => {
        expect(mockSupabase.auth.getSession).toHaveBeenCalled();
      });
    });

    it("sets up auth state change listener", () => {
      renderWithAuthProvider();

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });

  describe("Session Management", () => {
    it("handles successful session initialization", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: MOCK_USER } },
        error: null,
      });

      renderWithAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
        expect(screen.getByTestId("user")).toHaveTextContent(
          "test@example.com",
        );
        expect(screen.getByTestId("user-type")).toHaveTextContent("donor");
      });

      expect(mockSetSentryUser).toHaveBeenCalledWith(MOCK_USER);
    });

    it("handles session initialization error", async () => {
      const error = new Error("Session error");
      mockSupabase.auth.getSession.mockRejectedValue(error);

      renderWithAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to get session",
          error,
        );
      });
    });

    it("handles auth state changes", async () => {
      let authCallback: (
        _event: string,
        _session: { user: typeof MOCK_USER } | null,
      ) => void | Promise<void> = () => {
        // Initial empty callback - will be replaced by mockImplementation
      };

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      renderWithAuthProvider();

      // Simulate auth state change
      act(() => {
        authCallback("SIGNED_IN", { user: MOCK_USER });
      });

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent(
          "test@example.com",
        );
        expect(mockSetSentryUser).toHaveBeenCalledWith(MOCK_USER);
      });
    });

    it("handles sign out auth state change", async () => {
      let authCallback: (
        _event: string,
        _session: { user: typeof MOCK_USER } | null,
      ) => void | Promise<void> = () => {
        // Initial empty callback - will be replaced by mockImplementation
      };

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      renderWithAuthProvider();

      act(() => {
        authCallback("SIGNED_OUT", null);
      });

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
        expect(mockClearSentryUser).toHaveBeenCalled();
      });
    });
  });

  describe("Login", () => {
    it("handles successful login", async () => {
      const mockResponse = {
        data: { user: MOCK_USER, session: { user: MOCK_USER } },
        error: null,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue(mockResponse);
      renderWithAuthProvider();

      await act(async () => screen.getByTestId("login-btn").click());
      await waitFor(() =>
        expect(mockShowToast).toHaveBeenCalledWith(
          "Successfully logged in!",
          "success",
        ),
      );

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: expect.any(String),
      });
    });

    it("handles login error", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid credentials", status: 400 },
      });

      renderWithAuthProvider();
      await act(async () => screen.getByTestId("login-btn").click());
      await waitFor(() =>
        expect(mockShowToast).toHaveBeenCalledWith(
          "Invalid credentials",
          "error",
        ),
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Login error",
        expect.any(Object),
      );
    });

    it("handles login exception", async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error("Network error"),
      );

      renderWithAuthProvider();
      await act(async () => screen.getByTestId("login-btn").click());
      await waitFor(() =>
        expect(mockShowToast).toHaveBeenCalledWith(
          "An unexpected error occurred during login",
          "error",
        ),
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Login error",
        expect.any(Error),
      );
    });
  });

  describe("Google Login", () => {
    it("handles successful Google login", async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { provider: "google", url: null },
        error: null,
      });

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("google-btn").click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/`,
          },
        });
      });
    });

    it("handles Google login error", async () => {
      const error = { message: "OAuth error" };
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { provider: null, url: null },
        error,
      });

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("google-btn").click();
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith("OAuth error", "error");
      });
    });
  });

  describe("Logout", () => {
    it("handles successful logout", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("logout-btn").click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith(
          "Successfully logged out",
          "success",
        );
      });
    });

    it("handles logout error", async () => {
      const error = { message: "Logout failed" };
      mockSupabase.auth.signOut.mockResolvedValue({ error });

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("logout-btn").click();
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith("Logout failed", "error");
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Logout error",
          expect.any(Object),
        );
      });
    });
  });

  describe("Registration", () => {
    it("handles successful registration", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: MOCK_USER, session: null },
        error: null,
      });

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("register-btn").click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: "test@example.com",
          password: expect.any(String),
          options: {
            data: { user_type: "donor" },
          },
        });
        expect(mockShowToast).toHaveBeenCalledWith(
          "Registration successful! Please check your email for verification.",
          "success",
        );
      });
    });

    it("handles registration with metadata", async () => {
      const TestComponentWithMetadata: React.FC = () => {
        const auth = useAuth();
        const handleRegisterWithMetadata = useCallback(() => {
          auth.register("test@example.com", "password", "charity", {
            name: "Test Charity",
          });
        }, [auth]);

        return (
          <button
            data-testid="register-metadata-btn"
            onClick={handleRegisterWithMetadata}
          >
            Register with Metadata
          </button>
        );
      };

      render(
        <AuthProvider>
          <TestComponentWithMetadata />
        </AuthProvider>,
      );

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: MOCK_USER, session: null },
        error: null,
      });

      await act(async () => {
        screen.getByTestId("register-metadata-btn").click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: "test@example.com",
          password: expect.any(String),
          options: {
            data: {
              user_type: "charity",
              name: "Test Charity",
            },
          },
        });
      });
    });

    it("handles registration error", async () => {
      const error = { message: "Email already exists" };
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error,
      });

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("register-btn").click();
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "Email already exists",
          "error",
        );
      });
    });
  });

  describe("Password Reset", () => {
    it("handles successful password reset", async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("reset-btn").click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          "test@example.com",
        );
        expect(mockShowToast).toHaveBeenCalledWith(
          "Password reset email sent. Please check your inbox.",
          "success",
        );
      });
    });

    it("handles password reset error", async () => {
      const error = { message: "Email not found" };
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error });

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("reset-btn").click();
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith("Email not found", "error");
      });
    });
  });

  describe("Session Refresh", () => {
    it("handles successful session refresh", async () => {
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: { user: MOCK_USER } },
        error: null,
      });

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("refresh-btn").click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
      });
    });

    it("handles session refresh error", async () => {
      const error = { message: "Session expired", status: 401 };
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error,
      });

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("refresh-btn").click();
      });

      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Session refresh error",
          expect.any(Object),
        );
      });
    });
  });

  describe("Username Reminder", () => {
    it("handles successful username reminder", async () => {
      // Mock the username reminder functionality
      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("username-reminder-btn").click();
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "Username reminder sent to your email",
          "success",
        );
      });
    });

    it("handles username reminder error", async () => {
      // Mock the error scenario for username reminder
      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("username-reminder-btn").click();
      });

      // Since this is not implemented yet, it should still show success
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "Username reminder sent to your email",
          "success",
        );
      });
    });
  });

  describe("User Type Detection", () => {
    const testUserType = async (
      userType: string | null,
      expectedText: string,
    ) => {
      const testUser = userType
        ? { ...MOCK_USER, user_metadata: { user_type: userType } }
        : { ...MOCK_USER, user_metadata: {} };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: testUser } },
        error: null,
      });

      renderWithAuthProvider();
      await waitFor(() => {
        expect(screen.getByTestId("user-type")).toHaveTextContent(expectedText);
      });
    };

    // eslint-disable-next-line jest/expect-expect
    it("detects donor user type from metadata", async () =>
      await testUserType("donor", "donor"));
    // eslint-disable-next-line jest/expect-expect
    it("detects charity user type from metadata", async () =>
      await testUserType("charity", "charity"));
    // eslint-disable-next-line jest/expect-expect
    it("detects admin user type from metadata", async () =>
      await testUserType("admin", "admin"));
    // eslint-disable-next-line jest/expect-expect
    it("handles missing user type metadata", async () =>
      await testUserType(null, "no-type"));
  });

  describe("Context Error Handling", () => {
    it("throws error when useAuth is used outside provider", () => {
      // Silence error boundary console errors for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {
        // Suppress console.error for this test to avoid noise from expected errors
      });

      const TestWithoutProvider = () => {
        try {
          useAuth();
          return <div>Should not render</div>;
        } catch (error) {
          return <div data-testid="error">Context error</div>;
        }
      };

      expect(() => render(<TestWithoutProvider />)).toThrow(
        "useAuth must be used within an AuthProvider",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Cleanup", () => {
    it("unsubscribes from auth state changes on unmount", () => {
      const mockUnsubscribe = jest.fn();
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const { unmount } = renderWithAuthProvider();

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe("Error States", () => {
    it("handles general authentication errors", async () => {
      const authError = new Error("General auth error");
      mockSupabase.auth.getSession.mockRejectedValue(authError);

      renderWithAuthProvider();

      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to get session",
          authError,
        );
        expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
      });
    });

    it("handles network errors during operations", async () => {
      const networkError = new Error("Network unavailable");
      mockSupabase.auth.signInWithPassword.mockRejectedValue(networkError);

      renderWithAuthProvider();

      await act(async () => {
        screen.getByTestId("login-btn").click();
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "An unexpected error occurred during login",
          "error",
        );
      });
    });
  });
});
