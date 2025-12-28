// Environment utility that works in both Vite and test environments
export const getEnv = () => {
  // Check if we're in a Vite environment via global access
  // Wrapped in try-catch in case import getter throws
  try {
    if (typeof globalThis !== "undefined" && globalThis.import?.meta?.env) {
      return globalThis.import.meta.env;
    }
  } catch {
    // globalThis.import access failed
  }

  // For Vite environments where import.meta is available, we'll try to access it
  // This avoids Jest parsing import.meta at compile time by using dynamic property access
  try {
    const globalImport = globalThis as unknown as {
      import?: { meta?: { env?: unknown } };
    };
    if (globalImport.import?.meta?.env) {
      return globalImport.import.meta.env;
    }
  } catch {
    // import.meta not available or failed to evaluate
  }

  // Fallback to process.env for Node/Jest environments
  if (typeof process !== "undefined" && process.env) {
    const mode = process.env.NODE_ENV || "development";
    return {
      PROD: mode === "production",
      DEV: mode === "development",
      MODE: mode,
      VITE_MONITORING_ENDPOINT: process.env.VITE_MONITORING_ENDPOINT,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_NETWORK: process.env.VITE_NETWORK,
    };
  }

  // Default fallback
  return {
    PROD: false,
    DEV: true,
    MODE: "development",
    VITE_MONITORING_ENDPOINT: undefined,
  };
};
