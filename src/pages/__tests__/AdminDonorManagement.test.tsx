import React from "react";
import { jest } from "@jest/globals";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAdminDonors } from "@/hooks/useAdminDonors";
import AdminDonorManagement from "../admin/AdminDonorManagement";
import type { AdminDonorListItem } from "@/types/adminDonor";

// useAdminDonors is mocked via moduleNameMapper
const mockUseAdminDonors = jest.mocked(useAdminDonors);

const mockDonor: AdminDonorListItem = {
  userId: "donor-1",
  displayName: "John Doe",
  email: "john@example.com",
  walletAddress: null,
  primaryAuthMethod: "email",
  userStatus: "active" as const,
  totalCryptoUsd: 100.0,
  totalFiatUsd: 50.0,
  donationCount: 5,
  createdAt: "2025-01-15T00:00:00Z",
};

const mockSuspendedDonor: AdminDonorListItem = {
  ...mockDonor,
  userId: "donor-2",
  displayName: "Jane Smith",
  email: "jane@example.com",
  userStatus: "suspended" as const,
};

const mockBannedDonor: AdminDonorListItem = {
  ...mockDonor,
  userId: "donor-3",
  displayName: "Bob Banned",
  email: "bob@example.com",
  userStatus: "banned" as const,
};

const mockFetchDonors = jest.fn();
const mockSuspendDonor = jest.fn();
const mockReinstateDonor = jest.fn();
const mockBanDonor = jest.fn();

const createHookReturn = (overrides = {}) => ({
  result: {
    donors: [mockDonor],
    totalCount: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  },
  loading: false,
  updating: false,
  detail: null,
  detailLoading: false,
  fetchDonors: mockFetchDonors,
  fetchDonorDetail: jest.fn(),
  suspendDonor: mockSuspendDonor,
  reinstateDonor: mockReinstateDonor,
  banDonor: mockBanDonor,
  ...overrides,
});

const renderComponent = () =>
  render(
    <MemoryRouter>
      <AdminDonorManagement />
    </MemoryRouter>,
  );

describe("AdminDonorManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminDonors.mockReturnValue(createHookReturn());
  });

  describe("Loading state", () => {
    it("shows loading spinner when loading and donors are empty", () => {
      mockUseAdminDonors.mockReturnValue(
        createHookReturn({
          loading: true,
          result: {
            donors: [],
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
    it("renders Donor Management title and total count", () => {
      mockUseAdminDonors.mockReturnValue(
        createHookReturn({
          result: {
            donors: [mockDonor, mockSuspendedDonor],
            totalCount: 2,
            page: 1,
            limit: 50,
            totalPages: 1,
          },
        }),
      );
      renderComponent();
      expect(screen.getByText("Donor Management")).toBeInTheDocument();
      expect(screen.getByText("2 total")).toBeInTheDocument();
    });
  });

  describe("Donor table", () => {
    it("renders donor table with data", () => {
      renderComponent();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("email")).toBeInTheDocument();
      // "Active" appears in both status filter option and badge
      const activeElements = screen.getAllByText("Active");
      expect(activeElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Donor")).toBeInTheDocument();
      expect(screen.getByText("Auth")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Total Donated")).toBeInTheDocument();
      expect(screen.getByText("Donations")).toBeInTheDocument();
      expect(screen.getByText("Joined")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });

  describe("Action buttons for active donors", () => {
    it("shows Suspend and Ban buttons for active donors", () => {
      renderComponent();
      expect(screen.getByText("Suspend")).toBeInTheDocument();
      expect(screen.getByText("Ban")).toBeInTheDocument();
    });
  });

  describe("Action buttons for suspended donors", () => {
    it("shows Reinstate and Ban buttons for suspended donors", () => {
      mockUseAdminDonors.mockReturnValue(
        createHookReturn({
          result: {
            donors: [mockSuspendedDonor],
            totalCount: 1,
            page: 1,
            limit: 50,
            totalPages: 1,
          },
        }),
      );
      renderComponent();
      expect(screen.getByText("Reinstate")).toBeInTheDocument();
      expect(screen.getByText("Ban")).toBeInTheDocument();
    });
  });

  describe("Action buttons for banned donors", () => {
    it("shows Reinstate button for banned donors", () => {
      mockUseAdminDonors.mockReturnValue(
        createHookReturn({
          result: {
            donors: [mockBannedDonor],
            totalCount: 1,
            page: 1,
            limit: 50,
            totalPages: 1,
          },
        }),
      );
      renderComponent();
      expect(screen.getByText("Reinstate")).toBeInTheDocument();
    });
  });

  describe("Action modal", () => {
    it("opens modal when Suspend is clicked with required reason field", async () => {
      renderComponent();
      fireEvent.click(screen.getByText("Suspend"));
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Suspend Donor" }),
        ).toBeInTheDocument();
      });
      expect(screen.getByText(/Reason/)).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("shows empty state message when no donors match filters", () => {
      mockUseAdminDonors.mockReturnValue(
        createHookReturn({
          result: {
            donors: [],
            totalCount: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
          },
        }),
      );
      renderComponent();
      expect(
        screen.getByText("No donors found matching your filters."),
      ).toBeInTheDocument();
    });
  });

  describe("Filter by status", () => {
    it("renders the status filter dropdown", () => {
      renderComponent();
      const statusSelect = screen.getByLabelText("Filter by status");
      expect(statusSelect).toBeInTheDocument();
    });

    it("calls fetchDonors when status filter changes", () => {
      renderComponent();
      const statusSelect = screen.getByLabelText("Filter by status");
      fireEvent.change(statusSelect, { target: { value: "suspended" } });
      expect(mockFetchDonors).toHaveBeenCalled();
    });
  });
});
