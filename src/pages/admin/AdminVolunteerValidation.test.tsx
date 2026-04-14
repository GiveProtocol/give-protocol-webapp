import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAdminVolunteerValidation } from "@/hooks/useAdminVolunteerValidation";
import AdminVolunteerValidation from "./AdminVolunteerValidation";

// useAdminVolunteerValidation, Card, LoadingSpinner, Modal, Button are mocked via moduleNameMapper

const mockUseAdminVolunteerValidation = jest.mocked(useAdminVolunteerValidation);

const mockStats = {
  totalPending: 5,
  totalApproved: 20,
  totalRejected: 3,
  totalExpired: 1,
  avgResponseTimeHours: 4.5,
  expirationRate: 0.03,
  rejectionRate: 0.12,
  pendingByOrg: [],
};

const mockRequest = {
  id: "req-1",
  volunteerId: "vol-1",
  volunteerEmail: "volunteer@test.com",
  volunteerDisplayName: null,
  orgId: "org-1",
  orgName: "Test Charity",
  hoursReported: 8,
  activityDate: "2024-01-01",
  status: "pending" as const,
  validatorUserId: null,
  validatedAt: null,
  expiresAt: "2024-01-08T00:00:00Z",
  createdAt: "2024-01-01T00:00:00Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminVolunteerValidation />
    </MemoryRouter>,
  );

describe("AdminVolunteerValidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminVolunteerValidation.mockReturnValue({
      stats: null,
      statsLoading: false,
      result: {
        requests: [],
        totalCount: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      },
      loading: false,
      overriding: false,
      suspiciousPatterns: [],
      patternsLoading: false,
      fetchStats: jest.fn().mockResolvedValue(null),
      fetchRequests: jest.fn().mockResolvedValue({
        requests: [],
        totalCount: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      }),
      submitOverride: jest.fn().mockResolvedValue(true),
      fetchSuspiciousPatterns: jest.fn().mockResolvedValue([]),
    });
  });

  describe("Renders", () => {
    it("renders the page heading", () => {
      renderPage();
      expect(
        screen.getByText("Volunteer Validation Oversight"),
      ).toBeInTheDocument();
    });

    it("renders Validation Requests tab", () => {
      renderPage();
      expect(screen.getByText("Validation Requests")).toBeInTheDocument();
    });

    it("renders Suspicious Patterns tab", () => {
      renderPage();
      expect(screen.getByText("Suspicious Patterns")).toBeInTheDocument();
    });

    it("shows empty state for requests", () => {
      renderPage();
      expect(
        screen.getByText(/No validation requests found/i),
      ).toBeInTheDocument();
    });

    it("shows total requests count", () => {
      renderPage();
      expect(screen.getByText(/0 total requests/i)).toBeInTheDocument();
    });
  });

  describe("Stats panel", () => {
    it("renders pipeline stats when available", () => {
      mockUseAdminVolunteerValidation.mockReturnValue({
        stats: mockStats,
        statsLoading: false,
        result: {
          requests: [],
          totalCount: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        },
        loading: false,
        overriding: false,
        suspiciousPatterns: [],
        patternsLoading: false,
        fetchStats: jest.fn().mockResolvedValue(mockStats),
        fetchRequests: jest.fn().mockResolvedValue({
          requests: [],
          totalCount: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        }),
        submitOverride: jest.fn().mockResolvedValue(true),
        fetchSuspiciousPatterns: jest.fn().mockResolvedValue([]),
      });
      renderPage();
      // Stats show totalApproved=20 which is unique on the page
      expect(screen.getByText("20")).toBeInTheDocument();
      // "Approved" appears in stats labels
      expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
    });
  });

  describe("Validation Requests list", () => {
    it("renders request row when requests are present", () => {
      mockUseAdminVolunteerValidation.mockReturnValue({
        stats: null,
        statsLoading: false,
        result: {
          requests: [mockRequest],
          totalCount: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
        loading: false,
        overriding: false,
        suspiciousPatterns: [],
        patternsLoading: false,
        fetchStats: jest.fn().mockResolvedValue(null),
        fetchRequests: jest.fn().mockResolvedValue({
          requests: [mockRequest],
          totalCount: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        }),
        submitOverride: jest.fn().mockResolvedValue(true),
        fetchSuspiciousPatterns: jest.fn().mockResolvedValue([]),
      });
      renderPage();
      expect(screen.getByText("volunteer@test.com")).toBeInTheDocument();
    });
  });

  describe("Tab switching", () => {
    it("shows suspicious patterns empty state when tab is clicked", () => {
      renderPage();
      fireEvent.click(screen.getByText("Suspicious Patterns"));
      expect(
        screen.getByText(/No suspicious patterns detected/i),
      ).toBeInTheDocument();
    });
  });
});
