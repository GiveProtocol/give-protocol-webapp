import React from "react";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ClaimCharity from "../ClaimCharity";

// Card, Button, LoadingSpinner, and charityProfileService are mocked via moduleNameMapper

import { getCharityProfileByEin } from "@/services/charityProfileService";

const mockGetProfile = jest.mocked(getCharityProfileByEin);

const mockProfile = {
  id: "profile-1",
  ein: "12-3456789",
  name: "Test Charity Foundation",
  mission: "Help communities",
  description: "A test charity",
  category: "Human Services",
  city: "New York",
  state: "NY",
  website: "https://testcharity.org",
  logo_url: null,
  banner_url: null,
  is_claimed: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  verified: false,
  wallet_address: null,
  photos: [],
  total_revenue: 0,
  total_expenses: 0,
  net_assets: 0,
};

const renderClaimCharity = (ein = "12-3456789") =>
  render(
    <MemoryRouter initialEntries={[`/claim/${ein}`]}>
      <Routes>
        <Route path="/claim/:ein" element={<ClaimCharity />} />
      </Routes>
    </MemoryRouter>,
  );

describe("ClaimCharity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProfile.mockResolvedValue(mockProfile);
  });

  describe("Loading state", () => {
    it("shows loading spinner before data loads", () => {
      mockGetProfile.mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves to keep loading state
          }),
      );
      renderClaimCharity();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Page header", () => {
    it("renders the Claim Organization heading", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByText("Claim Organization")).toBeInTheDocument();
      });
    });

    it("renders the charity name when profile loads", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(
          screen.getByText(/Test Charity Foundation/),
        ).toBeInTheDocument();
      });
    });

    it("renders the EIN when profile loads", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByText(/EIN 12-3456789/)).toBeInTheDocument();
      });
    });
  });

  describe("Step indicator", () => {
    it("renders the Verify Identity step label", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByText("Verify Identity")).toBeInTheDocument();
      });
    });

    it("renders the Confirm Organization step label", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(
          screen.getByText("Confirm Organization"),
        ).toBeInTheDocument();
      });
    });

    it("renders the Wallet Setup step label", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByText("Wallet Setup")).toBeInTheDocument();
      });
    });

    it("renders the Complete step label", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByText("Complete")).toBeInTheDocument();
      });
    });
  });

  describe("Verify Identity form", () => {
    it("renders the Step 1 heading", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(
          screen.getByText("Step 1: Verify Your Identity"),
        ).toBeInTheDocument();
      });
    });

    it("renders the role selection label", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(
          screen.getByText("Your role at this organization"),
        ).toBeInTheDocument();
      });
    });

    it("renders the role select dropdown", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByLabelText("Your role at this organization")).toBeInTheDocument();
      });
    });

    it("renders role options in the dropdown", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByText("Select a role...")).toBeInTheDocument();
      });
      expect(screen.getByText("Executive Director")).toBeInTheDocument();
      expect(screen.getByText("Staff")).toBeInTheDocument();
      expect(screen.getByText("Board Member")).toBeInTheDocument();
      expect(screen.getByText("Volunteer")).toBeInTheDocument();
      expect(screen.getByText("Other")).toBeInTheDocument();
    });

    it("renders the email input label", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByText("Work email address")).toBeInTheDocument();
      });
    });

    it("renders the email input with placeholder", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("you@organization.org"),
        ).toBeInTheDocument();
      });
    });

    it("renders the email domain note", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(
          screen.getByText(
            /Your email domain will be cross-referenced/,
          ),
        ).toBeInTheDocument();
      });
    });

    it("renders the Continue button", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByText("Continue")).toBeInTheDocument();
      });
    });

    it("renders the Continue button as disabled", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByText("Continue")).toBeDisabled();
      });
    });

    it("renders the coming soon notice", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(
          screen.getByText(
            /Claim verification coming soon/,
          ),
        ).toBeInTheDocument();
      });
    });

    it("allows selecting a role", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByLabelText("Your role at this organization")).toBeInTheDocument();
      });
      const select = screen.getByLabelText("Your role at this organization");
      fireEvent.change(select, { target: { value: "Staff" } });
      expect(select).toHaveValue("Staff");
    });

    it("allows entering an email", async () => {
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByLabelText("Work email address")).toBeInTheDocument();
      });
      const input = screen.getByLabelText("Work email address");
      fireEvent.change(input, { target: { value: "user@charity.org" } });
      expect(input).toHaveValue("user@charity.org");
    });
  });

  describe("Profile not found", () => {
    it("renders the page without profile info when profile is null", async () => {
      mockGetProfile.mockResolvedValue(null);
      renderClaimCharity();
      await waitFor(() => {
        expect(screen.getByText("Claim Organization")).toBeInTheDocument();
      });
      expect(
        screen.queryByText(/Test Charity Foundation/),
      ).not.toBeInTheDocument();
    });
  });

  describe("Service call", () => {
    it("calls getCharityProfileByEin with the EIN from the URL", async () => {
      renderClaimCharity("98-7654321");
      await waitFor(() => {
        expect(mockGetProfile).toHaveBeenCalledWith("98-7654321");
      });
    });
  });
});
