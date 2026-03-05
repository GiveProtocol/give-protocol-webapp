/**
 * Shared CSV utility functions
 * Provides common CSV conversion and download functionality
 */

/**
 * Converts data to CSV format
 * @param data Array of objects to convert
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const headerRow = headers.join(",");

  const rows = data.map((row) => {
    return headers
      .map((header) => {
        // Handle values that might contain commas, quotes, or objects
        const raw = row[header];
        let value: string;
        if (raw === null || raw === undefined) {
          value = "";
        } else if (typeof raw === "object") {
          value = JSON.stringify(raw);
        } else {
          value = String(raw);
        }
        const escaped = value.replaceAll('"', '""');
        return `"${escaped}"`;
      })
      .join(",");
  });

  return [headerRow, ...rows].join("\n");
}

/**
 * Downloads data as a CSV file
 * @param data CSV string
 * @param filename Filename for the downloaded file
 */
export function downloadCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
