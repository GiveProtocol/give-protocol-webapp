import { US_STATES } from "@/constants/usStates";

/** Represents a resolved geographic location filter. */
export interface LocationFilter {
  /** Unique identifier for keying React elements, e.g., "state:CA" or "country:US". */
  id: string;
  /** Human-readable display label, e.g., "California" or "United States". */
  displayLabel: string;
  /** The resolved type: "state", "country", or "region" (region = unresolved / future). */
  type: "state" | "country" | "region";
  /** For type "state": the two-letter state code. Null otherwise. */
  stateCode: string | null;
  /** For type "country": the two-letter country code. Null otherwise. */
  countryCode: string | null;
}

interface CountryEntry {
  code: string;
  name: string;
}

/** Countries with charity registries or likely user interest. */
const COUNTRIES: CountryEntry[] = [
  { code: "US", name: "United States" },
  { code: "MX", name: "Mexico" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
];

/**
 * Resolves a free-text location string into a structured LocationFilter.
 * Matches against US states first, then countries, falling back to a generic region.
 * @param input - The raw text entered by the user
 * @returns A resolved LocationFilter object
 */
export function resolveLocation(input: string): LocationFilter {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return {
      id: "region:",
      displayLabel: "",
      type: "region",
      stateCode: null,
      countryCode: null,
    };
  }

  const lower = trimmed.toLowerCase();

  // Match US states by code (exact, case-insensitive)
  const stateByCode = US_STATES.find(
    (s) => s.code.toLowerCase() === lower,
  );
  if (stateByCode) {
    return {
      id: `state:${stateByCode.code}`,
      displayLabel: stateByCode.name,
      type: "state",
      stateCode: stateByCode.code,
      countryCode: null,
    };
  }

  // Match US states by name (case-insensitive)
  const stateByName = US_STATES.find(
    (s) => s.name.toLowerCase() === lower,
  );
  if (stateByName) {
    return {
      id: `state:${stateByName.code}`,
      displayLabel: stateByName.name,
      type: "state",
      stateCode: stateByName.code,
      countryCode: null,
    };
  }

  // Match countries by code (exact, case-insensitive)
  const countryByCode = COUNTRIES.find(
    (c) => c.code.toLowerCase() === lower,
  );
  if (countryByCode) {
    return {
      id: `country:${countryByCode.code}`,
      displayLabel: countryByCode.name,
      type: "country",
      stateCode: null,
      countryCode: countryByCode.code,
    };
  }

  // Match countries by name (case-insensitive)
  const countryByName = COUNTRIES.find(
    (c) => c.name.toLowerCase() === lower,
  );
  if (countryByName) {
    return {
      id: `country:${countryByName.code}`,
      displayLabel: countryByName.name,
      type: "country",
      stateCode: null,
      countryCode: countryByName.code,
    };
  }

  // Fallback to region for unresolved text
  const slug = lower.replace(/\s+/g, "-");
  return {
    id: `region:${slug}`,
    displayLabel: trimmed,
    type: "region",
    stateCode: null,
    countryCode: null,
  };
}
