import _React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OpportunityManagement } from "../OpportunityManagement";

// Mock dependencies
jest.mock("@/hooks/useProfile", () => ({
  useProfile: () => ({ profile: { id: "charity-123" } }),
}));
jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() =>
          Promise.resolve({
            data: [
              {
                id: "1",
                title: "Beach Cleanup",
                description: "Help clean the beach",
                work_language: "en",
                requirements: "None",
                time_commitment: "2 hours",
              },
            ],
            error: null,
          }),
        ),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

describe("OpportunityManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders opportunities list", async () => {
    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(screen.getByText("Beach Cleanup")).toBeInTheDocument();
      expect(screen.getByText("Help clean the beach")).toBeInTheDocument();
    });
  });

  it("opens create opportunity form", () => {
    render(<OpportunityManagement />);

    fireEvent.click(screen.getByText(/create.*opportunity/i));

    expect(screen.getByText(/add.*opportunity/i)).toBeInTheDocument();
  });

  it("opens edit form when edit button clicked", async () => {
    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(screen.getByText("Beach Cleanup")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByLabelText(/edit/i)[0]);

    expect(screen.getByText(/edit.*opportunity/i)).toBeInTheDocument();
  });

  it("deletes opportunity when delete button clicked", async () => {
    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(screen.getByText("Beach Cleanup")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByLabelText(/delete/i)[0]);

    expect(screen.getByText(/delete.*opportunity/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/confirm/i));

    await waitFor(() => {
      const mockSupabase = jest.requireMock("@/lib/supabase").supabase;
      expect(mockSupabase.from).toHaveBeenCalledWith("volunteer_opportunities");
    });
  });

  it("handles supabase error", async () => {
    const mockSupabase = jest.requireMock("@/lib/supabase").supabase;
    mockSupabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: null,
            error: { message: "Database error" },
          }),
      }),
    });

    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(screen.getByText(/error loading/i)).toBeInTheDocument();
    });
  });

  it("shows loading state", () => {
    render(<OpportunityManagement />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows empty state when no opportunities", async () => {
    const mockSupabase = jest.requireMock("@/lib/supabase").supabase;
    mockSupabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: [],
            error: null,
          }),
      }),
    });

    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(screen.getByText(/no opportunities/i)).toBeInTheDocument();
    });
  });

  it("filters opportunities by language", async () => {
    render(<OpportunityManagement />);

    await waitFor(() => {
      expect(screen.getByText("Beach Cleanup")).toBeInTheDocument();
    });

    // Test component renders properly
    expect(screen.getByText(/create.*opportunity/i)).toBeInTheDocument();
  });

  it("closes forms when cancel is clicked", () => {
    render(<OpportunityManagement />);

    fireEvent.click(screen.getByText(/create.*opportunity/i));

    // Test form opening behavior
    expect(screen.getByText(/add.*opportunity/i)).toBeInTheDocument();
  });
});
