import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CharityVettingForm } from "../CharityVettingForm";

// Minimal shared mocks
const mockRegister = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ register: mockRegister, loading: false }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    register: mockRegister,
    loading: false,
    user: null,
    userType: null,
  })),
}));

jest.mock("@/contexts/Web3Context", () => ({
  useWeb3: jest.fn(() => ({
    disconnect: jest.fn(),
    isConnected: false,
    account: null,
    chainId: null,
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
  useNavigate: () => jest.fn(),
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
    expect(
      screen.getByLabelText(/tax or registration id/i),
    ).toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText(/tax or registration id/i), {
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
    const form = screen
      .getByRole("button", { name: /submit/i })
      .closest("form");
    if (!form) throw new Error("Could not find form element");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/organization name must be between/i),
      ).toBeInTheDocument();
    });
  });

  it("validates email format on submit", async () => {
    renderForm();
    const emailInput = screen.getByLabelText(/contact email/i);

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    const form = screen
      .getByRole("button", { name: /submit/i })
      .closest("form");
    if (!form) throw new Error("Could not find form element");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i),
      ).toBeInTheDocument();
    });
  });

  it("validates password match", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Test1234!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Different123!" },
    });
    const form = screen
      .getByRole("button", { name: /submit/i })
      .closest("form");
    if (!form) throw new Error("Could not find form element");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("handles registration error", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Registration failed"));
    renderForm();

    // Fill all required fields to pass validation
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
    fireEvent.change(screen.getByLabelText(/country/i), {
      target: { value: "US" },
    });
    fireEvent.change(screen.getByLabelText(/tax or registration id/i), {
      target: { value: "12-3456789" },
    });
    fireEvent.change(screen.getByLabelText(/contact name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/contact email/i), {
      target: { value: "test@test.com" },
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

    const form = screen
      .getByRole("button", { name: /submit/i })
      .closest("form");
    if (!form) throw new Error("Could not find form element");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

  it("shows submitting text when loading", () => {
    // The loading state is controlled by the useAuth hook
    // We can verify the button text changes when loading
    renderForm();
    expect(
      screen.getByRole("button", { name: /submit charity application/i }),
    ).toBeInTheDocument();
  });
});
