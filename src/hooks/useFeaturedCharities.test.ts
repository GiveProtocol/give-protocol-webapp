import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { setMockResult, resetMockState } from "@/lib/supabase";
import { useFeaturedCharities } from "./useFeaturedCharities";
import type { CharityOrganization } from "@/types/charityOrganization";

const makeOrg = (ein: string): CharityOrganization => ({
  id: `id-${ein}`,
  ein,
  name: `Charity ${ein}`,
  city: "Boston",
  state: "MA",
  zip: "02101",
  ntee_cd: "A",
  deductibility: "1",
  is_on_platform: true,
  platform_charity_id: `platform-${ein}`,
  rank: 1,
  country: "US",
  registry_source: "IRS_BMF",
  data_source: null,
  data_vintage: null,
  last_synced_at: null,
});

describe("useFeaturedCharities", () => {
  beforeEach(() => {
    resetMockState();
  });

  it("returns loading: true on initial mount", () => {
    setMockResult("charity_organizations", { data: [], error: null });
    const { result } = renderHook(() => useFeaturedCharities());
    expect(result.current.loading).toBe(true);
  });

  it("returns charities and loading: false after successful fetch", async () => {
    const orgs = [makeOrg("12-3456789"), makeOrg("98-7654321")];
    setMockResult("charity_organizations", { data: orgs, error: null });

    const { result } = renderHook(() => useFeaturedCharities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.charities).toHaveLength(2);
    expect(result.current.charities[0].ein).toBe("12-3456789");
    expect(result.current.error).toBeNull();
  });

  it("returns empty charities when supabase returns an error (service swallows it)", async () => {
    setMockResult("charity_organizations", {
      data: null,
      error: { message: "Permission denied" },
    });

    const { result } = renderHook(() => useFeaturedCharities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Service handles supabase errors internally and returns []
    expect(result.current.charities).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it("returns empty array when no platform charities exist", async () => {
    setMockResult("charity_organizations", { data: [], error: null });

    const { result } = renderHook(() => useFeaturedCharities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.charities).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
});
