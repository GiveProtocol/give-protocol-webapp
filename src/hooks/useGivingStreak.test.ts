import { describe, it, expect } from "@jest/globals";
import { computeGivingStreak } from "./useGivingStreak";

function iso(year: number, monthIndex: number, day = 15): string {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString();
}

describe("computeGivingStreak", () => {
  const reference = new Date(Date.UTC(2026, 3, 22));

  it("returns 0 when there are no donations", () => {
    expect(computeGivingStreak([], reference)).toBe(0);
  });

  it("returns 1 when only the current month has a donation", () => {
    const donations = [{ date: iso(2026, 3) }];
    expect(computeGivingStreak(donations, reference)).toBe(1);
  });

  it("counts consecutive prior months ending at the reference month", () => {
    const donations = [
      { date: iso(2026, 3) },
      { date: iso(2026, 2) },
      { date: iso(2026, 1) },
    ];
    expect(computeGivingStreak(donations, reference)).toBe(3);
  });

  it("stops counting at the first month gap", () => {
    const donations = [
      { date: iso(2026, 3) },
      { date: iso(2026, 2) },
      { date: iso(2025, 11) },
    ];
    expect(computeGivingStreak(donations, reference)).toBe(2);
  });

  it("returns 0 when the reference month has no donation even if prior months do", () => {
    const donations = [{ date: iso(2026, 2) }, { date: iso(2026, 1) }];
    expect(computeGivingStreak(donations, reference)).toBe(0);
  });

  it("ignores invalid dates", () => {
    const donations = [
      { date: iso(2026, 3) },
      { date: "not-a-date" },
      { date: iso(2026, 2) },
    ];
    expect(computeGivingStreak(donations, reference)).toBe(2);
  });

  it("crosses year boundaries", () => {
    const reference2 = new Date(Date.UTC(2026, 0, 10));
    const donations = [
      { date: iso(2026, 0) },
      { date: iso(2025, 11) },
      { date: iso(2025, 10) },
    ];
    expect(computeGivingStreak(donations, reference2)).toBe(3);
  });
});
