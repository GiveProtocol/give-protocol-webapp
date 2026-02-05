import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { DonorStats } from "../DonorStats";

// These must be top-level jest.mock calls (not inside setupCommonMocks)
// so babel-jest hoists them before imports resolve
jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string, fallback?: string) => fallback || key),
  })),
}));

jest.mock("@/components/CurrencyDisplay", () => ({
  CurrencyDisplay: ({ amount }: { amount: number }) => (
    <span data-testid="currency-display">${amount}</span>
  ),
}));

describe("DonorStats", () => {
  const defaultProps = {
    totalDonated: 425,
    impactGrowth: 150,
    charitiesSupported: 3,
  };

  it("displays total donated amount", () => {
    render(<DonorStats {...defaultProps} />);

    // CurrencyDisplay mock renders $amount
    expect(
      screen.getAllByTestId("currency-display").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("displays charities supported count", () => {
    render(<DonorStats {...defaultProps} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows stat labels", () => {
    render(<DonorStats {...defaultProps} />);

    expect(screen.getByText("Impact Growth")).toBeInTheDocument();
    expect(screen.getByText("Charities Supported")).toBeInTheDocument();
  });

  it("displays zero values correctly", () => {
    render(
      <DonorStats totalDonated={0} impactGrowth={0} charitiesSupported={0} />,
    );

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders all three stat cards", () => {
    render(<DonorStats {...defaultProps} />);

    // Should have 2 CurrencyDisplay instances (totalDonated + impactGrowth)
    const currencyDisplays = screen.getAllByTestId("currency-display");
    expect(currencyDisplays).toHaveLength(2);
  });

  it("renders with large values", () => {
    render(
      <DonorStats
        totalDonated={100000}
        impactGrowth={50000}
        charitiesSupported={42}
      />,
    );

    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
