import React from "react";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDonorData } from "@/hooks/useDonorData";
import { createMockAuth } from "@/test-utils/mockSetup";
import DonorPortal from "../DonorPortal";

// LoadingSpinner, DonorStats, DonationHistory, useProfile, useAuth,
// and useDonorData are mocked via moduleNameMapper.

const mockUseAuth = jest.mocked(useAuth);
const mockUseDonorData = jest.mocked(useDonorData);

const mockDonorData = {
  totalDonated: 1250,
  impactGrowth: 150,
  charitiesSupported: 5,
  donations: [
    {
      id: "don-1",
      date: "2024-03-01",
      charity: "Test Charity",
      amount: 500,
      impactGrowth: 60,
    },
    {
      id: "don-2",
      date: "2024-02-15",
      charity: "Another Charity",
      amount: 750,
      impactGrowth: 90,
    },
  ],
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <DonorPortal />
    </MemoryRouter>,
  );

describe("DonorPortal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(
      createMockAuth({
        user: { id: "donor-1", email: "donor@test.com" },
        userType: "donor",
      }),
    );
    mockUseDonorData.mockReturnValue({
      data: mockDonorData,
      loading: false,
      error: null,
    });
  });

  describe("Page heading", () => {
    it("renders the Donor Dashboard title", () => {
      renderPage();
      expect(screen.getByText("Donor Dashboard")).toBeInTheDocument();
    });

    it("renders the welcome message", () => {
      renderPage();
      expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    });
  });

  describe("Dashboard sections", () => {
    it("renders the DonorStats component with correct props", () => {
      renderPage();
      const statsEl = screen.getByTestId("donor-stats");
      expect(statsEl).toBeInTheDocument();
      expect(screen.getByText("Total: 1250")).toBeInTheDocument();
      expect(screen.getByText("Impact: 150")).toBeInTheDocument();
      expect(screen.getByText("Charities: 5")).toBeInTheDocument();
    });

    it("renders the DonationHistory component", () => {
      renderPage();
      expect(screen.getByTestId("donation-history")).toBeInTheDocument();
      expect(screen.getByText("2 donations")).toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    it("shows loading spinner when data is loading", () => {
      mockUseDonorData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });
      renderPage();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.queryByText("Donor Dashboard")).not.toBeInTheDocument();
    });
  });

  describe("Error state", () => {
    it("shows error message when data fetch fails", () => {
      mockUseDonorData.mockReturnValue({
        data: null,
        loading: false,
        error: "Failed to load donor data",
      });
      renderPage();
      expect(
        screen.getByText("Failed to load donor data"),
      ).toBeInTheDocument();
    });
  });

  describe("Authentication redirects", () => {
    it("redirects to login when user is not authenticated", () => {
      mockUseAuth.mockReturnValue(
        createMockAuth({ user: null, userType: null }),
      );
      renderPage();
      // Navigate component renders; dashboard title should not appear
      expect(screen.queryByText("Donor Dashboard")).not.toBeInTheDocument();
    });

    it("redirects charity users to charity portal", () => {
      mockUseAuth.mockReturnValue(
        createMockAuth({
          user: { id: "charity-1", email: "charity@test.com" },
          userType: "charity",
        }),
      );
      renderPage();
      expect(screen.queryByText("Donor Dashboard")).not.toBeInTheDocument();
    });
  });

  describe("No data state", () => {
    it("does not render stats or history when data is null", () => {
      mockUseDonorData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });
      renderPage();
      expect(screen.getByText("Donor Dashboard")).toBeInTheDocument();
      expect(screen.queryByTestId("donor-stats")).not.toBeInTheDocument();
      expect(screen.queryByTestId("donation-history")).not.toBeInTheDocument();
    });
  });
});
