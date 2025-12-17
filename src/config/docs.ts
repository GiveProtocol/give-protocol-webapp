// Helper to get environment variable with fallback to process.env for test environments
const getEnv = (key: string): string | undefined => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return undefined;
};

// Documentation configuration
export const DOCS_CONFIG = {
  // URL for the Jekyll documentation site
  url: getEnv("VITE_DOCS_URL") || "https://docs.giveprotocol.io",
};
