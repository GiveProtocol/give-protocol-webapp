import { useMemo } from "react";
import type { LocationFilter } from "@/utils/locationResolver";

interface GeographicFilterParams {
  /** Single state code to pass to search RPC, or empty string if none. */
  filterState: string;
  /** Single country code to pass to search RPC, or empty string if none. */
  filterCountry: string;
  /** Whether any geographic filter is actively set. */
  hasGeoFilter: boolean;
}

/**
 * Derives single-value RPC filter params from array-based geographic filter state.
 * For HQ locations, picks the first state and first country found.
 * Impact locations are stored but not yet sent to backend (placeholder for future support).
 * @param hqLocations - Array of HQ location filters
 * @param impactLocations - Array of impact location filters
 * @returns Derived filter parameters for the search RPC
 */
export function useGeographicFilterParams(
  hqLocations: LocationFilter[],
  impactLocations: LocationFilter[],
): GeographicFilterParams {
  return useMemo(() => {
    const firstState = hqLocations.find((loc) => loc.type === "state");
    const firstCountry = hqLocations.find((loc) => loc.type === "country");

    return {
      filterState: firstState?.stateCode ?? "",
      filterCountry: firstCountry?.countryCode ?? "",
      hasGeoFilter: hqLocations.length > 0 || impactLocations.length > 0,
    };
  }, [hqLocations, impactLocations]);
}
