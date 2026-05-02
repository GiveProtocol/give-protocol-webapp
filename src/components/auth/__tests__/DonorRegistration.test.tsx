import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DonorRegistration } from "../DonorRegistration";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

// useUnifiedAuth and PasswordStrengthBar are both mocked via moduleNameMapper

const mockSignUpWithEmail = jest.fn();
const mockSignInWithPasskey = jest.fn();
const mockSignInWithGoogle = jest.fn();

const mockSignInWithWallet = jest.fn();
const mockUseUnifiedAuth = jest.mocked(useUnifiedAuth);

describe("DonorRegistration", () => {
  beforeEach(() => {
    mockSignUpWithEmail.mockClear();
    mockSignInWithPasskey.mockClear();
    mockSignInWithGoogle.mockClear();
    mockSignInWithWallet.mockClear();
    mockUseUnifiedAuth.mockReturnValue({
      signUpWithEmail: mockSignUpWithEmail,
      signInWithPasskey: mockSignInWithPasskey,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithWallet: mockSignInWithWallet,
      isPasskeySupported: true,
      loading: false,
      user: null,
      isAuthenticated: false,
      authMethod: null,
      email: null,
      walletAddress: null,
      isWalletConnected: false,
      isWalletLinked: false,
      chainId: null,
      role: "donor",
      walletAuthStep: null,
      error: null,
      signInWithEmail: jest.fn(),
      registerPasskey: jest.fn(),
      linkWallet: jest.fn(),
      unlinkWallet: jest.fn(),
      signOut: jest.fn(),
    });
  });

  it("renders the email field and primary auth buttons", () => {
    render(<DonorRegistration />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText("Sign up with Passkey")).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });

  it("does not render password fields by default", () => {
    render(<DonorRegistration />);
    expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument();
  });

  it("renders the 'Or set a password' collapsible toggle", () => {
    render(<DonorRegistration />);
    expect(screen.getByText("Or set a password")).toBeInTheDocument();
  });

  it("expands password fields when toggle is clicked", () => {
    render(<DonorRegistration />);
    fireEvent.click(screen.getByText("Or set a password"));
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create donor account/i }),
    ).toBeInTheDocument();
  });

  it("calls signInWithGoogle when Google button is clicked", async () => {
    mockSignInWithGoogle.mockResolvedValueOnce(undefined); // skipcq: JS-W1042 — mockResolvedValueOnce requires an argument
    render(<DonorRegistration />);
    fireEvent.click(screen.getByText("Continue with Google"));
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it("calls signInWithWallet when wallet button is clicked", async () => {
    mockSignInWithWallet.mockResolvedValueOnce(undefined); // skipcq: JS-W1042 — mockResolvedValueOnce requires an argument
    render(<DonorRegistration />);
    fireEvent.click(screen.getByText("Connect Wallet"));
    await waitFor(() => {
      expect(mockSignInWithWallet).toHaveBeenCalled();
    });
  });

  it("shows validation error for invalid email in password form", async () => {
    render(<DonorRegistration />);
    fireEvent.click(screen.getByText("Or set a password"));
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
    expect(mockSignUpWithEmail).not.toHaveBeenCalled();
  });

  it("shows validation error for short password", async () => {
    render(<DonorRegistration />);
    fireEvent.click(screen.getByText("Or set a password"));
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
    expect(mockSignUpWithEmail).not.toHaveBeenCalled();
  });

  it("shows validation error when passwords do not match", async () => {
    render(<DonorRegistration />);
    fireEvent.click(screen.getByText("Or set a password"));
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
    expect(mockSignUpWithEmail).not.toHaveBeenCalled();
  });

  it("calls signUpWithEmail with correct args on valid password form submission", async () => {
    mockSignUpWithEmail.mockResolvedValueOnce(undefined); // skipcq: JS-W1042 — mockResolvedValueOnce requires an argument
    render(<DonorRegistration />);
    fireEvent.click(screen.getByText("Or set a password"));
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
      expect(mockSignUpWithEmail).toHaveBeenCalledWith(
        "donor@example.com",
        "password123",
        { type: "donor" },
      );
    });
  });
});
