import { Logger } from "@/utils/logger";

export const formatDate = (dateString: string, includeTime = false): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
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

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch (error) {
    return "";
  }
};

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
