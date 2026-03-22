import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Logger } from "@/utils/logger";
import { captureCustomEvent } from "@/lib/sentry";
import { useAuth } from "@/hooks/useAuth";

interface TestResult {
  id: string;
  message: string;
}

interface SentryTestActionsProps {
  onJsError: () => void;
  onLogInfo: () => void;
  onLogWarning: () => void;
  onLogError: () => void;
  onCustomEvent: () => void;
  onAsyncError: () => void;
  onNetworkError: () => void;
  onRefError: () => void;
}

/** Action buttons for triggering various Sentry test scenarios. */
const SentryTestActions: React.FC<SentryTestActionsProps> = ({
  onJsError,
  onLogInfo,
  onLogWarning,
  onLogError,
  onCustomEvent,
  onAsyncError,
  onNetworkError,
  onRefError,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <Button onClick={onJsError} className="bg-red-500 hover:bg-red-600 text-white">
      Test JavaScript Error
    </Button>
    <Button onClick={onLogInfo} className="bg-blue-500 hover:bg-blue-600 text-white">
      Test Logger Info
    </Button>
    <Button onClick={onLogWarning} className="bg-yellow-500 hover:bg-yellow-600 text-white">
      Test Logger Warning
    </Button>
    <Button onClick={onLogError} className="bg-orange-500 hover:bg-orange-600 text-white">
      Test Logger Error
    </Button>
    <Button onClick={onCustomEvent} className="bg-purple-500 hover:bg-purple-600 text-white">
      Test Custom Event
    </Button>
    <Button onClick={onAsyncError} className="bg-pink-500 hover:bg-pink-600 text-white">
      Test Async Error
    </Button>
    <Button onClick={onNetworkError} className="bg-indigo-500 hover:bg-indigo-600 text-white">
      Test Network Error
    </Button>
    <Button onClick={onRefError} className="bg-gray-500 hover:bg-gray-600 text-white">
      Test Reference Error
    </Button>
  </div>
);

interface SentryTestResultsProps {
  results: TestResult[];
  onClear: () => void;
}

/** Display panel for test execution results with clear functionality. */
const SentryTestResults: React.FC<SentryTestResultsProps> = ({ results, onClear }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-semibold">Test Results</h3>
      <Button onClick={onClear} className="text-sm">Clear</Button>
    </div>
    <div className="space-y-1 max-h-60 overflow-y-auto">
      {results.map((result) => (
        <p key={result.id} className="text-sm text-gray-700 font-mono">
          {result.message}
        </p>
      ))}
      {results.length === 0 && (
        <p className="text-sm text-gray-400">No test results yet</p>
      )}
    </div>
  </div>
);

/**
 * Development testing component for Sentry error monitoring integration.
 * Provides UI controls to test various error scenarios and logging functionality.
 *
 * @function SentryTest
 * @returns {JSX.Element} The Sentry test interface component
 * @example
 * ```typescript
 * // Used for testing Sentry integration
 * // Available at /sentry-test route in development
 * <Route path="/sentry-test" component={SentryTest} />
 * ```
 */
export default function SentryTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { user } = useAuth();

  const addResult = useCallback((result: string) => {
    const newResult: TestResult = {
      id: `${Date.now()}-${performance.now().toFixed(0)}`,
      message: `${new Date().toLocaleTimeString()}: ${result}`,
    };
    setTestResults((prev) => [...prev, newResult]);
  }, []);

  const testJavaScriptError = useCallback(() => {
    try {
      addResult("Throwing JavaScript error...");
      throw new Error(
        "Test JavaScript Error - This is a test error from Sentry integration",
      );
    } catch (error) {
      addResult("Error thrown and should be captured by Sentry");
      throw error; // Re-throw to let Sentry catch it
    }
  }, [addResult]);

  const testLoggerInfo = useCallback(() => {
    addResult("Sending info log...");
    Logger.info("Test Info Log", {
      testType: "manual",
      timestamp: new Date().toISOString(),
      user: user?.email,
    });
    addResult("Info log sent to Logger (and Sentry in production)");
  }, [addResult, user?.email]);

  const testLoggerWarning = useCallback(() => {
    addResult("Sending warning log...");
    Logger.warn("Test Warning Log", {
      testType: "manual",
      warningLevel: "medium",
      details: "This is a test warning",
    });
    addResult("Warning log sent to Logger (and Sentry in production)");
  }, [addResult]);

  const testLoggerError = useCallback(() => {
    addResult("Sending error log...");
    Logger.error("Test Error Log", {
      error: new Error("Test error object"),
      severity: "high",
      context: "SentryTest component",
    });
    addResult("Error log sent to Logger (and Sentry in production)");
  }, [addResult]);

  const testCustomEvent = useCallback(() => {
    addResult("Sending custom event...");
    captureCustomEvent("test_custom_event", {
      action: "button_click",
      component: "SentryTest",
      timestamp: new Date().toISOString(),
    });
    addResult("Custom event sent directly to Sentry (in production)");
  }, [addResult]);

  const testAsyncError = useCallback(() => {
    addResult("Triggering async error...");
    setTimeout(() => {
      throw new Error("Test Async Error - Delayed error after 2 seconds");
    }, 2000);
    addResult("Async error will be thrown in 2 seconds...");
  }, [addResult]);

  const testNetworkError = useCallback(async () => {
    addResult("Triggering network error...");
    try {
      await fetch("https://nonexistent-api-endpoint.example.com/test");
    } catch (error) {
      addResult("Network error occurred and should be captured");
      Logger.error("Network request failed", { error });
    }
  }, [addResult]);

  const testReferenceError = useCallback(() => {
    addResult("Triggering reference error...");
    // @ts-expect-error - Intentionally calling undefined function to test Sentry's ReferenceError capture in production
    // eslint-disable-next-line no-undef
    nonExistentFunction(); // This will cause a ReferenceError
  }, [addResult]);

  const clearResults = useCallback(() => {
    setTestResults([]);
    addResult("Test results cleared");
  }, [addResult]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Sentry Integration Test Page
      </h1>

      <p className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-lg text-sm text-yellow-800">
        <strong>Note:</strong> Sentry is only active in production by default.
        To test in development, temporarily modify{" "}
        <code>src/lib/sentry.ts</code> line 6: change{" "}
        <code>if (!import.meta.env.PROD)</code> to <code>if (false)</code>
      </p>

      <SentryTestActions
        onJsError={testJavaScriptError}
        onLogInfo={testLoggerInfo}
        onLogWarning={testLoggerWarning}
        onLogError={testLoggerError}
        onCustomEvent={testCustomEvent}
        onAsyncError={testAsyncError}
        onNetworkError={testNetworkError}
        onRefError={testReferenceError}
      />

      <SentryTestResults results={testResults} onClear={clearResults} />

      <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How to Verify in Sentry:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Go to your Sentry dashboard at sentry.io</li>
          <li>Navigate to Issues to see captured errors</li>
          <li>Check the Events tab for custom events and logs</li>
          <li>Look for user context (if logged in)</li>
          <li>Verify error details, stack traces, and metadata</li>
        </ol>
      </div>
    </div>
  );
}
