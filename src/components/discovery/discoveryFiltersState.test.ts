import { describe, it, expect } from "@jest/globals";
import { emptyDiscoveryFilters } from "./discoveryFiltersState";

describe("emptyDiscoveryFilters", () => {
  it("exports the expected default filter state", () => {
    expect(emptyDiscoveryFilters).toEqual({
      viewMode: "charities",
      searchTerm: "",
      activeCategory: "hq",
      impactLocations: [],
      hqLocations: [],
      onPlatformOnly: false,
    });
  });
});
