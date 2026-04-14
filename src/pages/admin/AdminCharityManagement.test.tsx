import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAdminCharities } from "@/hooks/useAdminCharities";
import AdminCharityManagement from "./AdminCharityManagement";

// useAdminCharities, Card, LoadingSpinner, Modal, Button are mocked via moduleNameMapper

const mockUseAdminCharities = jest.mocked(useAdminCharities);

const mockCharity = {
  id: "charity-1",
  userId: null,
  name: "Test Charity",
  category: "Environment",
  logoUrl: null,
  mission: null,
  verificationId: null,
  verificationStatus: "pending" as const,
  reviewNotes: null,
  reviewedAt: null,
  walletAddress: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminCharityManagement />
    </MemoryRouter>,
  );

describe("AdminCharityManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminCharities.mockReturnValue({
      result: {
        charities: [],
        totalCount: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      },
      loading: false,
      updating: false,
      fetchCharities: jest.fn().mockResolvedValue({
        charities: [],
        totalCount: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      }),
      approveCharity: jest.fn().mockResolvedValue(true),
      rejectCharity: jest.fn().mockResolvedValue(true),
      suspendCharity: jest.fn().mockResolvedValue(true),
      reinstateCharity: jest.fn().mockResolvedValue(true),
    });
  });

  describe("Renders", () => {
    it("renders the page heading", () => {
      renderPage();
      expect(screen.getByText("Charity Management")).toBeInTheDocument();
    });

    it("renders status filter dropdown", () => {
      renderPage();
      expect(screen.getByLabelText("Filter by status")).toBeInTheDocument();
    });

    it("renders search input", () => {
      renderPage();
      expect(screen.getByLabelText("Search charities")).toBeInTheDocument();
    });

    it("shows empty state when no charities", () => {
      renderPage();
      expect(screen.getByText(/No charities found/i)).toBeInTheDocument();
    });

    it("shows 0 total count", () => {
      renderPage();
      expect(screen.getByText("0 total")).toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    it("shows loading spinner when loading with empty list", () => {
      mockUseAdminCharities.mockReturnValue({
        result: {
          charities: [],
          totalCount: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        },
        loading: true,
        updating: false,
        fetchCharities: jest.fn().mockResolvedValue({
          charities: [],
          totalCount: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        }),
        approveCharity: jest.fn().mockResolvedValue(true),
        rejectCharity: jest.fn().mockResolvedValue(true),
        suspendCharity: jest.fn().mockResolvedValue(true),
        reinstateCharity: jest.fn().mockResolvedValue(true),
      });
      renderPage();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Charity list", () => {
    it("renders charity name when charities are present", () => {
      mockUseAdminCharities.mockReturnValue({
        result: {
          charities: [mockCharity],
          totalCount: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
        loading: false,
        updating: false,
        fetchCharities: jest.fn().mockResolvedValue({
          charities: [mockCharity],
          totalCount: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        }),
        approveCharity: jest.fn().mockResolvedValue(true),
        rejectCharity: jest.fn().mockResolvedValue(true),
        suspendCharity: jest.fn().mockResolvedValue(true),
        reinstateCharity: jest.fn().mockResolvedValue(true),
      });
      renderPage();
      expect(screen.getByText("Test Charity")).toBeInTheDocument();
    });

    it("renders charity category", () => {
      mockUseAdminCharities.mockReturnValue({
        result: {
          charities: [mockCharity],
          totalCount: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
        loading: false,
        updating: false,
        fetchCharities: jest.fn().mockResolvedValue({
          charities: [mockCharity],
          totalCount: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        }),
        approveCharity: jest.fn().mockResolvedValue(true),
        rejectCharity: jest.fn().mockResolvedValue(true),
        suspendCharity: jest.fn().mockResolvedValue(true),
        reinstateCharity: jest.fn().mockResolvedValue(true),
      });
      renderPage();
      expect(screen.getByText("Environment")).toBeInTheDocument();
    });
  });

  describe("Filter", () => {
    it("changes status filter", () => {
      renderPage();
      const select = screen.getByLabelText("Filter by status");
      fireEvent.change(select, { target: { value: "pending" } });
      expect(select).toHaveValue("pending");
    });

    it("updates search input", () => {
      renderPage();
      const input = screen.getByLabelText("Search charities");
      fireEvent.change(input, { target: { value: "Test" } });
      expect(input).toHaveValue("Test");
    });
  });
});
