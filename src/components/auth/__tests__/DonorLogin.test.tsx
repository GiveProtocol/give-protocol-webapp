import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DonorLogin } from "../DonorLogin";

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    loading: false,
    error: null,
    user: null,
    isAuthenticated: false,
    logout: jest.fn(),
    register: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    loading: false,
    error: null,
    user: null,
    isAuthenticated: false,
    logout: jest.fn(),
    register: jest.fn(),
  }),
}));

jest.mock("@/contexts/Web3Context", () => ({
  useWeb3: jest.fn(() => ({
    address: null,
    isConnected: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    switchChain: jest.fn(),
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
    pathname: "/login",
    search: "",
    hash: "",
    key: "test",
  }),
}));

describe("DonorLogin", () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockNavigate.mockClear();
  });

  it("renders login form", () => {
    render(<DonorLogin />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("calls login on form submission", () => {
    render(<DonorLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@donor.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockLogin).toHaveBeenCalledWith(
      "test@donor.com",
      "password123",
      "donor",
    );
  });

  it("shows countdown and redirects on charity account mismatch", async () => {
    jest.useFakeTimers();
    mockLogin.mockRejectedValue(
      new Error("This account is registered as a charity account"),
    );

    render(<DonorLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "charity@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "pass" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/Redirecting in 3/);

    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(screen.getByRole("alert")).toHaveTextContent(/Redirecting in 2/);

    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(screen.getByRole("alert")).toHaveTextContent(/Redirecting in 1/);

    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(mockNavigate).toHaveBeenCalledWith("/login?type=charity");

    jest.useRealTimers();
  });
});
