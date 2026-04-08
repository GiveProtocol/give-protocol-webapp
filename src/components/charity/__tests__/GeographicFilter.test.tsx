import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { GeographicFilter } from "../GeographicFilter";
import type { LocationFilter } from "@/utils/locationResolver";

function makeLocation(
  type: "state" | "country" | "region",
  code: string,
  label: string,
): LocationFilter {
  return {
    id: `${type}:${code}`,
    displayLabel: label,
    type,
    stateCode: type === "state" ? code : null,
    countryCode: type === "country" ? code : null,
  };
}

const defaultProps = {
  activeCategory: "hq" as const,
  onCategoryChange: jest.fn(),
  impactLocations: [] as LocationFilter[],
  hqLocations: [] as LocationFilter[],
  onImpactLocationsChange: jest.fn(),
  onHqLocationsChange: jest.fn(),
  onPlatformOnly: false,
  onPlatformOnlyChange: jest.fn(),
};

describe("GeographicFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the segmented toggle with both options", () => {
    render(<GeographicFilter {...defaultProps} />);
    expect(screen.getByText("Serving In")).toBeInTheDocument();
    expect(screen.getByText("Registered In")).toBeInTheDocument();
  });

  it("renders the On Platform checkbox", () => {
    render(<GeographicFilter {...defaultProps} />);
    expect(screen.getByText("On Platform")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("marks HQ as active by default", () => {
    render(<GeographicFilter {...defaultProps} />);
    const hqButton = screen.getByText("Registered In");
    expect(hqButton).toHaveAttribute("aria-checked", "true");
    const impactButton = screen.getByText("Serving In");
    expect(impactButton).toHaveAttribute("aria-checked", "false");
  });

  it("calls onCategoryChange when toggle is clicked", () => {
    render(<GeographicFilter {...defaultProps} />);
    fireEvent.click(screen.getByText("Serving In"));
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith("impact");
  });

  it("calls onPlatformOnlyChange when checkbox is clicked", () => {
    render(<GeographicFilter {...defaultProps} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(defaultProps.onPlatformOnlyChange).toHaveBeenCalledTimes(1);
  });

  it("shows checkbox as checked when onPlatformOnly is true", () => {
    render(<GeographicFilter {...defaultProps} onPlatformOnly={true} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("renders existing pills with correct labels", () => {
    const hq = [makeLocation("state", "CA", "California")];
    const impact = [makeLocation("region", "se-asia", "SE Asia")];
    render(
      <GeographicFilter
        {...defaultProps}
        hqLocations={hq}
        impactLocations={impact}
      />,
    );

    expect(screen.getByText(/HQ: California/)).toBeInTheDocument();
    expect(screen.getByText(/Impact: SE Asia/)).toBeInTheDocument();
  });

  it("calls onHqLocationsChange when removing an HQ pill", () => {
    const hq = [
      makeLocation("state", "CA", "California"),
      makeLocation("state", "NY", "New York"),
    ];
    render(<GeographicFilter {...defaultProps} hqLocations={hq} />);

    fireEvent.click(screen.getByLabelText("Remove California"));

    expect(defaultProps.onHqLocationsChange).toHaveBeenCalledTimes(1);
    const remaining = defaultProps.onHqLocationsChange.mock
      .calls[0][0] as LocationFilter[];
    expect(remaining).toHaveLength(1);
    expect(remaining[0].displayLabel).toBe("New York");
  });

  it("calls onImpactLocationsChange when removing an Impact pill", () => {
    const impact = [makeLocation("region", "se-asia", "SE Asia")];
    render(<GeographicFilter {...defaultProps} impactLocations={impact} />);

    fireEvent.click(screen.getByLabelText("Remove SE Asia"));

    expect(defaultProps.onImpactLocationsChange).toHaveBeenCalledTimes(1);
    const remaining = defaultProps.onImpactLocationsChange.mock
      .calls[0][0] as LocationFilter[];
    expect(remaining).toHaveLength(0);
  });

  it("does not render pills when no filters are active", () => {
    render(<GeographicFilter {...defaultProps} />);
    expect(screen.queryByLabelText(/^Remove /)).toBeNull();
  });

  it("renders a divider before pills when filters are active", () => {
    const hq = [makeLocation("state", "CA", "California")];
    const { container } = render(
      <GeographicFilter {...defaultProps} hqLocations={hq} />,
    );
    const divider = container.querySelector("span.w-px");
    expect(divider).toBeInTheDocument();
  });
});
