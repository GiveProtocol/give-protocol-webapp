import React from "react";
import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { EngagementVelocityChart } from "./EngagementVelocityChart";

describe("EngagementVelocityChart", () => {
  it("renders the heading and legend", () => {
    render(<EngagementVelocityChart dailyTotals={[]} />);
    expect(screen.getByText("Engagement Velocity")).toBeInTheDocument();
    expect(screen.getByText("Donations / day")).toBeInTheDocument();
    expect(screen.getByText("Avg. gift size")).toBeInTheDocument();
  });

  it("shows the Beta badge", () => {
    render(<EngagementVelocityChart dailyTotals={[]} />);
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("shows loading message when loading is true", () => {
    render(<EngagementVelocityChart dailyTotals={[]} loading />);
    expect(screen.getByText("Loading velocity data…")).toBeInTheDocument();
  });

  it("shows empty-state message when there is no data", () => {
    render(<EngagementVelocityChart dailyTotals={[]} loading={false} />);
    expect(
      screen.getByText("No donations yet in the last 30 days."),
    ).toBeInTheDocument();
  });

  it("shows empty-state message when all counts are zero", () => {
    const zeroData = [
      { date: "2026-04-01", total: 0, count: 0 },
      { date: "2026-04-02", total: 0, count: 0 },
    ];
    render(<EngagementVelocityChart dailyTotals={zeroData} />);
    expect(
      screen.getByText("No donations yet in the last 30 days."),
    ).toBeInTheDocument();
  });

  it("renders the SVG chart when data has non-zero counts", () => {
    const data = [
      { date: "2026-04-01", total: 100, count: 5 },
      { date: "2026-04-02", total: 200, count: 10 },
      { date: "2026-04-03", total: 150, count: 3 },
    ];
    render(<EngagementVelocityChart dailyTotals={data} />);

    const svg = screen.getByRole("img", {
      name: "Engagement velocity chart",
    });
    expect(svg).toBeInTheDocument();

    // Two path elements: one for count, one for avg amount
    const paths = svg.querySelectorAll("path");
    expect(paths).toHaveLength(2);
  });

  it("renders correct stroke colors for the two lines", () => {
    const data = [
      { date: "2026-04-01", total: 50, count: 2 },
      { date: "2026-04-02", total: 80, count: 4 },
    ];
    render(<EngagementVelocityChart dailyTotals={data} />);

    const svg = screen.getByRole("img");
    const paths = svg.querySelectorAll("path");
    expect(paths[0]).toHaveAttribute("stroke", "#10b981");
    expect(paths[1]).toHaveAttribute("stroke", "#6366f1");
  });

  it("renders chart with a single data point", () => {
    const data = [{ date: "2026-04-01", total: 100, count: 5 }];
    render(<EngagementVelocityChart dailyTotals={data} />);

    const svg = screen.getByRole("img");
    expect(svg).toBeInTheDocument();
    // With a single point, the path should start with M (moveto)
    const paths = svg.querySelectorAll("path");
    expect(paths[0].getAttribute("d")).toMatch(/^M/);
  });

  it("prefers loading message over empty message when loading is true", () => {
    render(<EngagementVelocityChart dailyTotals={[]} loading />);
    expect(screen.getByText("Loading velocity data…")).toBeInTheDocument();
    expect(
      screen.queryByText("No donations yet in the last 30 days."),
    ).not.toBeInTheDocument();
  });
});
