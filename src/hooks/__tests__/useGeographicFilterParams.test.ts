import { describe, it, expect } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useGeographicFilterParams } from "../useGeographicFilterParams";
import type { LocationFilter } from "@/utils/locationResolver";

function makeState(code: string, name: string): LocationFilter {
  return {
    id: `state:${code}`,
    displayLabel: name,
    type: "state",
    stateCode: code,
    countryCode: null,
  };
}

function makeCountry(code: string, name: string): LocationFilter {
  return {
    id: `country:${code}`,
    displayLabel: name,
    type: "country",
    stateCode: null,
    countryCode: code,
  };
}

function makeRegion(label: string): LocationFilter {
  return {
    id: `region:${label.toLowerCase().replace(/\s+/g, "-")}`,
    displayLabel: label,
    type: "region",
    stateCode: null,
    countryCode: null,
  };
}

describe("useGeographicFilterParams", () => {
  it("should return empty params for empty arrays", () => {
    const { result } = renderHook(() =>
      useGeographicFilterParams([], []),
    );
    expect(result.current).toEqual({
      filterState: "",
      filterCountry: "",
      hasGeoFilter: false,
    });
  });

  it("should extract filterState from first HQ state entry", () => {
    const hq = [makeState("CA", "California")];
    const { result } = renderHook(() =>
      useGeographicFilterParams(hq, []),
    );
    expect(result.current.filterState).toBe("CA");
    expect(result.current.filterCountry).toBe("");
    expect(result.current.hasGeoFilter).toBe(true);
  });

  it("should extract filterCountry from first HQ country entry", () => {
    const hq = [makeCountry("US", "United States")];
    const { result } = renderHook(() =>
      useGeographicFilterParams(hq, []),
    );
    expect(result.current.filterState).toBe("");
    expect(result.current.filterCountry).toBe("US");
  });

  it("should extract both state and country from mixed HQ entries", () => {
    const hq = [
      makeState("NY", "New York"),
      makeCountry("US", "United States"),
    ];
    const { result } = renderHook(() =>
      useGeographicFilterParams(hq, []),
    );
    expect(result.current.filterState).toBe("NY");
    expect(result.current.filterCountry).toBe("US");
  });

  it("should use the first state when multiple states exist", () => {
    const hq = [
      makeState("CA", "California"),
      makeState("NY", "New York"),
    ];
    const { result } = renderHook(() =>
      useGeographicFilterParams(hq, []),
    );
    expect(result.current.filterState).toBe("CA");
  });

  it("should set hasGeoFilter true for impact-only locations", () => {
    const impact = [makeRegion("SE Asia")];
    const { result } = renderHook(() =>
      useGeographicFilterParams([], impact),
    );
    expect(result.current.filterState).toBe("");
    expect(result.current.filterCountry).toBe("");
    expect(result.current.hasGeoFilter).toBe(true);
  });

  it("should ignore region-type HQ entries for RPC params", () => {
    const hq = [makeRegion("Middle East")];
    const { result } = renderHook(() =>
      useGeographicFilterParams(hq, []),
    );
    expect(result.current.filterState).toBe("");
    expect(result.current.filterCountry).toBe("");
    expect(result.current.hasGeoFilter).toBe(true);
  });
});
