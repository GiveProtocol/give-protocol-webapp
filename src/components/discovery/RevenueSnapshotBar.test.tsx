import React from "react";
import { render, screen } from "@testing-library/react";
import { RevenueSnapshotBar } from "./RevenueSnapshotBar";

describe("RevenueSnapshotBar", () => {
  it("renders three stat tiles", () => {
    render(
      <RevenueSnapshotBar
        fundsRaised={5000}
        activeCampaigns={3}
        donorCount={42}
      />,
    );
    expect(screen.getByText("Funds Raised")).toBeInTheDocument();
    expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Donor Count")).toBeInTheDocument();
  });

  it("displays numeric values", () => {
    render(
      <RevenueSnapshotBar
        fundsRaised={0}
        activeCampaigns={5}
        donorCount={100}
      />,
    );
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });
});
