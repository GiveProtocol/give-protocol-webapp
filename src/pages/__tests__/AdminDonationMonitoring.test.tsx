import React from "react";
import { jest } from "@jest/globals";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAdminDonations } from "@/hooks/useAdminDonations";
import AdminDonationMonitoring from "../admin/AdminDonationMonitoring";
import type { AdminDonationListItem } from "@/types/adminDonation";

// useAdminDonations is mocked via moduleNameMapper
const mockUseAdminDonations = jest.mocked(useAdminDonations);

const mockDonation: AdminDonationListItem = {
  id: "don-1",
  paymentMethod: "crypto" as const,
  amount: 15000,
  amountUsd: 150.0,
  currency: "ETH",
  donorDisplayName: "Jane Doe",
  donorEmail: "jane@example.com",
  donorUserId: "user-1",
  charityName: "Test Charity",
  charityId: "ch-1",
  txHash: "0xabcdef1234567890abcdef1234567890",
  processorId: null,
  status: "completed",
  createdAt: "2025-03-01T12:00:00Z",
  isFlagged: false,
  openFlagCount: 0,
};

const mockFlaggedDonation: AdminDonationListItem = {
  ...mockDonation,
  id: "don-2",
  isFlagged: true,
  openFlagCount: 2,
};

const mockResolvedDonation: AdminDonationListItem = {
  ...mockDonation,
  id: "don-3",
  isFlagged: true,
  openFlagCount: 0,
};

const mockFetchDonations = jest.fn();
const mockFetchSummary = jest.fn();
const mockSubmitFlag = jest.fn();
const mockSubmitResolveFlag = jest.fn();
const mockExportCsv = jest.fn();

const createHookReturn = (overrides = {}) => ({
  result: {
    donations: [mockDonation],
    totalCount: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  },
  loading: false,
  flagging: false,
  summary: [],
  summaryLoading: false,
  fetchDonations: mockFetchDonations,
  fetchSummary: mockFetchSummary,
  submitFlag: mockSubmitFlag,
  submitResolveFlag: mockSubmitResolveFlag,
  exportCsv: mockExportCsv,
  ...overrides,
});

const renderComponent = () =>
  render(
    <MemoryRouter>
      <AdminDonationMonitoring />
    </MemoryRouter>,
  );

describe("AdminDonationMonitoring", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminDonations.mockReturnValue(createHookReturn());
  });

  describe("Loading state", () => {
    it("shows loading spinner when loading and donations are empty", () => {
      mockUseAdminDonations.mockReturnValue(
        createHookReturn({
          loading: true,
          result: {
            donations: [],
            totalCount: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
          },
        }),
      );
      renderComponent();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Title and total count", () => {
    it("renders Donation Monitoring title and total count", () => {
      mockUseAdminDonations.mockReturnValue(
        createHookReturn({
          result: {
            donations: [mockDonation, mockFlaggedDonation],
            totalCount: 2,
            page: 1,
            limit: 50,
            totalPages: 1,
          },
        }),
      );
      renderComponent();
      expect(screen.getByText("Donation Monitoring")).toBeInTheDocument();
      expect(screen.getByText("2 total")).toBeInTheDocument();
    });
  });

  describe("Donation table", () => {
    it("renders donation table with data", () => {
      renderComponent();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("Test Charity")).toBeInTheDocument();
      expect(screen.getByText("$150.00")).toBeInTheDocument();
      expect(screen.getByText("crypto")).toBeInTheDocument();
    });
  });

  describe("Flag button for unflagged donation", () => {
    it("shows Flag button for unflagged donation", () => {
      renderComponent();
      expect(screen.getByRole("button", { name: "Flag" })).toBeInTheDocument();
    });
  });

  describe("Resolved text for flagged donation with no open flags", () => {
    it("shows Resolved for flagged donation with no open flags", () => {
      mockUseAdminDonations.mockReturnValue(
        createHookReturn({
          result: {
            donations: [mockResolvedDonation],
            totalCount: 1,
            page: 1,
            limit: 50,
            totalPages: 1,
          },
        }),
      );
      renderComponent();
      expect(screen.getByText("Resolved")).toBeInTheDocument();
    });
  });

  describe("Flag modal", () => {
    it("opens flag modal on Flag click", async () => {
      renderComponent();
      fireEvent.click(screen.getByRole("button", { name: "Flag" }));
      await waitFor(() => {
        expect(
          screen.getByText("Flag Donation for Review"),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByPlaceholderText(
          "Describe why this donation is suspicious\u2026",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Flag Donation")).toBeInTheDocument();
    });
  });

  describe("Report panel toggle", () => {
    it("toggles report panel visibility", () => {
      renderComponent();
      expect(
        screen.queryByText("Donation Summary Report"),
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByText("Generate Report"));
      expect(
        screen.getByText("Donation Summary Report"),
      ).toBeInTheDocument();
      expect(screen.getByText("Hide Report")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Hide Report"));
      expect(
        screen.queryByText("Donation Summary Report"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("shows empty state message when no donations match filters", () => {
      mockUseAdminDonations.mockReturnValue(
        createHookReturn({
          result: {
            donations: [],
            totalCount: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
          },
        }),
      );
      renderComponent();
      expect(
        screen.getByText("No donations found matching your filters."),
      ).toBeInTheDocument();
    });
  });
});
