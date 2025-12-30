import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { DonationHistory } from "../DonationHistory";
import type { Transaction } from "@/types/contribution";

// Mock the DonationExportModal component
jest.mock("@/components/contribution/DonationExportModal", () => ({
  DonationExportModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="export-modal">
      Export Modal <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe("DonationHistory Component", () => {
  const mockDonations: Transaction[] = [
    {
      id: "1",
      hash: "0x123abc...",
      amount: "100",
      cryptoType: "GLMR",
      fiatValue: 50.25,
      timestamp: "2024-01-15T10:30:00Z",
      status: "completed",
      metadata: {
        organization: "Test Charity",
      },
    },
    {
      id: "2",
      hash: "0x456def...",
      amount: "50",
      cryptoType: "GLMR",
      fiatValue: 25.12,
      timestamp: "2024-01-10T14:20:00Z",
      status: "pending",
      metadata: {
        organization: "Another Charity",
      },
    },
    {
      id: "3",
      hash: null,
      amount: "75",
      cryptoType: "GLMR",
      fiatValue: null,
      timestamp: "2024-01-05T09:15:00Z",
      status: "failed",
      metadata: {
        organization: "Failed Charity",
      },
    },
  ];

  it("renders donation history table with data", () => {
    render(<DonationHistory donations={mockDonations} />);

    expect(screen.getByText("Donation History")).toBeInTheDocument();
    expect(screen.getByText("Test Charity")).toBeInTheDocument();
    expect(screen.getByText("Another Charity")).toBeInTheDocument();
    expect(screen.getByText("Failed Charity")).toBeInTheDocument();
  });

  it("displays donation amounts with crypto type", () => {
    render(<DonationHistory donations={mockDonations} />);

    expect(screen.getByText("100 GLMR")).toBeInTheDocument();
    expect(screen.getByText("50 GLMR")).toBeInTheDocument();
    expect(screen.getByText("75 GLMR")).toBeInTheDocument();
  });

  it("displays fiat values when available", () => {
    render(<DonationHistory donations={mockDonations} />);

    expect(screen.getByText("$50.25")).toBeInTheDocument();
    expect(screen.getByText("$25.12")).toBeInTheDocument();
    expect(screen.getAllByText("N/A")).toHaveLength(2); // One for missing fiat value, one for missing hash
  });

  it("displays transaction hash links when available", () => {
    render(<DonationHistory donations={mockDonations} />);

    // Find the link by its href attribute
    const hashLink = screen.getByRole("link", { name: /0x123abc/i });
    expect(hashLink).toHaveAttribute(
      "href",
      "https://moonscan.io/tx/0x123abc...",
    );
    expect(hashLink).toHaveAttribute("target", "_blank");
  });

  it("shows N/A for missing transaction hash", () => {
    render(<DonationHistory donations={mockDonations} />);

    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThan(0);
  });

  it("displays status badges with correct styling", () => {
    render(<DonationHistory donations={mockDonations} />);

    const completedStatus = screen.getByText("Completed");
    expect(completedStatus).toHaveClass("bg-green-100", "text-green-800");

    const pendingStatus = screen.getByText("Pending");
    expect(pendingStatus).toHaveClass("bg-yellow-100", "text-yellow-800");

    const failedStatus = screen.getByText("Failed");
    expect(failedStatus).toHaveClass("bg-red-100", "text-red-800");
  });

  it("filters donations by time period", () => {
    render(<DonationHistory donations={mockDonations} />);

    const timeFilter = screen.getByDisplayValue("All Time");

    // Change to Past Week filter
    fireEvent.change(timeFilter, { target: { value: "week" } });

    expect(timeFilter).toHaveValue("week");
  });

  it("opens export modal when export button is clicked", () => {
    render(<DonationHistory donations={mockDonations} />);

    const exportButton = screen.getByText("Export CSV");
    fireEvent.click(exportButton);

    expect(screen.getByTestId("export-modal")).toBeInTheDocument();
  });

  it("closes export modal when close is clicked", () => {
    render(<DonationHistory donations={mockDonations} />);

    // Open modal
    const exportButton = screen.getByText("Export CSV");
    fireEvent.click(exportButton);

    expect(screen.getByTestId("export-modal")).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("export-modal")).not.toBeInTheDocument();
  });

  it("handles empty donations array", () => {
    render(<DonationHistory donations={[]} />);

    expect(screen.getByText("Donation History")).toBeInTheDocument();
    // Table should still render but with no data rows
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Charity")).toBeInTheDocument();
  });

  it("displays unknown organization when metadata is missing", () => {
    const donationsWithoutMetadata: Transaction[] = [
      {
        id: "1",
        hash: "0x123abc...",
        amount: "100",
        cryptoType: "GLMR",
        fiatValue: 50.25,
        timestamp: "2024-01-15T10:30:00Z",
        status: "completed",
        metadata: {},
      },
    ];

    render(<DonationHistory donations={donationsWithoutMetadata} />);

    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
