// Helper to get environment variable with fallback to process.env for test environments
const getEnv = (key: string): string | undefined => {
  if (import.meta?.env) {
    return import.meta.env[key];
  }
  if (process?.env) {
    return process.env[key];
  }
  return undefined;
};

/**
 * Documentation site configuration for the Give Protocol application.
 * Reads the VITE_DOCS_URL environment variable with a fallback to the production docs URL.
 */
export const DOCS_CONFIG = {
  // URL for the Jekyll documentation site
  url: getEnv('VITE_DOCS_URL') || 'https://docs.giveprotocol.io',
};