import React from "react";
import { render, screen } from "@testing-library/react";
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

  describe("Form inputs", () => {
    it("renders the email input", () => {
      renderAuthSignup();
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    });

    it("renders the password input", () => {
      renderAuthSignup();
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    });

    it("renders the confirm password input", () => {
      renderAuthSignup();
      expect(
        screen.getByPlaceholderText("Confirm password"),
      ).toBeInTheDocument();
    });

    it("renders the display name input", () => {
      renderAuthSignup();
      expect(
        screen.getByPlaceholderText("Display name (optional)"),
      ).toBeInTheDocument();
    });
  });

  describe("Action buttons", () => {
    it("renders the Create Account button", () => {
      renderAuthSignup();
      expect(screen.getByText("Create Account")).toBeInTheDocument();
    });

    it("renders the wallet sign-up button", () => {
      renderAuthSignup();
      expect(screen.getByText("Sign Up with Wallet")).toBeInTheDocument();
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
