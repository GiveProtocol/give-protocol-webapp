import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

// Mock DiscoveryShell to render its slot props in identifiable containers
jest.mock("./DiscoveryShell", () => ({
  DiscoveryShell: ({
    topBar,
    main,
    rail,
  }: {
    topBar?: React.ReactNode;
    main: React.ReactNode;
    rail?: React.ReactNode;
  }) => (
    <div data-testid="discovery-shell">
      <div data-testid="slot-topBar">{topBar}</div>
      <div data-testid="slot-main">{main}</div>
      <div data-testid="slot-rail">{rail}</div>
    </div>
  ),
}));

import { DiscoveryShellSkeleton } from "./DiscoveryShellSkeleton";

describe("DiscoveryShellSkeleton", () => {
  it("renders the DiscoveryShell with skeleton placeholders", () => {
    render(<DiscoveryShellSkeleton />);
    expect(screen.getByTestId("discovery-shell")).toBeInTheDocument();
  });

  it("passes skeleton elements into the topBar slot", () => {
    render(<DiscoveryShellSkeleton />);
    const topBar = screen.getByTestId("slot-topBar");
    expect(topBar.querySelectorAll("[data-testid='skeleton']").length).toBeGreaterThan(0);
  });

  it("passes skeleton elements into the main slot", () => {
    render(<DiscoveryShellSkeleton />);
    const main = screen.getByTestId("slot-main");
    expect(main.querySelectorAll("[data-testid='skeleton']").length).toBeGreaterThan(0);
  });

  it("passes skeleton elements into the rail slot", () => {
    render(<DiscoveryShellSkeleton />);
    const rail = screen.getByTestId("slot-rail");
    expect(rail.querySelectorAll("[data-testid='skeleton']").length).toBeGreaterThan(0);
  });
});
