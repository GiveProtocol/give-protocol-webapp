// Mock for @/lib/sentry module
// Provides no-op implementations of all Sentry helper functions

export function initSentry() {
  // No-op in tests
}

export function trackError(_error, _context) {
  // No-op in tests
}

export function trackEvent(_name, _data) {
  // No-op in tests
}

export function setUserContext(_user) {
  // No-op in tests
}

export function clearUserContext() {
  // No-op in tests
}

export function trackTransaction(_operation, _data) {
  return {
    finish: () => {
      // No-op in tests
    },
  };
}

export function captureCustomEvent(_message, _data, _level) {
  // No-op in tests
}

// Aliases for AuthContext compatibility
export const setSentryUser = setUserContext;
export const clearSentryUser = clearUserContext;
