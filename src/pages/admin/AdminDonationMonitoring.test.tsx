import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAdminDonations } from "@/hooks/useAdminDonations";
import AdminDonationMonitoring from "./AdminDonationMonitoring";

// useAdminDonations, Card, LoadingSpinner, Modal, Button are mocked via moduleNameMapper

const mockUseAdminDonations = jest.mocked(useAdminDonations);

const mockDonation = {
  id: "donation-1",
  donorId: "donor-1",
  donorEmail: "donor@test.com",
  charityId: "charity-1",
  charityName: "Test Charity",
  amountUsd: 100,
  paymentMethod: "fiat" as const,
  isFlagged: false,
  createdAt: "2024-01-01T00:00:00Z",
  txHash: null,
  flagReason: null,
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminDonationMonitoring />
    </MemoryRouter>,
  );

describe("AdminDonationMonitoring", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminDonations.mockReturnValue({
      result: {
        donations: [],
        totalCount: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      },
      loading: false,
      flagging: false,
      summary: [],
      summaryLoading: false,
      fetchDonations: jest.fn().mockResolvedValue({
        donations: [],
        totalCount: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      }),
      fetchSummary: jest.fn().mockResolvedValue([]),
      submitFlag: jest.fn().mockResolvedValue(true),
      submitResolveFlag: jest.fn().mockResolvedValue(true),
      exportCsv: jest.fn(),
    });
  });

  describe("Renders", () => {
    it("renders the page heading", () => {
      renderPage();
      expect(screen.getByText("Donation Monitoring")).toBeInTheDocument();
    });

    it("renders payment method filter", () => {
      renderPage();
      expect(
        screen.getByLabelText(/Payment method/i),
      ).toBeInTheDocument();
    });

    it("renders search input", () => {
      renderPage();
      expect(screen.getByLabelText("Search donations")).toBeInTheDocument();
    });

    it("shows empty state when no donations", () => {
      renderPage();
      expect(screen.getByText(/No donations found/i)).toBeInTheDocument();
    });

    it("shows total count", () => {
      renderPage();
      expect(screen.getByText(/0 total/i)).toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    it("shows loading spinner when loading with empty list", () => {
      mockUseAdminDonations.mockReturnValue({
        result: {
          donations: [],
          totalCount: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        },
        loading: true,
        flagging: false,
        summary: [],
        summaryLoading: false,
        fetchDonations: jest.fn().mockResolvedValue({
          donations: [],
          totalCount: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        }),
        fetchSummary: jest.fn().mockResolvedValue([]),
        submitFlag: jest.fn().mockResolvedValue(true),
        submitResolveFlag: jest.fn().mockResolvedValue(true),
        exportCsv: jest.fn(),
      });
      renderPage();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Donation list", () => {
    it("renders charity name when donations are present", () => {
      mockUseAdminDonations.mockReturnValue({
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
        fetchDonations: jest.fn().mockResolvedValue({
          donations: [mockDonation],
          totalCount: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        }),
        fetchSummary: jest.fn().mockResolvedValue([]),
        submitFlag: jest.fn().mockResolvedValue(true),
        submitResolveFlag: jest.fn().mockResolvedValue(true),
        exportCsv: jest.fn(),
      });
      renderPage();
      expect(screen.getByText("Test Charity")).toBeInTheDocument();
    });

    it("renders donor email", () => {
      mockUseAdminDonations.mockReturnValue({
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
        fetchDonations: jest.fn().mockResolvedValue({
          donations: [mockDonation],
          totalCount: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        }),
        fetchSummary: jest.fn().mockResolvedValue([]),
        submitFlag: jest.fn().mockResolvedValue(true),
        submitResolveFlag: jest.fn().mockResolvedValue(true),
        exportCsv: jest.fn(),
      });
      renderPage();
      expect(screen.getByText("donor@test.com")).toBeInTheDocument();
    });
  });

  describe("Filter controls", () => {
    it("updates payment method filter", () => {
      renderPage();
      const select = screen.getByLabelText(/Payment method/i);
      fireEvent.change(select, { target: { value: "crypto" } });
      expect(select).toHaveValue("crypto");
    });

    it("updates search input", () => {
      renderPage();
      const input = screen.getByLabelText("Search donations");
      fireEvent.change(input, { target: { value: "donor@test.com" } });
      expect(input).toHaveValue("donor@test.com");
    });
  });

  describe("Report tab", () => {
    it("renders Generate Report button", () => {
      renderPage();
      expect(screen.getByText(/Generate Report/i)).toBeInTheDocument();
    });
  });
});
