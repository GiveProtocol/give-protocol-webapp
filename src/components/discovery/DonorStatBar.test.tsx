import React from "react";
import { render, screen } from "@testing-library/react";
import { DonorStatBar } from "./DonorStatBar";

describe("DonorStatBar", () => {
  it("renders three stat tiles", () => {
    render(
      <DonorStatBar
        totalImpact={100}
        activeRecurringGrants={3}
        givingStreakMonths={5}
      />,
    );
    expect(screen.getByText("Total Impact")).toBeInTheDocument();
    expect(screen.getByText("Active Recurring Grants")).toBeInTheDocument();
    expect(screen.getByText("Giving Consistency")).toBeInTheDocument();
  });

  it("displays recurring grants count", () => {
    render(
      <DonorStatBar
        totalImpact={0}
        activeRecurringGrants={7}
        givingStreakMonths={0}
      />,
    );
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("displays giving streak in months", () => {
    render(
      <DonorStatBar
        totalImpact={0}
        activeRecurringGrants={0}
        givingStreakMonths={12}
      />,
    );
    expect(screen.getByText("12 mo")).toBeInTheDocument();
  });
});
