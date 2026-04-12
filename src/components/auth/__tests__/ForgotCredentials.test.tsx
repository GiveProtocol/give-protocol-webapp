import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ForgotCredentials } from "../ForgotCredentials";
import { useAuth } from "@/contexts/AuthContext";

// All mocks handled via moduleNameMapper:
// useAuth/AuthContext, Web3Context, ToastContext, SettingsContext,
// useTranslation, validation

const mockResetPassword = jest.fn();
const mockSendUsernameReminder = jest.fn();
const mockUseAuth = jest.mocked(useAuth);

describe("ForgotCredentials", () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    mockResetPassword.mockClear();
    mockSendUsernameReminder.mockClear();
    mockOnBack.mockClear();
    mockResetPassword.mockResolvedValue(undefined); // skipcq: JS-W1042 — mockResolvedValue requires an argument
    mockSendUsernameReminder.mockResolvedValue(undefined); // skipcq: JS-W1042 — mockResolvedValue requires an argument
    mockUseAuth.mockReturnValue({
      resetPassword: mockResetPassword,
      sendUsernameReminder: mockSendUsernameReminder,
      loading: false,
      user: null,
      userType: null,
      login: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn(),
      refreshSession: jest.fn(),
      register: jest.fn(),
      error: null,
    });
  });

  it("renders forgot password form", () => {
    render(
      <MemoryRouter>
        <ForgotCredentials type="password" onBack={mockOnBack} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeInTheDocument();
  });

  it("renders forgot username form", () => {
    render(
      <MemoryRouter>
        <ForgotCredentials type="username" onBack={mockOnBack} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Forgot Username")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send username/i }),
    ).toBeInTheDocument();
  });

  it("calls resetPassword when reset button clicked", async () => {
    render(
      <MemoryRouter>
        <ForgotCredentials type="password" onBack={mockOnBack} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("calls sendUsernameReminder when username button clicked", async () => {
    render(
      <MemoryRouter>
        <ForgotCredentials type="username" onBack={mockOnBack} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send username/i }));

    await waitFor(() => {
      expect(mockSendUsernameReminder).toHaveBeenCalledWith("test@example.com");
    });
  });
});
