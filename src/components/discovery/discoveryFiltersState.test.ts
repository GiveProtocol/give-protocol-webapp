import { emptyDiscoveryFilters } from "./discoveryFiltersState";
import type {
  DiscoveryFiltersState,
  DiscoveryViewMode,
  DiscoveryFilterCategory,
} from "./discoveryFiltersState";

describe("discoveryFiltersState", () => {
  it("exports emptyDiscoveryFilters with correct defaults", () => {
    const f: DiscoveryFiltersState = emptyDiscoveryFilters;
    expect(f.viewMode).toBe("charities");
    expect(f.searchTerm).toBe("");
    expect(f.activeCategory).toBe("hq");
    expect(f.impactLocations).toEqual([]);
    expect(f.hqLocations).toEqual([]);
    expect(f.onPlatformOnly).toBe(false);
  });

  it("DiscoveryViewMode accepts valid values", () => {
    const modes: DiscoveryViewMode[] = ["charities", "causes", "portfolios"];
    expect(modes).toHaveLength(3);
  });

  it("DiscoveryFilterCategory accepts valid values", () => {
    const cats: DiscoveryFilterCategory[] = ["impact", "hq"];
    expect(cats).toHaveLength(2);
  });
});
