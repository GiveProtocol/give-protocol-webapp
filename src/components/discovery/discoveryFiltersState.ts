import type { LocationFilter } from "@/utils/locationResolver";

export type DiscoveryViewMode = "charities" | "causes" | "portfolios";
export type DiscoveryFilterCategory = "impact" | "hq";

export interface DiscoveryFiltersState {
  viewMode: DiscoveryViewMode;
  searchTerm: string;
  activeCategory: DiscoveryFilterCategory;
  impactLocations: LocationFilter[];
  hqLocations: LocationFilter[];
  onPlatformOnly: boolean;
}

/** Empty filter state — useful as a default when wiring a new consumer. */
export const emptyDiscoveryFilters: DiscoveryFiltersState = {
  viewMode: "charities",
  searchTerm: "",
  activeCategory: "hq",
  impactLocations: [],
  hqLocations: [],
  onPlatformOnly: false,
};
