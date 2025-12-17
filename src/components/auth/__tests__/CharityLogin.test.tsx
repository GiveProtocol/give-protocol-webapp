import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent } from "@testing-library/react";
import { CharityLogin } from "../CharityLogin";
import { MemoryRouter } from 'react-router-dom';

const mockLogin = jest.fn();
const mockDisconnect = jest.fn();

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(() => ({
    login: mockLogin,
    loading: false,
    error: null,
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

const renderCharityLogin = () => {
  return render(
    <MemoryRouter>
      <CharityLogin />
    </MemoryRouter>
  );
};

describe("CharityLogin", () => {
  beforeEach(() => {
    mockLogin.mockClear();
  });

  it("renders login form", () => {
    renderCharityLogin();
    expect(screen.getAllByDisplayValue("")).toHaveLength(2); // Email and password inputs
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument(); // Email label
    expect(screen.getByText(/password/i)).toBeInTheDocument(); // Password label
  });

  it("calls login on form submission", () => {
    renderCharityLogin();

    const inputs = screen.getAllByDisplayValue("");
    const emailInput = inputs.find(input => input.getAttribute('type') === 'email');
    const passwordInput = inputs.find(input => input.getAttribute('type') === 'password');

    // Ensure inputs are found before using them
    if (!emailInput || !passwordInput) {
      throw new Error('Email or password input not found in the form');
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
});
