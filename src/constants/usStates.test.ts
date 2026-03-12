import { describe, it, expect } from "@jest/globals";
import { US_STATES } from "./usStates";

describe("US_STATES", () => {
  it("should contain 51 entries (50 states + DC)", () => {
    expect(US_STATES).toHaveLength(51);
  });

  it("should have code and name for each entry", () => {
    for (const state of US_STATES) {
      expect(state.code).toBeTruthy();
      expect(state.name).toBeTruthy();
    }
  });

  it("should be sorted alphabetically by name", () => {
    const names = US_STATES.map((s) => s.name);
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  it("should include known states", () => {
    const codes = US_STATES.map((s) => s.code);
    expect(codes).toContain("CA");
    expect(codes).toContain("NY");
    expect(codes).toContain("TX");
    expect(codes).toContain("DC");
  });
});
