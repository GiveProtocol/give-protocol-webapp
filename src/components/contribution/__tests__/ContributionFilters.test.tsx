import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContributionFilters } from "../ContributionFilters";

const mockProps = {
  filters: {
    organization: "",
    category: "",
    region: "",
    timeRange: "30d",
  },
  onChange: jest.fn(),
};

describe("ContributionFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders filter controls", () => {
    render(<ContributionFilters {...mockProps} />);
    expect(screen.getByLabelText(/select time range/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select organization/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select region/i)).toBeInTheDocument();
  });

  it("calls onChange when time range changes", () => {
    render(<ContributionFilters {...mockProps} />);

    fireEvent.change(screen.getByLabelText(/select time range/i), {
      target: { value: "7d" },
    });

    expect(mockProps.onChange).toHaveBeenCalledWith({
      ...mockProps.filters,
      timeRange: "7d",
    });
  });

  it("calls onChange when organization changes", () => {
    render(<ContributionFilters {...mockProps} />);

    fireEvent.change(screen.getByLabelText(/select organization/i), {
      target: { value: "org1" },
    });

    expect(mockProps.onChange).toHaveBeenCalledWith({
      ...mockProps.filters,
      organization: "org1",
    });
  });

  it("calls onChange when category changes", () => {
    render(<ContributionFilters {...mockProps} />);

    fireEvent.change(screen.getByLabelText(/select category/i), {
      target: { value: "education" },
    });

    expect(mockProps.onChange).toHaveBeenCalledWith({
      ...mockProps.filters,
      category: "education",
    });
  });
});
