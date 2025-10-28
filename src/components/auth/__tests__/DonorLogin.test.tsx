import _React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent } from "@testing-library/react";
import { DonorLogin } from "../DonorLogin";

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: jest.fn(),
    loading: false,
    error: null,
  }),
}));

describe("DonorLogin", () => {
  it("renders login form", () => {
    render(<DonorLogin />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("calls login on form submission", () => {
    const mockLogin = jest.fn();
    jest.mocked(jest.requireMock("@/hooks/useAuth").useAuth).mockReturnValue({
      login: mockLogin,
      loading: false,
      error: null,
    });

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
});
