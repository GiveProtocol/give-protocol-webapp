import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "../Navbar";

jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string, _fallback?: string) => key),
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

jest.mock("@/contexts/CurrencyContext", () => ({
  useCurrencyContext: jest.fn(() => ({
    setSelectedCurrency: jest.fn(),
  })),
}));

jest.mock("@/config/docs", () => ({
  DOCS_CONFIG: { url: "https://docs.example.com" },
}));

jest.mock("../Logo", () => ({
  Logo: ({ className }: { className?: string }) => (
    <div data-testid="logo" className={className}>
      Logo
    </div>
  ),
}));

jest.mock("../SettingsMenu", () => ({
  SettingsMenu: () => <div data-testid="settings-menu">Settings</div>,
}));

jest.mock("lucide-react", () => ({
  Menu: ({ className }: { className?: string }) => (
    <span data-testid="menu-icon" className={className}>
      Menu
    </span>
  ),
  X: ({ className }: { className?: string }) => (
    <span data-testid="x-icon" className={className}>
      X
    </span>
  ),
}));

jest.mock("react-router-dom", () => ({
  Link: ({
    to,
    children,
    className,
    onClick,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={to} className={className} data-testid="nav-link" onClick={onClick}>
      {children}
    </a>
  ),
  useLocation: jest.fn(() => ({ pathname: "/" })),
}));

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the "Give Protocol" brand name', () => {
    render(<Navbar />);
    expect(screen.getByText("Give Protocol")).toBeInTheDocument();
  });

  it("renders the logo", () => {
    render(<Navbar />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("renders desktop navigation links", () => {
    render(<Navbar />);
    expect(screen.getByText("nav.about")).toBeInTheDocument();
    expect(screen.getByText("nav.docs")).toBeInTheDocument();
    expect(screen.getByText("nav.legal")).toBeInTheDocument();
  });

  it('renders the "Launch App" link', () => {
    render(<Navbar />);
    expect(screen.getByText("nav.launchApp")).toBeInTheDocument();
  });

  it("renders a mobile menu button", () => {
    render(<Navbar />);
    const menuButton = screen.getByRole("button");
    expect(menuButton).toBeInTheDocument();
  });

  it("toggles mobile menu on button click", () => {
    render(<Navbar />);
    const menuButton = screen.getByRole("button");

    expect(screen.queryByText("nav.launchApp")).toBeInTheDocument();

    fireEvent.click(menuButton);

    const mobileMenu = document.getElementById("mobile-menu");
    expect(mobileMenu).toBeInTheDocument();
  });

  it("renders the settings menu", () => {
    render(<Navbar />);
    expect(screen.getByTestId("settings-menu")).toBeInTheDocument();
  });
});
