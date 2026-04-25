import React from "react";
import { render, screen } from "@testing-library/react";
import { ComplianceRail } from "./ComplianceRail";

describe("ComplianceRail", () => {
  it("renders the heading", () => {
    render(<ComplianceRail />);
    expect(screen.getByText("Compliance & Trust")).toBeInTheDocument();
  });

  it("defaults kycStatus to pending", () => {
    render(<ComplianceRail />);
    expect(screen.getByText("Pending review")).toBeInTheDocument();
  });

  it("shows verified KYC status", () => {
    render(<ComplianceRail kycStatus="verified" />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("shows rejected KYC status", () => {
    render(<ComplianceRail kycStatus="rejected" />);
    expect(screen.getByText("Action required")).toBeInTheDocument();
  });

  it("shows verified org message when verified is true", () => {
    render(<ComplianceRail verified />);
    expect(
      screen.getByText("This organization is verified on Give Protocol."),
    ).toBeInTheDocument();
  });

  it("shows unverified message when verified is false", () => {
    render(<ComplianceRail verified={false} />);
    expect(
      screen.getByText("Complete verification to unlock public listings."),
    ).toBeInTheDocument();
  });

  it("shows placeholder when nextFilingDue is null", () => {
    render(<ComplianceRail />);
    expect(
      screen.getByText(/No upcoming filings tracked yet/),
    ).toBeInTheDocument();
  });

  it("shows the filing date when provided", () => {
    render(<ComplianceRail nextFilingDue="2026-07-01" />);
    expect(screen.getByText("2026-07-01")).toBeInTheDocument();
  });
});
