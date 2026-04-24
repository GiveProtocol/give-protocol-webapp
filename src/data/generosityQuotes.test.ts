import { describe, it, expect } from "@jest/globals";
import { GENEROSITY_QUOTES } from "./generosityQuotes";

describe("GENEROSITY_QUOTES", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(GENEROSITY_QUOTES)).toBe(true);
    expect(GENEROSITY_QUOTES.length).toBeGreaterThan(0);
  });

  it("each quote has the required shape", () => {
    for (const quote of GENEROSITY_QUOTES) {
      expect(typeof quote.id).toBe("string");
      expect(typeof quote.text).toBe("string");
      expect(typeof quote.attribution).toBe("string");
    }
  });
});
