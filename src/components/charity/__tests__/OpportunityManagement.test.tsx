import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OpportunityManagement } from "../OpportunityManagement";
import { useProfile } from "@/hooks/useProfile";
import { supabase, setMockResult, resetMockState } from "@/lib/supabase";

// OpportunityForm is handled via moduleNameMapper in jest.config.mjs —
// inline jest.mock() does not intercept ESM imports in Jest 30 + ts-jest.

const beachCleanupOpportunity = {
  id: "1",
  title: "Beach Cleanup",
  description: "Help clean the beach",
  work_language: "en",
  requirements: "None",
  time_commitment: "2 hours",
  skills: ["cleaning", "sorting"],
  commitment: "2 hours",
  location: "Beach",
  type: "in-person",
  status: "active",
  created_at: "2024-01-01",
};

describe("OpportunityManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockState();
    jest.mocked(useProfile).mockReturnValue({
      profile: { id: "charity-123" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    setMockResult("volunteer_opportunities", {
      data: [beachCleanupOpportunity],
      error: null,
    });
  });

  it("renders opportunities list", async () => {
    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(screen.getByText("Beach Cleanup")).toBeInTheDocument();
      expect(screen.getByText("Help clean the beach")).toBeInTheDocument();
    });
  });

  it("opens create opportunity form", async () => {
    render(<OpportunityManagement />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText("Create New")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create New"));

    expect(screen.getByText("Add Opportunity")).toBeInTheDocument();
  });

  it("renders edit and delete buttons for each opportunity", async () => {
    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(screen.getByText("Beach Cleanup")).toBeInTheDocument();
    });

    // The OpportunityCard renders Edit and Delete text buttons
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls supabase from with correct table name", async () => {
    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("volunteer_opportunities");
    });
  });

  it("handles supabase error", async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          order: () =>
            Promise.resolve({
              data: null,
              error: { message: "Database error" },
            }),
        }),
      }),
    });

    render(<OpportunityManagement />);

    await waitFor(() => {
      // The thrown error is a plain object (not Error instance), so the catch
      // block uses the fallback: "Failed to fetch opportunities"
      expect(
        screen.getByText("Failed to fetch opportunities"),
      ).toBeInTheDocument();
    });
  });

  it("shows loading state", () => {
    render(<OpportunityManagement />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows empty state when no opportunities", async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          order: () =>
            Promise.resolve({
              data: [],
              error: null,
            }),
        }),
      }),
    });

    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(screen.getByText(/no opportunities/i)).toBeInTheDocument();
    });
  });

  it("renders opportunity details after loading", async () => {
    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(screen.getByText("Beach Cleanup")).toBeInTheDocument();
    });

    // Verify the Create New button is present
    expect(screen.getByText("Create New")).toBeInTheDocument();
  });

  it("closes form when cancel is clicked", async () => {
    render(<OpportunityManagement />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText("Create New")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create New"));

    // Verify form is shown
    expect(screen.getByText("Add Opportunity")).toBeInTheDocument();

    // Click cancel on the mocked form
    fireEvent.click(screen.getByText("Cancel Form"));

    // Form should be hidden and opportunities should be visible again
    await waitFor(() => {
      expect(screen.queryByText("Add Opportunity")).not.toBeInTheDocument();
    });
  });
});
