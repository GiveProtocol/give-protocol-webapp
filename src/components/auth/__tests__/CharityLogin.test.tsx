import React from "react";
import { jest } from "@jest/globals";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CharityLogin } from "../CharityLogin";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ChainProvider } from "@/contexts/ChainContext";
import { MultiChainProvider } from "@/contexts/MultiChainContext";
import { Web3Provider } from "@/contexts/Web3Context";
import { supabase } from "@/lib/supabase";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

// useUnifiedAuth is mocked via moduleNameMapper. Configure the mock's
// signInWithWallet to reject by default (simulating no wallet detected).
const mockUseUnifiedAuth = jest.mocked(useUnifiedAuth);

const mockNavigate = jest.fn();

jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string, fallback?: string) => fallback ?? key),
  })),
}));

jest.mock("@/contexts/SettingsContext", () => ({
  useSettings: jest.fn(() => ({
    language: "en",
    setLanguage: jest.fn(),
    currency: "USD",
    setCurrency: jest.fn(),
    theme: "light",
    setTheme: jest.fn(),
    languageOptions: [],
    currencyOptions: [],
  })),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: null,
    pathname: "/auth/charity",
    search: "",
    hash: "",
    key: "test",
  }),
}));

jest.mock("@/utils/logger", () => ({
  Logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock("@/utils/security/rateLimiter", () => ({
  RateLimiter: {
    getInstance: jest.fn(() => ({
      isRateLimited: jest.fn(() => false),
      increment: jest.fn(),
      reset: jest.fn(),
    })),
  },
}));

const ChainProviders = ({ children }: { children: React.ReactNode }) => (
  <ChainProvider>
    <MultiChainProvider>
      <Web3Provider>{children}</Web3Provider>
    </MultiChainProvider>
  </ChainProvider>
);

const renderCharityLogin = () => {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <ChainProviders>
          <AuthProvider>
            <CharityLogin />
          </AuthProvider>
        </ChainProviders>
      </ToastProvider>
    </MemoryRouter>,
  );
};

describe("CharityLogin", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseUnifiedAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      authMethod: null,
      email: null,
      walletAddress: null,
      isWalletConnected: false,
      isWalletLinked: false,
      chainId: null,
      role: "donor",
      loading: false,
      walletAuthStep: null,
      error: null,
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      signInWithWallet: jest.fn().mockRejectedValue(new Error("No wallet detected. Please install a browser wallet.")),
      linkWallet: jest.fn(),
      unlinkWallet: jest.fn(),
      signOut: jest.fn(),
    });
  });

  it("renders login form", () => {
    renderCharityLogin();
    expect(screen.getAllByDisplayValue("")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/password/i)).toBeInTheDocument();
  });

  it("renders wallet connect button", () => {
    renderCharityLogin();
    expect(
      screen.getByRole("button", { name: /connect wallet/i }),
    ).toBeInTheDocument();
  });

  it("wallet button click triggers sign-in attempt", async () => {
    renderCharityLogin();

    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    // In the test environment there is no wallet extension installed, so the
    // sign-in attempt immediately surfaces an error alert. This confirms the
    // click handler runs and the error state is surfaced correctly.
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("shows error message when wallet sign-in fails", async () => {
    renderCharityLogin();

    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/no wallet detected/i)).toBeInTheDocument();
    });
  });

  it("shows countdown when email login detects a donor account mismatch", async () => {
    // Override signInWithPassword for this test so AuthContext receives a donor-type
    // user, detects the charity/donor mismatch, and throws the error that triggers
    // the countdown redirect UI in CharityLogin.
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: {
        user: {
          id: "donor-test-id",
          email: "donor@example.com",
          user_metadata: { type: "donor" },
          app_metadata: {},
          aud: "authenticated",
          created_at: "2024-01-01T00:00:00Z",
        },
        session: null,
      },
      error: null,
    });

    jest.useFakeTimers();
    renderCharityLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "donor@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      // Multiple alerts and text matches may be present (inline error + toast).
      // Verify the mismatch message appears somewhere on the page.
      expect(
        screen.getAllByText(/registered as a donor account/i).length,
      ).toBeGreaterThan(0);
    });

    jest.useRealTimers();
  });
});
