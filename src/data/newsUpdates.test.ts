import { describe, it, expect } from "@jest/globals";
import { NEWS_UPDATES } from "./newsUpdates";

describe("NEWS_UPDATES", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(NEWS_UPDATES)).toBe(true);
    expect(NEWS_UPDATES.length).toBeGreaterThan(0);
  });

  it("each update has the required shape", () => {
    for (const update of NEWS_UPDATES) {
      expect(typeof update.id).toBe("string");
      expect(typeof update.title).toBe("string");
      expect(typeof update.excerpt).toBe("string");
      expect(typeof update.url).toBe("string");
      expect(typeof update.publishedAt).toBe("string");
    }
  });
});
