import { jest } from "@jest/globals";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { CharityLogin } from "../CharityLogin";
import { MemoryRouter } from "react-router-dom";

const mockLogin = jest.fn();
const mockDisconnect = jest.fn();
const mockNavigate = jest.fn();
const mockSignInWithWallet = jest.fn();

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(() => ({
    login: mockLogin,
    loading: false,
    error: null,
  })),
}));

jest.mock("@/hooks/useUnifiedAuth", () => ({
  useUnifiedAuth: jest.fn(() => ({
    signInWithWallet: mockSignInWithWallet,
    loading: false,
  })),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    login: mockLogin,
    loading: false,
    error: null,
    user: null,
    userType: null,
  })),
}));

jest.mock("@/contexts/Web3Context", () => ({
  useWeb3: jest.fn(() => ({
    disconnect: mockDisconnect,
    isConnected: false,
    account: null,
    chainId: 1287,
  })),
}));

jest.mock("@/contexts/ToastContext", () => ({
  useToast: jest.fn(() => ({
    showToast: jest.fn(),
  })),
}));

jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string, fallback?: string) => fallback || key),
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

const renderCharityLogin = () => {
  return render(
    <MemoryRouter>
      <CharityLogin />
    </MemoryRouter>,
  );
};

describe("CharityLogin", () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockNavigate.mockClear();
    mockDisconnect.mockClear();
    mockSignInWithWallet.mockClear();
  });

  it("renders login form", () => {
    renderCharityLogin();
    expect(screen.getAllByDisplayValue("")).toHaveLength(2); // Email and password inputs
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument(); // Email label
    expect(screen.getByText(/password/i)).toBeInTheDocument(); // Password label
  });

  it("renders wallet connect button", () => {
    renderCharityLogin();
    expect(
      screen.getByRole("button", { name: /connect wallet/i }),
    ).toBeInTheDocument();
  });

  it("calls signInWithWallet with charity account type on wallet button click", async () => {
    mockSignInWithWallet.mockResolvedValueOnce(undefined);
    renderCharityLogin();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));
    });

    await waitFor(() => {
      expect(mockSignInWithWallet).toHaveBeenCalledWith("charity");
    });
  });

  it("shows error message when wallet sign-in fails", async () => {
    mockSignInWithWallet.mockRejectedValueOnce(
      new Error("No wallet detected"),
    );
    renderCharityLogin();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/no wallet detected/i)).toBeInTheDocument();
    });
  });

  it("calls login on form submission", () => {
    renderCharityLogin();

    const inputs = screen.getAllByDisplayValue("");
    const emailInput = inputs.find(
      (input) => input.getAttribute("type") === "email",
    );
    const passwordInput = inputs.find(
      (input) => input.getAttribute("type") === "password",
    );

    // Ensure inputs are found before using them
    if (!emailInput || !passwordInput) {
      throw new Error("Email or password input not found in the form");
    }

    fireEvent.change(emailInput, {
      target: { value: "test@charity.com" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockLogin).toHaveBeenCalledWith(
      "test@charity.com",
      "password123",
      "charity",
    );
  });

  it("shows countdown and redirects on donor account mismatch", async () => {
    jest.useFakeTimers();
    mockLogin.mockRejectedValue(
      new Error("This account is registered as a donor account"),
    );

    renderCharityLogin();

    const inputs = screen.getAllByDisplayValue("");
    const emailInput = inputs.find((i) => i.getAttribute("type") === "email");
    const passwordInput = inputs.find((i) => i.getAttribute("type") === "password");
    if (!emailInput || !passwordInput) {
      throw new Error("Inputs not found");
    }

    fireEvent.change(emailInput, { target: { value: "donor@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "pass" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/Redirecting in 3/);

    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(screen.getByRole("alert")).toHaveTextContent(/Redirecting in 2/);

    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(screen.getByRole("alert")).toHaveTextContent(/Redirecting in 1/);

    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(mockNavigate).toHaveBeenCalledWith("/login?type=donor");

    jest.useRealTimers();
  });
});
