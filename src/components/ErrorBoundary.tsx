import React, { Component, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/Button";
import { Logger } from "@/utils/logger";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (_error: Error, _errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  recoveryAttempts: number;
}

const MAX_RECOVERY_ATTEMPTS = 3;
const RECOVERY_COOLDOWN = 5000; // 5 seconds

export class ErrorBoundary extends Component<Props, State> {
  private lastRecoveryAttempt = 0;
  private cacheOperationsCount = 0;
  private navigationAttempts = 0;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempts: 0,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log detailed error information
    Logger.error("React error boundary caught error", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      location: window.location.href,
      timestamp: new Date().toISOString(),
      recoveryAttempts: this.state.recoveryAttempts,
    });

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      hasError: true,
    });

    // Attempt automatic recovery for certain errors
    if (this.canAttemptRecovery(error)) {
      this.attemptRecovery();
    }
  }

  private canAttemptRecovery(error: Error): boolean {
    // List of errors that we can attempt to recover from
    const recoverableErrors = [
      "ChunkLoadError", // Webpack chunk loading error
      "NetworkError",
      "TimeoutError",
      "SyntaxError", // Sometimes caused by malformed JSON
    ];

    return (
      this.state.recoveryAttempts < MAX_RECOVERY_ATTEMPTS &&
      (recoverableErrors.includes(error.name) ||
        error.message.includes("loading chunk") ||
        error.message.includes("network"))
    );
  }

  private readonly attemptRecovery = async () => {
    const now = Date.now();
    if (now - this.lastRecoveryAttempt < RECOVERY_COOLDOWN) {
      return;
    }

    this.lastRecoveryAttempt = now;
    this.setState((prev) => ({ recoveryAttempts: prev.recoveryAttempts + 1 }));

    try {
      // Clear cache and reload resources
      await this.clearCache();

      // Reset error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });

      // Log recovery attempt
      Logger.info("Attempted error recovery", {
        attempt: this.state.recoveryAttempts,
        timestamp: new Date().toISOString(),
      });
    } catch (recoveryError) {
      Logger.error("Recovery attempt failed", {
        error: recoveryError,
        attempt: this.state.recoveryAttempts,
      });
    }
  };

  private async clearCache() {
    this.cacheOperationsCount++;
    if ("caches" in window) {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      } catch (error) {
        Logger.error("Failed to clear cache", { error });
      }
    }
  }

  private readonly handleReset = () => {
    // Reset state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempts: 0,
    });
  };

  private readonly handleNavigateHome = () => {
    this.navigationAttempts++;
    // Navigate to home page
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="space-y-3">
              <Button
                onClick={this.handleReset}
                variant="secondary"
                className="w-full flex items-center justify-center"
                disabled={this.state.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {this.state.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS
                  ? "Too many attempts"
                  : "Try Again"}
              </Button>
              <Button
                onClick={this.handleNavigateHome}
                className="w-full flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mt-4 p-4 bg-gray-50 rounded-md">
                <summary className="text-sm text-gray-700 cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                  {this.state.error?.stack}
                </pre>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
