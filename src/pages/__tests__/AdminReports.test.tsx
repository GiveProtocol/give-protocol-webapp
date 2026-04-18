import React from "react";
import { jest } from "@jest/globals";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminReports from "../admin/AdminReports";

// Services are mocked via moduleNameMapper

import { getDonationSummary } from "@/services/adminDonationService";
import { getAdminAuditLog } from "@/services/adminAuditService";
import {
  getCharityGrowthReport,
  getDonorActivityReport,
  getVolunteerReport,
  getPlatformHealthSummary,
  donationSummaryToCsv,
  downloadReport,
} from "@/services/adminReportsService";

const mockGetDonationSummary = jest.mocked(getDonationSummary);
const mockGetAdminAuditLog = jest.mocked(getAdminAuditLog);
const mockGetCharityGrowthReport = jest.mocked(getCharityGrowthReport);
const mockGetDonorActivityReport = jest.mocked(getDonorActivityReport);
const mockGetVolunteerReport = jest.mocked(getVolunteerReport);
const mockGetPlatformHealthSummary = jest.mocked(getPlatformHealthSummary);
const mockDonationSummaryToCsv = jest.mocked(donationSummaryToCsv);
const mockDownloadReport = jest.mocked(downloadReport);

const mockDonationSummary = [
  {
    groupKey: "2025-03",
    paymentMethod: "crypto" as const,
    totalAmountUsd: 5000.0,
    donationCount: 25,
    charityName: "Test Charity",
    charityId: "ch-1",
  },
];

const mockCharityGrowth = [
  {
    period: "2025-03",
    newRegistrations: 10,
    approved: 8,
    rejected: 1,
    active: 50,
    suspended: 2,
  },
];

const renderReports = () =>
  render(
    <MemoryRouter>
      <AdminReports />
    </MemoryRouter>,
  );

describe("AdminReports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDonationSummary.mockResolvedValue(mockDonationSummary);
    mockGetAdminAuditLog.mockResolvedValue({
      entries: [],
      totalCount: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    mockGetCharityGrowthReport.mockResolvedValue(mockCharityGrowth);
    mockGetDonorActivityReport.mockResolvedValue([]);
    mockGetVolunteerReport.mockResolvedValue([]);
    mockGetPlatformHealthSummary.mockResolvedValue([]);
    mockDonationSummaryToCsv.mockReturnValue("csv-content");
  });

  it("renders title Reports", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Reports")).toBeInTheDocument();
    });
  });

  it("shows date preset buttons", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    });
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Last 90 days")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("default tab is Donations", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Group by:")).toBeInTheDocument();
    });
  });

  it("donations tab renders table with data", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Group")).toBeInTheDocument();
    });
    expect(screen.getByText("Method")).toBeInTheDocument();
    expect(screen.getByText("Total (USD)")).toBeInTheDocument();
    expect(screen.getByText("Count")).toBeInTheDocument();
    const charityHeader = screen.getAllByText("Charity");
    expect(charityHeader.length).toBeGreaterThanOrEqual(1);
    const groupCells = screen.getAllByText("2025-03");
    expect(groupCells.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("crypto")).toBeInTheDocument();
    expect(screen.getByText("$5000.00")).toBeInTheDocument();
    const countCells = screen.getAllByText("25");
    expect(countCells.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Test Charity")).toBeInTheDocument();
  });

  it("donations tab shows Export CSV with data", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Export CSV")).toBeInTheDocument();
    });
  });

  it("clicking Export CSV calls downloadReport", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Export CSV")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Export CSV"));
    expect(mockDonationSummaryToCsv).toHaveBeenCalledWith(mockDonationSummary);
    expect(mockDownloadReport).toHaveBeenCalledWith(
      "csv-content",
      expect.stringContaining("donation-summary-"),
    );
  });

  it("tab switching to Charity Growth calls getCharityGrowthReport", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Charity Growth")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Charity Growth"));
    await waitFor(() => {
      expect(mockGetCharityGrowthReport).toHaveBeenCalled();
    });
  });

  it("tab switching to Donor Activity calls getDonorActivityReport", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Donor Activity")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Donor Activity"));
    await waitFor(() => {
      expect(mockGetDonorActivityReport).toHaveBeenCalled();
    });
  });

  it("tab switching to Audit Trail calls getAdminAuditLog", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Audit Trail")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Audit Trail"));
    await waitFor(() => {
      expect(mockGetAdminAuditLog).toHaveBeenCalled();
    });
  });

  it("custom date preset shows date inputs", async () => {
    renderReports();
    await waitFor(() => {
      expect(screen.getByText("Custom")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Custom"));
    await waitFor(() => {
      expect(screen.getByLabelText("From date")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("To date")).toBeInTheDocument();
  });

  it("empty state for donations tab", async () => {
    mockGetDonationSummary.mockResolvedValue([]);
    renderReports();
    await waitFor(() => {
      expect(
        screen.getByText("No donation data for the selected period."),
      ).toBeInTheDocument();
    });
  });
});
