import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthSignup from "../AuthSignup";

// useUnifiedAuth calls useAuth (mocked via authContextMock) and useWeb3
// (mocked via web3ContextMock). With user: null, isAuthenticated is false
// so the sign-up form renders without redirecting.
// Button, Logo, PasswordStrengthBar, and validation utils are mocked via
// moduleNameMapper. FormInput is a simple wrapper that renders a real <input>.

const renderAuthSignup = () =>
  render(
    <MemoryRouter>
      <AuthSignup />
    </MemoryRouter>,
  );

describe("AuthSignup", () => {
  describe("Heading", () => {
    it("renders the sign-up heading", () => {
      renderAuthSignup();
      expect(screen.getByText("Create your donor account")).toBeInTheDocument();
    });

    it("renders the subtitle text", () => {
      renderAuthSignup();
      expect(
        screen.getByText("Start your transparent giving journey"),
      ).toBeInTheDocument();
    });
  });

  describe("Identity fields", () => {
    it("renders the email input", () => {
      renderAuthSignup();
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    });

    it("renders the display name input", () => {
      renderAuthSignup();
      expect(
        screen.getByPlaceholderText("Display name (optional)"),
      ).toBeInTheDocument();
    });

    it("does not render password inputs by default", () => {
      renderAuthSignup();
      expect(
        screen.queryByPlaceholderText("Password"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("Confirm password"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Auth method buttons", () => {
    it("renders the Sign up with Passkey button", () => {
      renderAuthSignup();
      expect(
        screen.getByText("Sign up with Passkey"),
      ).toBeInTheDocument();
    });

    it("renders the Continue with Google button", () => {
      renderAuthSignup();
      expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    });

    it("renders the Continue with Apple button", () => {
      renderAuthSignup();
      expect(screen.getByText("Continue with Apple")).toBeInTheDocument();
    });

    it("renders the Connect Wallet button", () => {
      renderAuthSignup();
      expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
    });
  });

  describe("Collapsible password section", () => {
    it("renders the 'Or set a password' toggle", () => {
      renderAuthSignup();
      expect(screen.getByText("Or set a password")).toBeInTheDocument();
    });

    it("expands password fields when toggle is clicked", () => {
      renderAuthSignup();
      fireEvent.click(screen.getByText("Or set a password"));
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Confirm password"),
      ).toBeInTheDocument();
      expect(screen.getByText("Create Account")).toBeInTheDocument();
    });
  });

  describe("Navigation links", () => {
    it("renders the sign-in link", () => {
      renderAuthSignup();
      expect(screen.getByText(/Sign in/)).toBeInTheDocument();
    });

    it("renders the nonprofit profile link", () => {
      renderAuthSignup();
      expect(
        screen.getByText("I manage a Nonprofit Profile"),
      ).toBeInTheDocument();
    });
  });
});
