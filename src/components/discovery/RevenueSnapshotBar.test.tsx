import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { RevenueSnapshotBar } from "./RevenueSnapshotBar";

describe("RevenueSnapshotBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Funds Raised tile with CurrencyDisplay", () => {
    render(
      <RevenueSnapshotBar
        fundsRaised={25000}
        activeCampaigns={4}
        donorCount={120}
      />,
    );
    expect(screen.getByText("Funds Raised")).toBeInTheDocument();
    const display = screen.getByTestId("currency-display");
    expect(display).toHaveTextContent("25000");
  });

  it("renders the Active Campaigns tile", () => {
    render(
      <RevenueSnapshotBar
        fundsRaised={0}
        activeCampaigns={7}
        donorCount={0}
      />,
    );
    expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders the Donor Count tile", () => {
    render(
      <RevenueSnapshotBar
        fundsRaised={0}
        activeCampaigns={0}
        donorCount={350}
      />,
    );
    expect(screen.getByText("Donor Count")).toBeInTheDocument();
    expect(screen.getByText("350")).toBeInTheDocument();
  });

  it("renders three stat tiles in a grid", () => {
    const { container } = render(
      <RevenueSnapshotBar
        fundsRaised={100}
        activeCampaigns={2}
        donorCount={50}
      />,
    );
    const grid = container.firstElementChild;
    expect(grid).toHaveClass("grid");
    expect(grid?.children.length).toBe(3);
  });
});
