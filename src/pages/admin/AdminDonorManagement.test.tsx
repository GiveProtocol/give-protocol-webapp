import React from "react";
import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAdminDonors } from "@/hooks/useAdminDonors";
import AdminDonorManagement from "./AdminDonorManagement";

// useAdminDonors, Card, LoadingSpinner, Modal, Button are mocked via moduleNameMapper

const mockUseAdminDonors = jest.mocked(useAdminDonors);

const mockDonor = {
  id: "donor-1",
  userId: "user-1",
  email: "donor@test.com",
  username: "testdonor",
  userStatus: "active" as const,
  authMethod: "email" as const,
  totalDonatedCrypto: 0,
  totalDonatedFiat: 500,
  donationCount: 5,
  joinedAt: "2024-01-01T00:00:00Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminDonorManagement />
    </MemoryRouter>,
  );

describe("AdminDonorManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminDonors.mockReturnValue({
      result: {
        donors: [],
        totalCount: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      },
      loading: false,
      updating: false,
      detail: null,
      detailLoading: false,
      fetchDonors: jest.fn().mockResolvedValue({
        donors: [],
        totalCount: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      }),
      fetchDonorDetail: jest.fn().mockResolvedValue(null),
      suspendDonor: jest.fn().mockResolvedValue(true),
      reinstateDonor: jest.fn().mockResolvedValue(true),
      banDonor: jest.fn().mockResolvedValue(true),
    });
  });

  describe("Renders", () => {
    it("renders the page heading", () => {
      renderPage();
      expect(screen.getByText("Donor Management")).toBeInTheDocument();
    });

    it("renders status filter", () => {
      renderPage();
      expect(screen.getByLabelText(/Filter by status/i)).toBeInTheDocument();
    });

    it("renders search input", () => {
      renderPage();
      expect(screen.getByLabelText("Search donors")).toBeInTheDocument();
    });

    it("shows empty state when no donors", () => {
      renderPage();
      expect(screen.getByText(/No donors found/i)).toBeInTheDocument();
    });

    it("shows total count", () => {
      renderPage();
      expect(screen.getByText(/0 total/i)).toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    it("shows loading spinner when loading with empty list", () => {
      mockUseAdminDonors.mockReturnValue({
        result: {
          donors: [],
          totalCount: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        },
        loading: true,
        updating: false,
        detail: null,
        detailLoading: false,
        fetchDonors: jest.fn().mockResolvedValue({
          donors: [],
          totalCount: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        }),
        fetchDonorDetail: jest.fn().mockResolvedValue(null),
        suspendDonor: jest.fn().mockResolvedValue(true),
        reinstateDonor: jest.fn().mockResolvedValue(true),
        banDonor: jest.fn().mockResolvedValue(true),
      });
      renderPage();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Donor list", () => {
    it("renders donor email when donors are present", () => {
      mockUseAdminDonors.mockReturnValue({
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
        fetchDonors: jest.fn().mockResolvedValue({
          donors: [mockDonor],
          totalCount: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        }),
        fetchDonorDetail: jest.fn().mockResolvedValue(null),
        suspendDonor: jest.fn().mockResolvedValue(true),
        reinstateDonor: jest.fn().mockResolvedValue(true),
        banDonor: jest.fn().mockResolvedValue(true),
      });
      renderPage();
      expect(screen.getByText("donor@test.com")).toBeInTheDocument();
    });
  });

  describe("Filter controls", () => {
    it("updates status filter", () => {
      renderPage();
      const select = screen.getByLabelText(/Filter by status/i);
      fireEvent.change(select, { target: { value: "suspended" } });
      expect(select).toHaveValue("suspended");
    });

    it("updates search input", () => {
      renderPage();
      const input = screen.getByLabelText("Search donors");
      fireEvent.change(input, { target: { value: "donor@test.com" } });
      expect(input).toHaveValue("donor@test.com");
    });
  });
});
