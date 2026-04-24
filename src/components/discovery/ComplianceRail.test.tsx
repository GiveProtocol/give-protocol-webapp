import React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ComplianceRail } from "./ComplianceRail";

describe("ComplianceRail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the section heading", () => {
    render(<ComplianceRail />);
    expect(screen.getByText("Compliance & Trust")).toBeInTheDocument();
  });

  it("defaults kycStatus to pending when not provided", () => {
    render(<ComplianceRail />);
    expect(screen.getByText("Pending review")).toBeInTheDocument();
  });

  it("shows Verified label when kycStatus is verified", () => {
    render(<ComplianceRail kycStatus="verified" />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("shows Action required label when kycStatus is rejected", () => {
    render(<ComplianceRail kycStatus="rejected" />);
    expect(screen.getByText("Action required")).toBeInTheDocument();
  });

  it("shows verified organization text when verified is true", () => {
    render(<ComplianceRail verified={true} />);
    expect(
      screen.getByText("This organization is verified on Give Protocol."),
    ).toBeInTheDocument();
  });

  it("shows unverified prompt when verified is false", () => {
    render(<ComplianceRail verified={false} />);
    expect(
      screen.getByText("Complete verification to unlock public listings."),
    ).toBeInTheDocument();
  });

  it("shows the nextFilingDue date when provided", () => {
    render(<ComplianceRail nextFilingDue="2026-12-31" />);
    expect(screen.getByText("2026-12-31")).toBeInTheDocument();
  });

  it("shows placeholder filing text when nextFilingDue is null", () => {
    render(<ComplianceRail nextFilingDue={null} />);
    expect(
      screen.getByText(
        "No upcoming filings tracked yet. Enable reminders in Settings.",
      ),
    ).toBeInTheDocument();
  });

  it("renders all three compliance rows", () => {
    render(<ComplianceRail />);
    expect(screen.getByText("KYC Status")).toBeInTheDocument();
    expect(screen.getByText("Platform Verification")).toBeInTheDocument();
    expect(screen.getByText("Next Filing Due")).toBeInTheDocument();
  });
});
