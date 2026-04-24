import { useMemo } from "react";
import {
  GENEROSITY_QUOTES,
  type GenerosityQuote,
} from "@/data/generosityQuotes";

/**
 * Selects a quote deterministically based on the current day so the same quote appears
 * on every reload within a day.
 */
export function useDailyWisdom(today: Date = new Date()): GenerosityQuote {
  return useMemo(() => {
    const start = Date.UTC(today.getUTCFullYear(), 0, 0);
    const diff = today.getTime() - start;
    const dayOfYear = Math.floor(diff / 86_400_000);
    const index =
      ((dayOfYear % GENEROSITY_QUOTES.length) + GENEROSITY_QUOTES.length) %
      GENEROSITY_QUOTES.length;
    return GENEROSITY_QUOTES[index];
  }, [today]);
}
