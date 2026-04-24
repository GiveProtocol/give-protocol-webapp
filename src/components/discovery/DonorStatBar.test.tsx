import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { DonorStatBar } from "./DonorStatBar";

describe("DonorStatBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Total Impact tile with a CurrencyDisplay", () => {
    render(
      <DonorStatBar
        totalImpact={1500}
        activeRecurringGrants={3}
        givingStreakMonths={6}
      />,
    );
    expect(screen.getByText("Total Impact")).toBeInTheDocument();
    const display = screen.getByTestId("currency-display");
    expect(display).toHaveTextContent("1500");
  });

  it("renders the Active Recurring Grants tile", () => {
    render(
      <DonorStatBar
        totalImpact={0}
        activeRecurringGrants={5}
        givingStreakMonths={0}
      />,
    );
    expect(screen.getByText("Active Recurring Grants")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders the Giving Consistency tile with month suffix", () => {
    render(
      <DonorStatBar
        totalImpact={0}
        activeRecurringGrants={0}
        givingStreakMonths={12}
      />,
    );
    expect(screen.getByText("Giving Consistency")).toBeInTheDocument();
    expect(screen.getByText("12 mo")).toBeInTheDocument();
  });

  it("renders three stat tiles", () => {
    const { container } = render(
      <DonorStatBar
        totalImpact={100}
        activeRecurringGrants={2}
        givingStreakMonths={4}
      />,
    );
    const grid = container.firstElementChild;
    expect(grid).toHaveClass("grid");
    // Three direct children (tiles)
    expect(grid?.children.length).toBe(3);
  });
});
