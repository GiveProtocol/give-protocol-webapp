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

      expect(mocks.getSession).toBeInstanceOf(Function);
      expect(mocks.onAuthStateChange).toBeInstanceOf(Function);
      expect(mocks.signInWithPassword).toBeInstanceOf(Function);
      expect(mocks.signInWithOAuth).toBeInstanceOf(Function);
      expect(mocks.signOut).toBeInstanceOf(Function);
      expect(mocks.signUp).toBeInstanceOf(Function);
      expect(mocks.resetPasswordForEmail).toBeInstanceOf(Function);
      expect(mocks.refreshSession).toBeInstanceOf(Function);
    });
  });

  describe("setupAuthTest", () => {
    it("sets up mocks and returns mockShowToast", () => {
      const result = setupAuthTest(mockSupabase, mockUseToast);

      expect(result.mockShowToast).toBeInstanceOf(Function);
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
    const mockScreen = {
      getByTestId: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("authSuccess checks for email", () => {
      const mockElement = { toHaveTextContent: jest.fn() };
      mockScreen.getByTestId.mockReturnValue(mockElement);

      commonExpectations.authSuccess(mockScreen);

      expect(mockScreen.getByTestId).toHaveBeenCalledWith("user");
      expect(mockElement.toHaveTextContent).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("authError checks for error message", () => {
      const mockElement = { toHaveTextContent: jest.fn() };
      mockScreen.getByTestId.mockReturnValue(mockElement);

      commonExpectations.authError(mockScreen, "Login failed");

      expect(mockScreen.getByTestId).toHaveBeenCalledWith("error");
      expect(mockElement.toHaveTextContent).toHaveBeenCalledWith(
        "Login failed",
      );
    });

    it("web3Connected checks connection status", () => {
      const mockElement = { toHaveTextContent: jest.fn() };
      mockScreen.getByTestId.mockReturnValue(mockElement);

      commonExpectations.web3Connected(mockScreen);

      expect(mockScreen.getByTestId).toHaveBeenCalledWith("connected");
      expect(mockElement.toHaveTextContent).toHaveBeenCalledWith("connected");
    });

    it("web3Disconnected checks disconnection status", () => {
      const mockElement = { toHaveTextContent: jest.fn() };
      mockScreen.getByTestId.mockReturnValue(mockElement);

      commonExpectations.web3Disconnected(mockScreen);

      expect(mockScreen.getByTestId).toHaveBeenCalledWith("connected");
      expect(mockElement.toHaveTextContent).toHaveBeenCalledWith(
        "disconnected",
      );
    });
  });
});
