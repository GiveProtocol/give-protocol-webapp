import React from 'react';
import { jest } from '@jest/globals';
import { render, screen } from "@testing-library/react";
import { GlobalContributions } from "../GlobalContributions";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() =>
        Promise.resolve({
          data: [
            { amount: "100", created_at: "2024-01-01" },
            { amount: "200", created_at: "2024-01-02" },
          ],
          error: null,
        }),
      ),
    })),
  },
}));

describe("GlobalContributions", () => {
  it("renders global contributions data", async () => {
    render(<GlobalContributions />);

    // Should show loading state initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("displays contributions total", async () => {
    render(<GlobalContributions />);

    await screen.findByText(/total/i);
    expect(screen.getByText(/300/)).toBeInTheDocument(); // 100 + 200
  });

  it("handles empty data", async () => {
    const mockSupabase = jest.requireMock("@/lib/supabase").supabase;
    mockSupabase.from.mockReturnValueOnce({
      select: () => Promise.resolve({ data: [], error: null }),
    });

    render(<GlobalContributions />);

    const noContributions = await screen.findByText(/no contributions/i);
    expect(noContributions).toBeInTheDocument();
  });

  it("handles error state", async () => {
    const mockSupabase = jest.requireMock("@/lib/supabase").supabase;
    mockSupabase.from.mockReturnValueOnce({
      select: () =>
        Promise.resolve({ data: null, error: { message: "Error" } }),
    });

    render(<GlobalContributions />);

    const errorMessage = await screen.findByText(/error/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
