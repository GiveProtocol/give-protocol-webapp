import { jest } from '@jest/globals';
import {
  createMockAuthFlow,
  createMockWeb3Flow,
  MOCK_USER,
  createAuthMocks,
  setupAuthTest,
  commonExpectations,
} from "../authTestHelpers";

// Mock dependencies
const mockUseToast = jest.fn();
const mockSupabase = { auth: {} };

describe("authTestHelpers", () => {
  describe("createMockAuthFlow", () => {
    it("returns success flow", () => {
      const result = createMockAuthFlow("success");
      expect(result).toEqual({
        data: { user: { id: "123", email: "test@example.com" }, session: {} },
        error: null,
      });
    });

    it("returns error flow with default error", () => {
      const result = createMockAuthFlow("error");
      expect(result).toEqual({
        data: { user: null, session: null },
        error: { message: "Test error" },
      });
    });

    it("returns error flow with custom error", () => {
      const customError = { message: "Custom error", code: 500 };
      const result = createMockAuthFlow("error", customError);
      expect(result).toEqual({
        data: { user: null, session: null },
        error: customError,
      });
    });
  });

  describe("createMockWeb3Flow", () => {
    it("returns success flow", () => {
      const result = createMockWeb3Flow("success");
      expect(result).toEqual(["0x1234567890123456789012345678901234567890"]);
    });

    it("throws error with default message", () => {
      expect(() => createMockWeb3Flow("error")).toThrow("Test error");
    });

    it("throws custom error", () => {
      const customError = new Error("Custom Web3 error");
      expect(() => createMockWeb3Flow("error", customError)).toThrow(
        "Custom Web3 error",
      );
    });
  });

  describe("MOCK_USER", () => {
    it("has expected properties", () => {
      expect(MOCK_USER).toEqual({
        id: "123",
        email: "test@example.com",
        user_metadata: { user_type: "donor" },
        app_metadata: {},
        aud: "authenticated",
        created_at: "2024-01-01",
      });
    });
  });

  describe("createAuthMocks", () => {
    it("creates all auth method mocks", () => {
      const mocks = createAuthMocks();

      expect(typeof mocks.getSession).toBe('function');
      expect(typeof mocks.onAuthStateChange).toBe('function');
      expect(typeof mocks.signInWithPassword).toBe('function');
      expect(typeof mocks.signInWithOAuth).toBe('function');
      expect(typeof mocks.signOut).toBe('function');
      expect(typeof mocks.signUp).toBe('function');
      expect(typeof mocks.resetPasswordForEmail).toBe('function');
      expect(typeof mocks.refreshSession).toBe('function');
    });
  });

  describe("setupAuthTest", () => {
    it("sets up mocks and returns mockShowToast", () => {
      const result = setupAuthTest(mockSupabase, mockUseToast);

      expect(typeof result.mockShowToast).toBe('function');
      expect(mockUseToast).toHaveBeenCalledWith({
        showToast: result.mockShowToast,
      });
      expect(mockSupabase.auth).toBeDefined();
    });
  });

  describe("testAuthFlow", () => {
    it("handles successful auth flow", async () => {
      const { testAuthFlow } = await import("../authTestHelpers");
      const mockSupabase = { auth: { signInWithPassword: jest.fn() } };
      const mockScreen = {
        getByTestId: jest.fn().mockReturnValue({ click: jest.fn() }),
        __mockShowToast: jest.fn()
      };
      const mockResponse = { data: { user: {} }, error: null };

      mockSupabase.auth.signInWithPassword.mockResolvedValue(mockResponse);

      await testAuthFlow(
        mockSupabase,
        "signInWithPassword",
        mockResponse,
        mockScreen,
        "login-button",
        ["Success", "Login successful"]
      );

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
      expect(mockScreen.getByTestId).toHaveBeenCalledWith("login-button");
    });

    it("handles error auth flow", async () => {
      const { testAuthFlow } = await import("../authTestHelpers");
      const mockSupabase = { auth: { signInWithPassword: jest.fn() } };
      const mockScreen = {
        getByTestId: jest.fn().mockReturnValue({ click: jest.fn() }),
        __mockShowToast: jest.fn()
      };
      const mockError = new Error("Auth failed");

      mockSupabase.auth.signInWithPassword.mockRejectedValue(mockError);

      await testAuthFlow(
        mockSupabase,
        "signInWithPassword",
        mockError,
        mockScreen,
        "login-button",
        ["Error", "Auth failed"]
      );

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  describe("commonExpectations", () => {
    it("authSuccess function exists and is callable", () => {
      expect(typeof commonExpectations.authSuccess).toBe("function");
    });

    it("authError function exists and is callable", () => {
      expect(typeof commonExpectations.authError).toBe("function");
    });

    it("web3Connected function exists and is callable", () => {
      expect(typeof commonExpectations.web3Connected).toBe("function");
    });

    it("web3Disconnected function exists and is callable", () => {
      expect(typeof commonExpectations.web3Disconnected).toBe("function");
    });

    it("commonExpectations has all expected methods", () => {
      expect(commonExpectations).toHaveProperty("authSuccess");
      expect(commonExpectations).toHaveProperty("authError");
      expect(commonExpectations).toHaveProperty("web3Connected");
      expect(commonExpectations).toHaveProperty("web3Disconnected");
    });
  });
});
