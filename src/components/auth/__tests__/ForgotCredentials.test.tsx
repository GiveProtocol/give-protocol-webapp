import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotCredentials } from "../ForgotCredentials";

const mockResetPassword = jest.fn();
const mockSendUsernameReminder = jest.fn();

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
    sendUsernameReminder: mockSendUsernameReminder,
    loading: false,
  }),
}));

jest.mock("@/utils/validation", () => ({
  validateEmail: jest.fn((email: string) => email.includes("@")),
}));

describe("ForgotCredentials", () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    mockResetPassword.mockClear();
    mockSendUsernameReminder.mockClear();
    mockOnBack.mockClear();
    mockResetPassword.mockResolvedValue(undefined);
    mockSendUsernameReminder.mockResolvedValue(undefined);
  });

  it("renders forgot password form", () => {
    render(<ForgotCredentials type="password" onBack={mockOnBack} />);
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeInTheDocument();
  });

  it("renders forgot username form", () => {
    render(<ForgotCredentials type="username" onBack={mockOnBack} />);
    expect(screen.getByText("Forgot Username")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send username/i }),
    ).toBeInTheDocument();
  });

  it("calls resetPassword when reset button clicked", async () => {
    render(<ForgotCredentials type="password" onBack={mockOnBack} />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("calls sendUsernameReminder when username button clicked", async () => {
    render(<ForgotCredentials type="username" onBack={mockOnBack} />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send username/i }));

    await waitFor(() => {
      expect(mockSendUsernameReminder).toHaveBeenCalledWith("test@example.com");
    });
  });
});
