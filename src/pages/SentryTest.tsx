import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Logger } from "@/utils/logger";
import { captureCustomEvent } from "@/lib/sentry";
import { useAuth } from "@/hooks/useAuth";

interface TestResult {
  id: string;
  message: string;
}

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

  const testAsyncError = useCallback(async () => {
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Sentry Integration Test Page
        </h1>

        <p className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-lg text-sm text-yellow-800">
          <strong>Note:</strong> Sentry is only active in production by default.
          To test in development, temporarily modify{" "}
          <code>src/lib/sentry.ts</code> line 6: change{" "}
          <code>if (!import.meta.env.PROD)</code> to <code>if (false)</code>
        </p>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={testJavaScriptError} variant="danger">
              Throw JavaScript Error
            </Button>
            <Button onClick={testLoggerInfo} variant="secondary">
              Test Logger Info
            </Button>
            <Button onClick={testLoggerWarning} variant="secondary">
              Test Logger Warning
            </Button>
            <Button onClick={testLoggerError} variant="danger">
              Test Logger Error
            </Button>
            <Button onClick={testCustomEvent} variant="primary">
              Send Custom Event
            </Button>
            <Button onClick={testAsyncError} variant="danger">
              Trigger Async Error
            </Button>
            <Button onClick={testNetworkError} variant="secondary">
              Trigger Network Error
            </Button>
            <Button onClick={testReferenceError} variant="danger">
              Trigger Reference Error
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <Button onClick={clearResults} size="sm" variant="secondary">
              Clear Results
            </Button>
          </div>
          <div className="bg-gray-50 rounded p-4 min-h-[200px]">
            {testResults.length === 0 ? (
              <p className="text-gray-500">
                No test results yet. Click a button above to test.
              </p>
            ) : (
              <ul className="space-y-2">
                {testResults.map((result) => (
                  <li key={result.id} className="text-sm font-mono">
                    {result.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

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
    </div>
  );
}
