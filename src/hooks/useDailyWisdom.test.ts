import { describe, it, expect } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useDailyWisdom } from "./useDailyWisdom";
import { GENEROSITY_QUOTES } from "@/data/generosityQuotes";

describe("useDailyWisdom", () => {
  it("returns a quote from the GENEROSITY_QUOTES array", () => {
    const { result } = renderHook(() => useDailyWisdom());
    expect(GENEROSITY_QUOTES).toContainEqual(result.current);
  });

  it("returns the same quote for the same date", () => {
    const date = new Date("2026-03-15T12:00:00Z");
    const { result: r1 } = renderHook(() => useDailyWisdom(date));
    const { result: r2 } = renderHook(() => useDailyWisdom(date));
    expect(r1.current).toEqual(r2.current);
  });

  it("returns a different quote for different days (most of the time)", () => {
    const day1 = new Date("2026-01-01T00:00:00Z");
    const day2 = new Date("2026-01-02T00:00:00Z");
    const { result: r1 } = renderHook(() => useDailyWisdom(day1));
    const { result: r2 } = renderHook(() => useDailyWisdom(day2));
    // Different days should produce different indices (mod length), so different quotes
    expect(r1.current.id).not.toBe(r2.current.id);
  });

  it("wraps around without error when day-of-year exceeds quote count", () => {
    // Dec 31 is day 365 which is > 30 quotes
    const lateYear = new Date("2026-12-31T00:00:00Z");
    const { result } = renderHook(() => useDailyWisdom(lateYear));
    expect(result.current).toBeDefined();
    expect(typeof result.current.text).toBe("string");
  });
});
