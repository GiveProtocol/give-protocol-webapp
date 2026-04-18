import React from "react";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "../AppNavbar";

// Logo, SettingsMenu, ConnectButton, ClientOnly, Wallet components,
// useTranslation, useAuth, useWeb3, MultiChainContext, and docs config
// are all mocked via moduleNameMapper.
//
// Note: useMultiChainContext mock (from moduleNameMapper) uses default values
// and cannot be overridden via jest.mocked() due to a babel-jest interop
// limitation with jest.fn() identity. The defaults (isConnected: false,
// wallet: null) are sufficient for AppNavbar rendering tests.

const mockUseAuth = jest.mocked(useAuth);

interface MockAuthUser {
  id: string;
  email: string;
}

interface MockAuthReturnValue {
  user: MockAuthUser | null;
  userType: string | null;
  loading: boolean;
  error: null;
  login: jest.Mock;
  loginWithGoogle: jest.Mock;
  logout: jest.Mock;
  resetPassword: jest.Mock;
  refreshSession: jest.Mock;
  register: jest.Mock;
  sendUsernameReminder: jest.Mock;
}

const createAuthMock = (
  overrides: Partial<MockAuthReturnValue> = {},
): MockAuthReturnValue => ({
  user: null,
  userType: null,
  loading: false,
  error: null,
  login: jest.fn(),
  loginWithGoogle: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
  refreshSession: jest.fn(),
  register: jest.fn(),
  sendUsernameReminder: jest.fn(),
  ...overrides,
});

const renderNavbar = (initialRoute = "/browse") =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppNavbar />
    </MemoryRouter>,
  );

describe("AppNavbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(createAuthMock());
  });

  describe("Brand and logo", () => {
    it("renders the Give Protocol brand name", () => {
      renderNavbar();
      expect(screen.getByText("Give Protocol")).toBeInTheDocument();
    });

    it("renders the logo component", () => {
      renderNavbar();
      expect(screen.getByTestId("logo")).toBeInTheDocument();
    });

    it("renders the home link with correct aria-label", () => {
      renderNavbar();
      const homeLink = screen.getByLabelText("Give Protocol home");
      expect(homeLink).toBeInTheDocument();
    });
  });

  describe("Navigation links (unauthenticated)", () => {
    it("renders Browse link", () => {
      renderNavbar();
      expect(screen.getByText("nav.browse")).toBeInTheDocument();
    });

    it("renders Opportunities link", () => {
      renderNavbar();
      expect(screen.getByText("nav.opportunities")).toBeInTheDocument();
    });

    it("does not render Contributions link when not authenticated", () => {
      renderNavbar();
      expect(screen.queryByText("nav.contributions")).not.toBeInTheDocument();
    });

    it("does not render Dashboard button when not authenticated", () => {
      renderNavbar();
      expect(screen.queryByText("nav.dashboard")).not.toBeInTheDocument();
    });
  });

  describe("Navigation links (authenticated)", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(
        createAuthMock({
          user: { id: "user-1", email: "test@example.com" },
          userType: "donor",
        }),
      );
    });

    it("renders Contributions link when authenticated", () => {
      renderNavbar();
      expect(screen.getByText("nav.contributions")).toBeInTheDocument();
    });

    it("renders Dashboard button when authenticated", () => {
      renderNavbar();
      expect(screen.getByText("nav.dashboard")).toBeInTheDocument();
    });

    it("renders Monthly Donations link for donor user type", () => {
      renderNavbar();
      expect(screen.getByText("Monthly Donations")).toBeInTheDocument();
    });

    it("does not render Monthly Donations link for charity user type", () => {
      mockUseAuth.mockReturnValue(
        createAuthMock({
          user: { id: "charity-1", email: "charity@example.com" },
          userType: "charity",
        }),
      );
      renderNavbar();
      expect(screen.queryByText("Monthly Donations")).not.toBeInTheDocument();
    });
  });

  describe("Limited navigation pages", () => {
    it("renders About, Docs, Legal, Privacy links on /about page", () => {
      renderNavbar("/about");
      expect(screen.getByText("nav.about")).toBeInTheDocument();
      expect(screen.getByText("nav.docs")).toBeInTheDocument();
      expect(screen.getByText("nav.legal")).toBeInTheDocument();
      expect(screen.getByText("Privacy")).toBeInTheDocument();
    });

    it("does not render Browse link on limited navigation pages", () => {
      renderNavbar("/about");
      expect(screen.queryByText("nav.browse")).not.toBeInTheDocument();
    });
  });

  describe("Sign In button", () => {
    it("renders Sign In link when not connected and not authenticated", () => {
      renderNavbar();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    it("does not render Sign In link when authenticated", () => {
      mockUseAuth.mockReturnValue(
        createAuthMock({
          user: { id: "user-1", email: "test@example.com" },
          userType: "donor",
        }),
      );
      renderNavbar();
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
    });
  });

  describe("Connect button (authenticated, not connected)", () => {
    it("renders ConnectButton when authenticated but wallet not connected", () => {
      mockUseAuth.mockReturnValue(
        createAuthMock({
          user: { id: "user-1", email: "test@example.com" },
          userType: "donor",
        }),
      );
      renderNavbar();
      expect(screen.getByTestId("connect-button")).toBeInTheDocument();
    });
  });

  describe("Settings menu", () => {
    it("renders the settings menu", () => {
      renderNavbar();
      expect(screen.getByTestId("settings-menu")).toBeInTheDocument();
    });
  });

  describe("Mobile menu toggle", () => {
    it("renders a mobile menu button", () => {
      renderNavbar();
      const menuButton = screen.getByLabelText("Open menu");
      expect(menuButton).toBeInTheDocument();
    });

    it("opens mobile menu when button is clicked", () => {
      renderNavbar();
      const menuButton = screen.getByLabelText("Open menu");
      fireEvent.click(menuButton);

      const mobileMenu = document.getElementById("mobile-menu");
      expect(mobileMenu).toBeInTheDocument();
    });

    it("shows close menu label when menu is open", () => {
      renderNavbar();
      const menuButton = screen.getByLabelText("Open menu");
      fireEvent.click(menuButton);
      expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    });

    it("closes mobile menu when toggled again", () => {
      renderNavbar();
      const menuButton = screen.getByLabelText("Open menu");

      fireEvent.click(menuButton);
      expect(document.getElementById("mobile-menu")).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText("Close menu"));
      expect(document.getElementById("mobile-menu")).not.toBeInTheDocument();
    });
  });

  describe("Application navigation aria label", () => {
    it("renders nav with application navigation aria-label", () => {
      renderNavbar();
      expect(
        screen.getByLabelText("Application navigation"),
      ).toBeInTheDocument();
    });
  });
});
