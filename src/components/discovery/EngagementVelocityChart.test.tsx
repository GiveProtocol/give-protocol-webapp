import React from "react";
import { render, screen } from "@testing-library/react";
import { EngagementVelocityChart } from "./EngagementVelocityChart";

describe("EngagementVelocityChart", () => {
  it("renders the heading and Beta badge", () => {
    render(<EngagementVelocityChart dailyTotals={[]} />);
    expect(screen.getByText("Engagement Velocity")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("renders legend items", () => {
    render(<EngagementVelocityChart dailyTotals={[]} />);
    expect(screen.getByText("Donations / day")).toBeInTheDocument();
    expect(screen.getByText("Avg. gift size")).toBeInTheDocument();
  });

  it("shows loading message when loading is true", () => {
    render(<EngagementVelocityChart dailyTotals={[]} loading />);
    expect(screen.getByText(/Loading velocity data/)).toBeInTheDocument();
  });

  it("shows empty state when no data and not loading", () => {
    render(<EngagementVelocityChart dailyTotals={[]} />);
    expect(
      screen.getByText(/No donations yet in the last 30 days/),
    ).toBeInTheDocument();
  });

  it("renders SVG chart when data has positive counts", () => {
    const data = [
      { date: "2026-04-01", total: 100, count: 2 },
      { date: "2026-04-02", total: 200, count: 4 },
    ];
    render(<EngagementVelocityChart dailyTotals={data} />);
    expect(
      screen.getByLabelText("Engagement velocity chart"),
    ).toBeInTheDocument();
  });

  it("shows empty state when counts are all zero", () => {
    const data = [
      { date: "2026-04-01", total: 0, count: 0 },
      { date: "2026-04-02", total: 0, count: 0 },
    ];
    render(<EngagementVelocityChart dailyTotals={data} />);
    expect(
      screen.getByText(/No donations yet in the last 30 days/),
    ).toBeInTheDocument();
  });
});
