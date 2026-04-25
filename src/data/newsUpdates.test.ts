import { NEWS_UPDATES } from "./newsUpdates";
import type { NewsUpdate } from "./newsUpdates";

describe("NEWS_UPDATES", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(NEWS_UPDATES)).toBe(true);
    expect(NEWS_UPDATES.length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = NEWS_UPDATES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each update has the required fields", () => {
    NEWS_UPDATES.forEach((n: NewsUpdate) => {
      expect(typeof n.id).toBe("string");
      expect(typeof n.title).toBe("string");
      expect(n.title.length).toBeGreaterThan(0);
      expect(typeof n.excerpt).toBe("string");
      expect(typeof n.url).toBe("string");
      expect(typeof n.publishedAt).toBe("string");
    });
  });

  it("publishedAt values are valid ISO date strings", () => {
    NEWS_UPDATES.forEach((n) => {
      const date = new Date(n.publishedAt);
      expect(Number.isNaN(date.getTime())).toBe(false);
    });
  });
});
