// Parse string array
const parseStringArray = (value: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim());
  }
  return [];
};

// Helper to get environment variable with fallback to process.env for test environments
const getEnv = (key: string): string | undefined => {
  // Check if import.meta.env is available (Vite runtime)
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key];
  }
  // Fallback to process.env for test environments
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return undefined;
};

// Create and validate environment configuration
export const ENV = {
  // Required variables
  SUPABASE_URL: getEnv("VITE_SUPABASE_URL"),
  SUPABASE_ANON_KEY: getEnv("VITE_SUPABASE_ANON_KEY"),
  APP_DOMAIN: getEnv("VITE_APP_DOMAIN") || "localhost",

  // Contract addresses
  DONATION_CONTRACT_ADDRESS: getEnv("VITE_DONATION_CONTRACT_ADDRESS"),
  TOKEN_CONTRACT_ADDRESS: getEnv("VITE_TOKEN_CONTRACT_ADDRESS"),
  VERIFICATION_CONTRACT_ADDRESS: getEnv("VITE_VERIFICATION_CONTRACT_ADDRESS"),
  DISTRIBUTION_CONTRACT_ADDRESS: getEnv("VITE_DISTRIBUTION_CONTRACT_ADDRESS"),
  PORTFOLIO_FUNDS_CONTRACT_ADDRESS: getEnv(
    "VITE_PORTFOLIO_FUNDS_CONTRACT_ADDRESS",
  ),
  EXECUTOR_CONTRACT_ADDRESS: getEnv("VITE_EXECUTOR_CONTRACT_ADDRESS"),

  // Optional variables with defaults
  NETWORK: getEnv("VITE_NETWORK") || "moonbase",
  NETWORK_ENDPOINT:
    getEnv("VITE_NETWORK_ENDPOINT") ||
    "wss://wss.api.moonbase.moonbeam.network",

  // Feature flags
  ENABLE_GOOGLE_AUTH: getEnv("VITE_ENABLE_GOOGLE_AUTH") === "true",
  ENABLE_MAGIC_LINKS: getEnv("VITE_ENABLE_MAGIC_LINKS") === "true",
  SHOW_TESTNETS: getEnv("VITE_SHOW_TESTNETS") === "true",

  // Security settings
  MAX_LOGIN_ATTEMPTS: Number(getEnv("VITE_MAX_LOGIN_ATTEMPTS") || 5),
  LOGIN_COOLDOWN_MINUTES: Number(getEnv("VITE_LOGIN_COOLDOWN_MINUTES") || 15),

  // Performance settings
  CACHE_TTL_MINUTES: Number(getEnv("VITE_CACHE_TTL_MINUTES") || 5),
  API_TIMEOUT_MS: Number(getEnv("VITE_API_TIMEOUT_MS") || 10000),

  // Analytics settings
  ENABLE_ANALYTICS: getEnv("VITE_ENABLE_ANALYTICS") === "true",
  ANALYTICS_SAMPLE_RATE: Number(getEnv("VITE_ANALYTICS_SAMPLE_RATE") || 0.1),

  // Monitoring settings
  MONITORING_API_KEY: getEnv("VITE_MONITORING_API_KEY") || "",
  MONITORING_APP_ID: getEnv("VITE_MONITORING_APP_ID") || "",
  MONITORING_ENVIRONMENT:
    getEnv("VITE_MONITORING_ENVIRONMENT") || "development",
  MONITORING_ENABLED_MONITORS: parseStringArray(
    getEnv("VITE_MONITORING_ENABLED_MONITORS") ||
      "webVital,error,resource,navigation,paint,api,custom,userAction",
  ),
} as const;

// Validate required environment variables
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.error("Missing required Supabase environment variables:", {
    SUPABASE_URL: ENV.SUPABASE_URL ? "defined" : "undefined",
    SUPABASE_ANON_KEY: ENV.SUPABASE_ANON_KEY ? "defined" : "undefined",
  });
}

// Validate contract addresses
if (!ENV.DONATION_CONTRACT_ADDRESS) {
  console.warn(
    "Donation contract address not found in environment variables. Using development address.",
  );
  // skipcq: SCT-A000 - This is a placeholder development Ethereum address, not a real secret
  ENV.DONATION_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";
}

if (!ENV.VERIFICATION_CONTRACT_ADDRESS) {
  console.warn(
    "Verification contract address not found in environment variables. Using development address.",
  );
  // skipcq: SCT-A000 - This is a placeholder development Ethereum address, not a real secret
  ENV.VERIFICATION_CONTRACT_ADDRESS =
    "0x2345678901234567890123456789012345678901";
}

if (
  !ENV.DISTRIBUTION_CONTRACT_ADDRESS ||
  ENV.DISTRIBUTION_CONTRACT_ADDRESS ===
    "0x0000000000000000000000000000000000000000"
) {
  console.warn(
    "Distribution contract address not found or invalid in environment variables. Using development address.",
  );
  // skipcq: SCT-A000 - This is a placeholder development Ethereum address, not a real secret
  ENV.DISTRIBUTION_CONTRACT_ADDRESS =
    "0x3456789012345678901234567890123456789012";
}

if (!ENV.TOKEN_CONTRACT_ADDRESS) {
  console.warn(
    "Token contract address not found in environment variables. Using development address.",
  );
  // skipcq: SCT-A000 - This is a placeholder development Ethereum address, not a real secret
  ENV.TOKEN_CONTRACT_ADDRESS = "0x4567890123456789012345678901234567890123";
}

if (
  !ENV.PORTFOLIO_FUNDS_CONTRACT_ADDRESS ||
  ENV.PORTFOLIO_FUNDS_CONTRACT_ADDRESS ===
    "0x0000000000000000000000000000000000000000"
) {
  console.warn(
    "Portfolio Funds contract address not found or invalid in environment variables. Using development address.",
  );
  // skipcq: SCT-A000 - This is a placeholder development Ethereum address, not a real secret
  ENV.PORTFOLIO_FUNDS_CONTRACT_ADDRESS =
    "0x5678901234567890123456789012345678901234";
}

export type EnvVars = typeof ENV;
