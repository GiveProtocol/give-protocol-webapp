import React, { Component, ErrorInfo } from "react";
import { Logger } from "@/utils/logger";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component for catching and handling runtime errors
 * @class ErrorBoundary
 * @extends Component
 * @description Catches JavaScript errors anywhere in the child component tree,
 * logs error information, and displays a fallback UI instead of crashing the app
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  private errorCount = 0;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Invoked when an error is thrown in a child component.
   * Updates the state to indicate an error has been encountered.
   * @param error - The error that was thrown.
   * @returns The new state indicating an error.
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Called when a child component throws an error. Increments the error count and logs the error details.
   * @param error - The caught error object.
   * @param errorInfo - Information about the component stack trace where the error occurred.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.errorCount++;
    Logger.error("React error boundary caught error", {
      error: {
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      errorCount: this.errorCount,
    });
  }

  static handleReload = () => {
    window.location.reload();
  };

  /**
   * Renders the ErrorBoundary component UI.
   * Displays a fallback UI if an error has been caught in a child component,
   * otherwise renders the child components.
   *
   * @returns {React.ReactNode} The UI to render, either the fallback UI or children.
   */
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={ErrorBoundary.handleReload}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
