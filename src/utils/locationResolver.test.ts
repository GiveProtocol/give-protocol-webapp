import { describe, it, expect } from "@jest/globals";
import { resolveLocation } from "./locationResolver";

describe("resolveLocation", () => {
  describe("US state matching", () => {
    it("should resolve a state code to the full state name", () => {
      const result = resolveLocation("CA");
      expect(result).toEqual({
        id: "state:CA",
        displayLabel: "California",
        type: "state",
        stateCode: "CA",
        countryCode: null,
      });
    });

    it("should be case-insensitive for state codes", () => {
      const result = resolveLocation("ca");
      expect(result.type).toBe("state");
      expect(result.stateCode).toBe("CA");
      expect(result.displayLabel).toBe("California");
    });

    it("should resolve a full state name", () => {
      const result = resolveLocation("California");
      expect(result).toEqual({
        id: "state:CA",
        displayLabel: "California",
        type: "state",
        stateCode: "CA",
        countryCode: null,
      });
    });

    it("should be case-insensitive for state names", () => {
      const result = resolveLocation("new york");
      expect(result.type).toBe("state");
      expect(result.stateCode).toBe("NY");
      expect(result.displayLabel).toBe("New York");
    });

    it("should resolve District of Columbia", () => {
      const result = resolveLocation("DC");
      expect(result.type).toBe("state");
      expect(result.stateCode).toBe("DC");
    });
  });

  describe("country matching", () => {
    it("should resolve a country code", () => {
      const result = resolveLocation("US");
      expect(result).toEqual({
        id: "country:US",
        displayLabel: "United States",
        type: "country",
        stateCode: null,
        countryCode: "US",
      });
    });

    it("should resolve a country name", () => {
      const result = resolveLocation("United States");
      expect(result.type).toBe("country");
      expect(result.countryCode).toBe("US");
    });

    it("should be case-insensitive for country codes", () => {
      const result = resolveLocation("mx");
      expect(result.type).toBe("country");
      expect(result.countryCode).toBe("MX");
      expect(result.displayLabel).toBe("Mexico");
    });

    it("should resolve United Kingdom", () => {
      const result = resolveLocation("united kingdom");
      expect(result.type).toBe("country");
      expect(result.countryCode).toBe("GB");
    });

    it("should resolve Mexico", () => {
      const result = resolveLocation("Mexico");
      expect(result.type).toBe("country");
      expect(result.countryCode).toBe("MX");
    });
  });

  describe("state vs country disambiguation", () => {
    it('should resolve "IN" as state Indiana (state takes priority)', () => {
      const result = resolveLocation("IN");
      expect(result.type).toBe("state");
      expect(result.stateCode).toBe("IN");
      expect(result.displayLabel).toBe("Indiana");
    });
  });

  describe("region fallback", () => {
    it("should fall back to region for unrecognized text", () => {
      const result = resolveLocation("SE Asia");
      expect(result).toEqual({
        id: "region:se-asia",
        displayLabel: "SE Asia",
        type: "region",
        stateCode: null,
        countryCode: null,
      });
    });

    it("should slugify the region id", () => {
      const result = resolveLocation("Sub Saharan Africa");
      expect(result.id).toBe("region:sub-saharan-africa");
      expect(result.displayLabel).toBe("Sub Saharan Africa");
    });

    it("should handle arbitrary text as region", () => {
      const result = resolveLocation("Middle East");
      expect(result.type).toBe("region");
      expect(result.stateCode).toBeNull();
      expect(result.countryCode).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = resolveLocation("");
      expect(result.type).toBe("region");
      expect(result.displayLabel).toBe("");
    });

    it("should trim whitespace", () => {
      const result = resolveLocation("  CA  ");
      expect(result.type).toBe("state");
      expect(result.stateCode).toBe("CA");
    });

    it("should handle whitespace-only input", () => {
      const result = resolveLocation("   ");
      expect(result.type).toBe("region");
      expect(result.displayLabel).toBe("");
    });
  });
});
