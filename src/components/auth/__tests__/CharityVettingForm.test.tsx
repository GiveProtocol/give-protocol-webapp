import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CharityVettingForm } from "../CharityVettingForm";

// Minimal shared mocks
const mockRegister = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ register: mockRegister, loading: false }),
}));
jest.mock("@/hooks/useCountries", () => ({
  useCountries: () => ({ countries: [{ code: "US", name: "United States" }] }),
}));

const renderForm = () => render(<CharityVettingForm />);

describe("CharityVettingForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders all form fields", () => {
    renderForm();
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tax id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("handles form submission with valid data", async () => {
    renderForm();

    // Fill minimal valid data
    fireEvent.change(screen.getByLabelText(/organization name/i), {
      target: { value: "Test Charity" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test description" },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: "education" },
    });
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByLabelText(/state/i), {
      target: { value: "CA" },
    });
    fireEvent.change(screen.getByLabelText(/country/i), {
      target: { value: "US" },
    });
    fireEvent.change(screen.getByLabelText(/postal code/i), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText(/tax id/i), {
      target: { value: "12-3456789" },
    });
    fireEvent.change(screen.getByLabelText(/contact name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/contact email/i), {
      target: { value: "john@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/contact phone/i), {
      target: { value: "+1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Test1234!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Test1234!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "john@test.com",
        "Test1234!",
        "charity",
        expect.objectContaining({
          organizationName: "Test Charity",
          description: "Test description",
        }),
      );
    });
  });

  it("validates required fields", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/organization name is required/i),
      ).toBeInTheDocument();
    });
  });

  it("validates email format", () => {
    renderForm();
    const emailInput = screen.getByLabelText(/contact email/i);

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it("validates password match", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Test1234!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Different123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("handles registration error", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Registration failed"));
    renderForm();

    // Fill minimal data
    fireEvent.change(screen.getByLabelText(/organization name/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/contact email/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Test1234!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Test1234!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

  it("disables submit button when loading", () => {
    jest
      .mocked(jest.requireMock("@/hooks/useAuth").useAuth)
      .mockReturnValueOnce({
        register: mockRegister,
        loading: true,
      });

    renderForm();
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });
});
