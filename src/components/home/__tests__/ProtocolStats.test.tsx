import { render, screen } from "@testing-library/react";
import { ProtocolStats } from "../ProtocolStats";

describe("ProtocolStats", () => {
  it("renders protocol statistics", () => {
    render(<ProtocolStats />);

    // Check for stat labels
    expect(screen.getByText("Blockchain Networks Served")).toBeInTheDocument();
    expect(screen.getByText("Charitable Sectors Benefitted")).toBeInTheDocument();
  });

  it("displays the blockchain networks count", () => {
    render(<ProtocolStats />);

    expect(screen.getByText("3+")).toBeInTheDocument();
  });

  it("displays the charitable sectors count", () => {
    render(<ProtocolStats />);

    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders with proper styling", () => {
    render(<ProtocolStats />);

    // Check that the container has the grid layout
    const container = screen.getByText("Blockchain Networks Served").closest(".grid");
    expect(container).toHaveClass("grid-cols-2", "gap-8");
  });

  it("renders icons for each stat", () => {
    const { container } = render(<ProtocolStats />);

    // Check that SVG icons are rendered
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBe(2);
  });
});
