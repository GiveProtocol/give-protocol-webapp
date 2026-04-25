import { GENEROSITY_QUOTES } from "./generosityQuotes";
import type { GenerosityQuote } from "./generosityQuotes";

describe("GENEROSITY_QUOTES", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(GENEROSITY_QUOTES)).toBe(true);
    expect(GENEROSITY_QUOTES.length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = GENEROSITY_QUOTES.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each quote has the required fields", () => {
    GENEROSITY_QUOTES.forEach((q: GenerosityQuote) => {
      expect(typeof q.id).toBe("string");
      expect(q.id.length).toBeGreaterThan(0);
      expect(typeof q.text).toBe("string");
      expect(q.text.length).toBeGreaterThan(0);
      expect(typeof q.attribution).toBe("string");
      expect(q.attribution.length).toBeGreaterThan(0);
    });
  });
});
