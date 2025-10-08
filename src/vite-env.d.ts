/// <reference types="vite/client" />
/* eslint-disable no-unused-vars */

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (_args: { method: string; params?: unknown[] }) => Promise<unknown>; // Prefixed as unused
    on: (_event: string, _callback: (..._args: unknown[]) => void) => void; // Prefixed as unused
    removeListener: (_event: string, _callback: (..._args: unknown[]) => void) => void; // Prefixed as unused
    removeAllListeners: (_event: string) => void; // Prefixed as unused
    disconnect?: () => Promise<void>;
  };
  SubWallet?: {
    request: (_args: { method: string; params?: unknown[] }) => Promise<unknown>; // Prefixed as unused
    on: (_event: string, _callback: (..._args: unknown[]) => void) => void; // Prefixed as unused
    removeListener: (_event: string, _callback: (..._args: unknown[]) => void) => void; // Prefixed as unused
    removeAllListeners: (_event: string) => void; // Prefixed as unused
    disconnect?: () => Promise<void>;
  };
  talismanEth?: {
    request: (_args: { method: string; params?: unknown[] }) => Promise<unknown>; // Prefixed as unused
    on: (_event: string, _callback: (..._args: unknown[]) => void) => void; // Prefixed as unused
    removeListener: (_event: string, _callback: (..._args: unknown[]) => void) => void; // Prefixed as unused
    removeAllListeners: (_event: string) => void; // Prefixed as unused
    disconnect?: () => Promise<void>;
  };
  nova?: {
    request: (_args: { method: string; params?: unknown[] }) => Promise<unknown>; // Prefixed as unused
    on: (_event: string, _callback: (..._args: unknown[]) => void) => void; // Prefixed as unused
    removeListener: (_event: string, _callback: (..._args: unknown[]) => void) => void; // Prefixed as unused
    removeAllListeners: (_event: string) => void; // Prefixed as unused
    disconnect?: () => Promise<void>;
  };
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_DOMAIN: string;
  readonly VITE_DONATION_CONTRACT_ADDRESS: string;
  readonly VITE_TOKEN_CONTRACT_ADDRESS: string;
  readonly VITE_VERIFICATION_CONTRACT_ADDRESS: string;
  readonly VITE_DISTRIBUTION_CONTRACT_ADDRESS: string;
  readonly VITE_NETWORK: string;
  readonly VITE_NETWORK_ENDPOINT: string;
  readonly VITE_ENABLE_GOOGLE_AUTH: string;
  readonly VITE_ENABLE_MAGIC_LINKS: string;
  readonly VITE_MAX_LOGIN_ATTEMPTS: string;
  readonly VITE_LOGIN_COOLDOWN_MINUTES: string;
  readonly VITE_CACHE_TTL_MINUTES: string;
  readonly VITE_API_TIMEOUT_MS: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ANALYTICS_SAMPLE_RATE: string;
  readonly VITE_MONITORING_API_KEY?: string;
  readonly VITE_MONITORING_APP_ID?: string;
  readonly VITE_MONITORING_ENVIRONMENT?: string;
  readonly VITE_MONITORING_ENABLED_MONITORS?: string;
  readonly VITE_MONITORING_ENDPOINT?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_MOONBASE_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}