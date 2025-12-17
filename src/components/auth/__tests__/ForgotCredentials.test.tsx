import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { ForgotCredentials } from "../ForgotCredentials";

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    resetPassword: jest.fn(),
    sendUsernameReminder: jest.fn(),
    loading: false,
  }),
}));

describe("ForgotCredentials", () => {
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
    const mockResetPassword = jest.fn();
    jest.mocked(jest.requireMock("@/hooks/useAuth").useAuth).mockReturnValue({
      resetPassword: mockResetPassword,
      sendUsernameReminder: jest.fn(),
      loading: false,
    });

    render(<ForgotCredentials />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(mockResetPassword).toHaveBeenCalledWith("test@example.com");
  });

  it("calls sendUsernameReminder when username button clicked", () => {
    const mockSendUsernameReminder = jest.fn();
    jest.mocked(jest.requireMock("@/hooks/useAuth").useAuth).mockReturnValue({
      resetPassword: jest.fn(),
      sendUsernameReminder: mockSendUsernameReminder,
      loading: false,
    });

    render(<ForgotCredentials />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send username/i }));

    expect(mockSendUsernameReminder).toHaveBeenCalledWith("test@example.com");
  });
});
