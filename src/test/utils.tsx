import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { Web3Provider } from "@/contexts/Web3Context";

/**
 * Test utility function that renders React components with all necessary providers.
 * Wraps components with Router, Auth, Toast, and Web3 providers for complete testing.
 *
 * @function renderWithProviders
 * @param {React.ReactElement} ui - The React component to render
 * @param {object} [options={}] - Rendering options
 * @param {string} [options.route='/'] - The initial route for testing
 * @returns {RenderResult} The testing library render result
 * @example
 * ```typescript
 * // Basic component testing
 * const { getByText } = renderWithProviders(<MyComponent />);
 *
 * // Testing with specific route
 * const { getByRole } = renderWithProviders(
 *   <NavigationComponent />,
 *   { route: '/dashboard' }
 * );
 *
 * // Testing with authentication context
 * const { queryByText } = renderWithProviders(<ProtectedComponent />);
 * ```
 */
export function renderWithProviders(
  ui: React.ReactElement,
  { route = "/" } = {},
) {
  window.history.pushState({}, "Test page", route);

  return render(ui, {
    wrapper: ({ children }: PropsWithChildren) => (
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <ToastProvider>
          <AuthProvider>
            <Web3Provider>{children}</Web3Provider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    ),
  });
}

// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";
