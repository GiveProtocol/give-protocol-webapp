import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { getFeaturedCharities } from "@/services/charityOrganizationService";
import { useFeaturedCharities } from "./useFeaturedCharities";
import type { CharityOrganization } from "@/types/charityOrganization";

const mockGetFeatured = getFeaturedCharities as jest.MockedFunction<
  typeof getFeaturedCharities
>;

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
    mockGetFeatured.mockReset();
    mockGetFeatured.mockResolvedValue([]);
  });

  it("returns loading: true on initial mount", () => {
    const { result } = renderHook(() => useFeaturedCharities());
    expect(result.current.loading).toBe(true);
  });

  it("returns charities and loading: false after successful fetch", async () => {
    const orgs = [makeOrg("12-3456789"), makeOrg("98-7654321")];
    mockGetFeatured.mockResolvedValue(orgs);

    const { result } = renderHook(() => useFeaturedCharities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.charities).toHaveLength(2);
    // Hook transforms CharityOrganization into FeaturedCharity
    expect(result.current.charities[0].profileId).toBe("12-3456789");
    expect(result.current.charities[0].name).toBe("Charity 12-3456789");
    expect(result.current.charities[0].category).toBe("Arts & Culture");
    expect(result.current.charities[0].location).toBe("Boston, MA");
    expect(result.current.error).toBeNull();
  });

  it("sets error when fetch rejects", async () => {
    mockGetFeatured.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useFeaturedCharities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.charities).toHaveLength(0);
    expect(result.current.error).toBe("Failed to load featured charities");
  });

  it("returns empty array when no platform charities exist", async () => {
    mockGetFeatured.mockResolvedValue([]);

    const { result } = renderHook(() => useFeaturedCharities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.charities).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
});
