import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DonorRegistration } from "../DonorRegistration";
import { useAuth } from "@/contexts/AuthContext";

// AuthContext, useAuth, and PasswordStrengthBar are all mocked via moduleNameMapper

const mockRegister = jest.fn();
const mockUseAuth = jest.mocked(useAuth);

describe("DonorRegistration", () => {
  beforeEach(() => {
    mockRegister.mockClear();
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      loading: false,
      error: null,
      user: null,
      userType: null,
      isAuthenticated: false,
      login: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      refreshSession: jest.fn(),
      sendUsernameReminder: jest.fn(),
    });
  });

  it("renders registration form fields and submit button", () => {
    render(<DonorRegistration />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create donor account/i }),
    ).toBeInTheDocument();
  });

  it("does not render a Google OAuth button", () => {
    render(<DonorRegistration />);
    expect(
      screen.queryByRole("button", { name: /google/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/continue with google/i)).not.toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    render(<DonorRegistration />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bad@domain" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /create donor account/i }),
    );
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows validation error for short password", async () => {
    render(<DonorRegistration />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "donor@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "short" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /create donor account/i }),
    );
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/8 characters/i);
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows validation error when passwords do not match", async () => {
    render(<DonorRegistration />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "donor@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "different456" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /create donor account/i }),
    );
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/do not match/i);
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("calls register with correct args on valid submission", async () => {
    mockRegister.mockResolvedValueOnce(undefined); // skipcq: JS-W1042 — mockResolvedValueOnce requires an argument
    render(<DonorRegistration />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "donor@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /create donor account/i }),
    );
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "donor@example.com",
        "password123",
        "donor",
        { type: "donor" },
      );
    });
  });
});
