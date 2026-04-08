import { Logger } from "@/utils/logger";

/**
 * Formats a date string into a human-readable format.
 * @param dateString - ISO date string to format
 * @param includeTime - Whether to include time in the output (HH:MM UTC)
 * @returns Formatted date string, or empty string if invalid
 */
export const formatDate = (dateString: string, includeTime = false): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    if (includeTime) {
      // Format as DDMMMYYYY HH:MM UTC
      const day = date.getUTCDate().toString().padStart(2, "0");
      const month = date.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const year = date.getUTCFullYear().toString();
      const hours = date.getUTCHours().toString().padStart(2, "0");
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");

      return `${day}${month}${year} ${hours}:${minutes} UTC`;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    Logger.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Checks whether a date string represents a valid date.
 * @param dateString - Date string to validate
 * @returns True if the string parses to a valid date, false otherwise
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !Number.isNaN(date.getTime());
};

/**
 * Formats a date string into YYYY-MM-DD format suitable for HTML date inputs.
 * @param dateString - ISO date string to format
 * @returns Date string in YYYY-MM-DD format, or empty string if invalid
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch (error) {
    return "";
  }
};

/**
 * Computes a start and end Date pair for a named time period relative to now.
 * @param period - One of "week", "month", "quarter", "year", or any other string for all-time
 * @returns Object containing start and end Date instances
 */
export const getDateRange = (period: string): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "week":
      start.setDate(end.getDate() - 7);
      break;
    case "month":
      start.setMonth(end.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(end.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setFullYear(end.getFullYear() - 100); // All time
  }

  return { start, end };
};
