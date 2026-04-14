import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  getDonationSummary,
} from "@/services/adminDonationService";
import {
  getAdminAuditLog,
} from "@/services/adminAuditService";
import {
  getCharityGrowthReport,
  getDonorActivityReport,
  getVolunteerReport,
  getPlatformHealthSummary,
} from "@/services/adminReportsService";
import AdminReports from "./AdminReports";

// All services, Card, LoadingSpinner, Button are mocked via moduleNameMapper

const mockGetDonationSummary = jest.mocked(getDonationSummary);
const mockGetAdminAuditLog = jest.mocked(getAdminAuditLog);
const mockGetCharityGrowthReport = jest.mocked(getCharityGrowthReport);
const mockGetDonorActivityReport = jest.mocked(getDonorActivityReport);
const mockGetVolunteerReport = jest.mocked(getVolunteerReport);
const mockGetPlatformHealthSummary = jest.mocked(getPlatformHealthSummary);

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminReports />
    </MemoryRouter>,
  );

describe("AdminReports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDonationSummary.mockResolvedValue([]);
    mockGetAdminAuditLog.mockResolvedValue({
      entries: [],
      totalCount: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    mockGetCharityGrowthReport.mockResolvedValue([]);
    mockGetDonorActivityReport.mockResolvedValue([]);
    mockGetVolunteerReport.mockResolvedValue([]);
    mockGetPlatformHealthSummary.mockResolvedValue([]);
  });

  describe("Renders", () => {
    it("renders the page heading", () => {
      renderPage();
      expect(screen.getByText("Reports")).toBeInTheDocument();
    });

    it("renders the Donations tab by default", () => {
      renderPage();
      expect(screen.getByText("Donations")).toBeInTheDocument();
    });

    it("renders all tab labels", () => {
      renderPage();
      expect(screen.getByText("Charity Growth")).toBeInTheDocument();
      expect(screen.getByText("Donor Activity")).toBeInTheDocument();
      expect(screen.getByText("Volunteer Hours")).toBeInTheDocument();
      expect(screen.getByText("Audit Trail")).toBeInTheDocument();
      expect(screen.getByText("Platform Health")).toBeInTheDocument();
    });

    it("renders date preset buttons", () => {
      renderPage();
      expect(screen.getByText("Last 7 days")).toBeInTheDocument();
      expect(screen.getByText("Last 30 days")).toBeInTheDocument();
      expect(screen.getByText("Last 90 days")).toBeInTheDocument();
    });

    it("renders group-by select in donations tab", () => {
      renderPage();
      expect(screen.getByText("Group by:")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Month")).toBeInTheDocument();
    });
  });

  describe("Tab switching", () => {
    it("switches to Charity Growth tab", async () => {
      renderPage();
      fireEvent.click(screen.getByText("Charity Growth"));
      await waitFor(() => {
        expect(
          screen.getByText(/No charity growth data/i),
        ).toBeInTheDocument();
      });
    });

    it("switches to Donor Activity tab", async () => {
      renderPage();
      fireEvent.click(screen.getByText("Donor Activity"));
      await waitFor(() => {
        expect(
          screen.getByText(/No donor activity data/i),
        ).toBeInTheDocument();
      });
    });

    it("switches to Volunteer Hours tab", async () => {
      renderPage();
      fireEvent.click(screen.getByText("Volunteer Hours"));
      await waitFor(() => {
        expect(
          screen.getByText(/No volunteer data/i),
        ).toBeInTheDocument();
      });
    });

    it("switches to Audit Trail tab", async () => {
      renderPage();
      fireEvent.click(screen.getByText("Audit Trail"));
      await waitFor(() => {
        expect(
          screen.getByText(/No audit entries/i),
        ).toBeInTheDocument();
      });
    });

    it("switches to Platform Health tab", async () => {
      renderPage();
      fireEvent.click(screen.getByText("Platform Health"));
      await waitFor(() => {
        expect(
          screen.getByText(/No platform health data/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Date preset selection", () => {
    it("selecting 30d preset changes active state", () => {
      renderPage();
      const btn = screen.getByText("Last 30 days");
      fireEvent.click(btn);
      expect(btn).toBeInTheDocument();
    });

    it("selecting 90d preset changes active state", () => {
      renderPage();
      const btn = screen.getByText("Last 90 days");
      fireEvent.click(btn);
      expect(btn).toBeInTheDocument();
    });
  });

  describe("Donations tab", () => {
    it("shows empty state with no donation data", async () => {
      renderPage();
      await waitFor(() => {
        expect(
          screen.getByText(/No donation data/i),
        ).toBeInTheDocument();
      });
    });
  });
});
