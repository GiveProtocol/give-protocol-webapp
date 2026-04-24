import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { WhyGiveProtocolRail } from "./WhyGiveProtocolRail";

describe("WhyGiveProtocolRail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the section heading", () => {
    render(<WhyGiveProtocolRail />);
    expect(screen.getByText("Why Give Protocol")).toBeInTheDocument();
  });

  it("renders the Verified nonprofits item", () => {
    render(<WhyGiveProtocolRail />);
    expect(screen.getByText("Verified nonprofits")).toBeInTheDocument();
    expect(
      screen.getByText(/Every organization is matched against public registries/),
    ).toBeInTheDocument();
  });

  it("renders the On-chain transparency item", () => {
    render(<WhyGiveProtocolRail />);
    expect(screen.getByText("On-chain transparency")).toBeInTheDocument();
    expect(
      screen.getByText(/Donations are recorded on the blockchain/),
    ).toBeInTheDocument();
  });

  it("renders the volunteer item", () => {
    render(<WhyGiveProtocolRail />);
    expect(
      screen.getByText("Give time, not just money"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Volunteer hours are verified by charities/),
    ).toBeInTheDocument();
  });

  it("renders three list items", () => {
    render(<WhyGiveProtocolRail />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });
});
