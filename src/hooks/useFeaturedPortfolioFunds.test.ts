import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { setMockResult, resetMockState } from "@/lib/supabase";
import { useFeaturedPortfolioFunds } from "./useFeaturedPortfolioFunds";

// supabase is mocked globally via moduleNameMapper — setMockResult controls per-table responses.

interface FundRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  charity_ids: string[] | null;
}

function makeRow(id: string, overrides?: Partial<FundRow>): FundRow {
  return {
    id,
    name: `Fund ${id}`,
    description: `Description for fund ${id}`,
    category: "Environment",
    image_url: `https://example.com/${id}.jpg`,
    charity_ids: ["c1", "c2"],
    ...overrides,
  };
}

describe("useFeaturedPortfolioFunds", () => {
  beforeEach(() => {
    resetMockState();
  });

  it("returns loading: true on initial mount", () => {
    const { result } = renderHook(() => useFeaturedPortfolioFunds());
    expect(result.current.loading).toBe(true);
  });

  it("returns funds and loading: false after successful fetch", async () => {
    const rows = [makeRow("1"), makeRow("2", { charity_ids: ["c1", "c2", "c3"] })];
    setMockResult("portfolio_funds", { data: rows, error: null });

    const { result } = renderHook(() => useFeaturedPortfolioFunds());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.funds).toHaveLength(2);
    expect(result.current.funds[0].id).toBe("1");
    expect(result.current.funds[0].name).toBe("Fund 1");
    expect(result.current.funds[0].charityCount).toBe(2);
    expect(result.current.funds[1].charityCount).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it("sets error when fetch fails", async () => {
    setMockResult("portfolio_funds", { data: null, error: { message: "DB error" } });

    const { result } = renderHook(() => useFeaturedPortfolioFunds());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.funds).toHaveLength(0);
    expect(result.current.error).toBe("Failed to load portfolio funds");
  });

  it("returns empty array when no active funds exist", async () => {
    setMockResult("portfolio_funds", { data: [], error: null });

    const { result } = renderHook(() => useFeaturedPortfolioFunds());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.funds).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it("handles null fields gracefully", async () => {
    setMockResult("portfolio_funds", {
      data: [makeRow("1", { description: null, category: null, image_url: null, charity_ids: null })],
      error: null,
    });

    const { result } = renderHook(() => useFeaturedPortfolioFunds());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.funds[0].description).toBe("");
    expect(result.current.funds[0].category).toBe("General");
    expect(result.current.funds[0].imageUrl).toBe("");
    expect(result.current.funds[0].charityCount).toBe(0);
  });
});
