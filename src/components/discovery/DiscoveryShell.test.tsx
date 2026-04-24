import React from "react";
import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { DiscoveryShell } from "./DiscoveryShell";

describe("DiscoveryShell", () => {
  it("renders the main slot", () => {
    render(<DiscoveryShell main={<div data-testid="main">Main content</div>} />);
    expect(screen.getByTestId("main")).toBeInTheDocument();
    expect(screen.getByText("Main content")).toBeInTheDocument();
  });

  it("renders topBar when provided", () => {
    render(
      <DiscoveryShell
        topBar={<div data-testid="top-bar">Top bar</div>}
        main={<div>Main</div>}
      />,
    );
    expect(screen.getByTestId("top-bar")).toBeInTheDocument();
  });

  it("does not render topBar wrapper when topBar is undefined", () => {
    const { container } = render(<DiscoveryShell main={<div>Main</div>} />);
    // The topBar wrapper has className "mb-10"; it should not exist
    expect(container.querySelector(".mb-10")).toBeNull();
  });

  it("does not render topBar wrapper when topBar is null", () => {
    const { container } = render(
      <DiscoveryShell topBar={null} main={<div>Main</div>} />,
    );
    expect(container.querySelector(".mb-10")).toBeNull();
  });

  it("renders rail aside when provided", () => {
    render(
      <DiscoveryShell
        main={<div>Main</div>}
        rail={<div data-testid="rail">Rail content</div>}
      />,
    );
    const aside = screen.getByTestId("rail").closest("aside");
    expect(aside).toBeInTheDocument();
  });

  it("does not render rail aside when rail is undefined", () => {
    const { container } = render(<DiscoveryShell main={<div>Main</div>} />);
    expect(container.querySelector("aside")).toBeNull();
  });

  it("does not render rail aside when rail is null", () => {
    const { container } = render(
      <DiscoveryShell main={<div>Main</div>} rail={null} />,
    );
    expect(container.querySelector("aside")).toBeNull();
  });

  it("renders bottom when provided", () => {
    render(
      <DiscoveryShell
        main={<div>Main</div>}
        bottom={<div data-testid="bottom">Bottom</div>}
      />,
    );
    expect(screen.getByTestId("bottom")).toBeInTheDocument();
  });

  it("does not render bottom wrapper when bottom is undefined", () => {
    const { container } = render(<DiscoveryShell main={<div>Main</div>} />);
    expect(container.querySelector(".mt-10")).toBeNull();
  });

  it("does not render bottom wrapper when bottom is null", () => {
    const { container } = render(
      <DiscoveryShell main={<div>Main</div>} bottom={null} />,
    );
    expect(container.querySelector(".mt-10")).toBeNull();
  });

  it("applies custom className to root container", () => {
    const { container } = render(
      <DiscoveryShell main={<div>Main</div>} className="custom-class" />,
    );
    expect(container.firstElementChild).toHaveClass("custom-class");
  });
});
