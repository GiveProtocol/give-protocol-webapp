import { jest } from '@jest/globals';
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("ForgotCredentials", () => {
  beforeEach(() => {
    mockResetPassword.mockClear();
    mockSendUsernameReminder.mockClear();
  });

  it("renders forgot credentials form", () => {
    render(<ForgotCredentials />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send username/i }),
    ).toBeInTheDocument();
  });

  it("calls resetPassword when reset button clicked", () => {
    render(<ForgotCredentials />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(mockResetPassword).toHaveBeenCalledWith("test@example.com");
  });

  it("calls sendUsernameReminder when username button clicked", () => {
    render(<ForgotCredentials />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send username/i }));

    expect(mockSendUsernameReminder).toHaveBeenCalledWith("test@example.com");
  });
});
