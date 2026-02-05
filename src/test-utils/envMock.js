// Mock for @/config/env module
// This provides the ENV object that would normally come from import.meta.env

export const ENV = {
  SUPABASE_URL: "https://mock-supabase-url.supabase.co",
  SUPABASE_ANON_KEY: "mock-supabase-anon-key",
  APP_DOMAIN: "localhost",
  NETWORK: "moonbase",
  NETWORK_ENDPOINT: "wss://wss.api.moonbase.moonbeam.network",
  ENABLE_GOOGLE_AUTH: false,
  ENABLE_MAGIC_LINKS: false,
  SHOW_TESTNETS: true,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_COOLDOWN_MINUTES: 15,
  CACHE_TTL_MINUTES: 5,
  API_TIMEOUT_MS: 10000,
  ENABLE_ANALYTICS: false,
  ANALYTICS_SAMPLE_RATE: 0.1,
  MONITORING_API_KEY: "",
  MONITORING_APP_ID: "",
  MONITORING_ENVIRONMENT: "test",
  MONITORING_ENABLED_MONITORS: [
    "webVital",
    "error",
    "resource",
    "navigation",
    "paint",
    "api",
    "custom",
    "userAction",
  ],
};

/**
 * Get contract addresses for a specific chain from environment variables.
 * Test mock returns undefined addresses (tests use dev fallback).
 * @param {number} _chainId - The chain ID
 * @returns {object} Contract addresses for the chain
 */
export function getChainContractAddresses(_chainId) {
  return {
    DONATION: undefined,
    VERIFICATION: undefined,
    DISTRIBUTION: undefined,
    PORTFOLIO_FUNDS: undefined,
    EXECUTOR: undefined,
    TOKEN: undefined,
  };
}
