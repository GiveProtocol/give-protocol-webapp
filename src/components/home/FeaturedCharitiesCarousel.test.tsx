import React from "react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { CharityOrganization } from "@/types/charityOrganization";

// useFeaturedCharities and CharityOrganizationCard are mocked via moduleNameMapper (ESM-compatible)
import { useFeaturedCharities } from "@/hooks/useFeaturedCharities";
import { FeaturedCharitiesCarousel } from "./FeaturedCharitiesCarousel";

const mockUseFeaturedCharities = useFeaturedCharities as jest.MockedFunction<
  typeof useFeaturedCharities
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

describe("FeaturedCharitiesCarousel", () => {
  beforeEach(() => {
    mockUseFeaturedCharities.mockReset();
  });

  it("shows loading spinner while loading", () => {
    mockUseFeaturedCharities.mockReturnValue({
      charities: [],
      loading: true,
      error: null,
    });

    render(<FeaturedCharitiesCarousel />);

    expect(screen.getByTestId("loading-spinner")).toBeDefined();
  });

  it("renders a card for each featured charity", () => {
    const orgs = [makeOrg("12-3456789"), makeOrg("98-7654321")];
    mockUseFeaturedCharities.mockReturnValue({
      charities: orgs,
      loading: false,
      error: null,
    });

    render(<FeaturedCharitiesCarousel />);

    const cards = screen.getAllByTestId("charity-card");
    expect(cards).toHaveLength(2);
    expect(screen.getByText("Charity 12-3456789")).toBeDefined();
    expect(screen.getByText("Charity 98-7654321")).toBeDefined();
  });

  it("shows empty state when no platform charities exist", () => {
    mockUseFeaturedCharities.mockReturnValue({
      charities: [],
      loading: false,
      error: null,
    });

    render(<FeaturedCharitiesCarousel />);

    expect(
      screen.getByText("No featured charities available yet."),
    ).toBeDefined();
  });

  it("shows error message when fetch fails", () => {
    mockUseFeaturedCharities.mockReturnValue({
      charities: [],
      loading: false,
      error: "Failed to load featured charities",
    });

    render(<FeaturedCharitiesCarousel />);

    expect(screen.getByText("Failed to load featured charities")).toBeDefined();
  });
});
