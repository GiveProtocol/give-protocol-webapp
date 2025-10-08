import * as Sentry from "@sentry/react";

export function initSentry() {
  // Only initialize Sentry in production
  if (!import.meta.env.PROD) {
    console.log("Sentry: Skipping initialization in development");
    return;
  }

  // Check if DSN is configured
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.warn("Sentry: No DSN configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || "1.0.0",

    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions

    // Session replay for debugging
    replaysSessionSampleRate: 0.01, // 1% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask sensitive data in replays
        maskAllText: false,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],

    // Filter out noise and sensitive data
    beforeSend(event) {
      // Filter out browser extension errors
      if (
        event.exception?.values?.[0]?.stacktrace?.frames?.some((frame) =>
          frame.filename?.includes("extension://"),
        )
      ) {
        return null;
      }

      // Filter out user cancellation errors (wallet rejections, etc.)
      if (
        event.exception?.values?.[0]?.value?.includes("User rejected") ||
        event.exception?.values?.[0]?.value?.includes("User denied")
      ) {
        return null;
      }

      // Filter out ResizeObserver warnings
      if (event.exception?.values?.[0]?.value?.includes("ResizeObserver")) {
        return null;
      }

      return event;
    },

    // Filter sensitive data from transactions
    beforeSendTransaction(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.Cookie;
        delete event.request.headers["X-API-Key"];
      }

      return event;
    },
  });

  console.log("Sentry: Initialized successfully");
}

// Helper functions for custom tracking
export function trackError(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext("custom", context);
      }
      Sentry.captureException(error);
    });
  } else {
    console.error("Error tracked:", error, context);
  }
}

/**
 * Tracks a custom event with optional data as a breadcrumb in Sentry.
 * Only sends data in production environment.
 *
 * @function trackEvent
 * @param {string} name - The event name
 * @param {Record<string, unknown>} [data] - Optional event data
 * @returns {void}
 * @example
 * ```typescript
 * trackEvent('user_action', {
 *   action: 'button_click',
 *   component: 'navbar',
 *   timestamp: Date.now()
 * });
 * ```
 */
export function trackEvent(name: string, data?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      message: name,
      data,
      level: "info",
    });
  } else {
    console.log("Event tracked:", name, data);
  }
}

/**
 * Sets the current user context in Sentry for error tracking.
 * Only active in production environment.
 *
 * @function setUserContext
 * @param {object} user - The user context object
 * @param {string} user.id - The user's unique identifier
 * @param {string} [user.email] - The user's email address
 * @param {string} [user.type] - The user's account type (donor/charity)
 * @returns {void}
 * @example
 * ```typescript
 * setUserContext({
 *   id: 'user-123',
 *   email: 'user@example.com',
 *   type: 'donor'
 * });
 * ```
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  type?: string;
}) {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      type: user.type,
    });
  }
}

/**
 * Clears the current user context from Sentry.
 * Only active in production environment.
 *
 * @function clearUserContext
 * @returns {void}
 * @example
 * ```typescript
 * clearUserContext(); // Called during logout
 * ```
 */
export function clearUserContext() {
  if (import.meta.env.PROD) {
    Sentry.setUser(null);
  }
}

// Transaction tracking for Web3 operations
export function trackTransaction(
  operation: string,
  data?: {
    transactionHash?: string;
    amount?: string;
    token?: string;
    charity?: string;
    status?: "pending" | "success" | "failed";
    error?: string;
  },
) {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      message: `Transaction: ${operation}`,
      data,
      level: data?.status === "failed" ? "error" : "info",
      category: "transaction",
    });

    // If transaction failed, also capture as an exception
    if (data?.status === "failed" && data?.error) {
      Sentry.captureException(
        new Error(`Transaction failed: ${operation} - ${data.error}`),
      );
    }
  } else {
    console.log(`Transaction tracked: ${operation}`, data);
  }
}

// Custom event capture for testing and debugging
export function captureCustomEvent(
  message: string,
  data?: Record<string, unknown>,
  level: "info" | "warning" | "error" = "info",
) {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level);

    if (data) {
      Sentry.addBreadcrumb({
        message,
        data,
        level,
        category: "custom",
      });
    }
  } else {
    console.log(`Custom event: ${message}`, { level, data });
  }
}

// Aliases for AuthContext compatibility
export const setSentryUser = setUserContext;
export const clearSentryUser = clearUserContext;
