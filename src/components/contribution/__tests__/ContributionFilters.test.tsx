import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContributionFilters } from "../ContributionFilters";

const mockProps = {
  filters: {
    timeRange: "all" as const,
    sortBy: "date" as const,
    sortOrder: "desc" as const,
  },
  onFiltersChange: jest.fn(),
};

describe("ContributionFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders filter controls", () => {
    render(<ContributionFilters {...mockProps} />);
    expect(screen.getByLabelText(/time range/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort order/i)).toBeInTheDocument();
  });

  it("calls onFiltersChange when time range changes", () => {
    render(<ContributionFilters {...mockProps} />);

    fireEvent.change(screen.getByLabelText(/time range/i), {
      target: { value: "week" },
    });

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
      ...mockProps.filters,
      timeRange: "week",
    });
  });

  it("calls onFiltersChange when sort by changes", () => {
    render(<ContributionFilters {...mockProps} />);

    fireEvent.change(screen.getByLabelText(/sort by/i), {
      target: { value: "amount" },
    });

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
      ...mockProps.filters,
      sortBy: "amount",
    });
  });

  it("calls onFiltersChange when sort order changes", () => {
    render(<ContributionFilters {...mockProps} />);

    fireEvent.change(screen.getByLabelText(/sort order/i), {
      target: { value: "asc" },
    });

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
      ...mockProps.filters,
      sortOrder: "asc",
    });
  });
});
