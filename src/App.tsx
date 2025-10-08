import React, { useCallback } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Web3Provider } from "./contexts/Web3Context";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AppRoutes } from "./routes";
import { Layout } from "./components/layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MonitoringService } from "./utils/monitoring";
import { ENV } from "./config/env";

// Initialize monitoring if enabled
if (ENV.MONITORING_API_KEY && ENV.MONITORING_APP_ID) {
  MonitoringService.getInstance({
    apiKey: ENV.MONITORING_API_KEY,
    appId: ENV.MONITORING_APP_ID,
    environment: ENV.MONITORING_ENVIRONMENT,
    enabledMonitors: ENV.MONITORING_ENABLED_MONITORS,
  });
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Core context providers
const CoreProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>{children}</ToastProvider>
  </QueryClientProvider>
);

// Auth and Web3 providers
const AuthWeb3Providers = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <SettingsProvider>
      <Web3Provider>{children}</Web3Provider>
    </SettingsProvider>
  </AuthProvider>
);

// Combined providers component
const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <CoreProviders>
    <AuthWeb3Providers>{children}</AuthWeb3Providers>
  </CoreProviders>
);

// Router wrapper component
const AppRouter = () => (
  <BrowserRouter future={{ v7_relativeSplatPath: true }}>
    <Layout>
      <AppRoutes />
    </Layout>
  </BrowserRouter>
);

/**
 * Main application component that sets up all providers, routing, and error boundaries.
 * Initializes monitoring, React Query, authentication, Web3, and global error handling.
 *
 * @function App
 * @returns {JSX.Element} The complete application with all providers and routing
 * @example
 * ```typescript
 * // App entry point in main.tsx
 * import App from './App';
 *
 * createRoot(document.getElementById('root')!).render(
 *   <React.StrictMode>
 *     <App />
 *   </React.StrictMode>
 * );
 * ```
 */
function App() {
  const sentryFallback = useCallback(
    ({ error, resetError }: { error: Error; resetError: () => void }) => (
      <ErrorBoundary fallback={null}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={resetError}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </ErrorBoundary>
    ),
    [],
  );

  return (
    <Sentry.ErrorBoundary fallback={sentryFallback} showDialog={false}>
      <ErrorBoundary>
        <AppProviders>
          <AppRouter />
        </AppProviders>
      </ErrorBoundary>
    </Sentry.ErrorBoundary>
  );
}

export default App;
