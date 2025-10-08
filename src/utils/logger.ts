import * as Sentry from "@sentry/react";
import { getEnv } from "./env";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Centralized logging utility that integrates with Sentry for production error tracking
 * Maintains an in-memory log buffer for debugging and provides structured logging
 * Uses class pattern with private constructor due to maintaining static state (logs array)
 */
// skipcq: JS-0327 - Class with static state (logs array) requires singleton pattern, not namespace object
export class Logger {
  private static readonly MAX_LOG_SIZE = 1000;
  private static logs: LogEntry[] = [];
  private static logCount = 0;

  // Private constructor prevents instantiation - this is a singleton utility class with state
  private constructor() {
    throw new Error(
      "Logger cannot be instantiated. Use static methods instead.",
    );
  }

  private static serializeValue(value: unknown): unknown {
    if (value === undefined) {
      return "undefined";
    }

    if (value === null) {
      return null;
    }

    if (typeof value === "bigint") {
      return value.toString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serializeValue(item));
    }

    if (value && typeof value === "object") {
      try {
        if (value instanceof Error) {
          return {
            message: value.message,
            stack: value.stack,
            name: value.name,
          };
        }

        return Object.fromEntries(
          Object.entries(value).map(([key, val]) => [
            key,
            this.serializeValue(val),
          ]),
        );
      } catch (err) {
        return `[Unserializable Object: ${err instanceof Error ? err.message : String(err)}]`;
      }
    }

    return value;
  }

  private static log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    try {
      const serializedMetadata = metadata
        ? this.serializeValue(metadata)
        : metadata;

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        metadata: serializedMetadata,
      };

      this.logs.push(entry);
      this.logCount++;
      if (this.logs.length > this.MAX_LOG_SIZE) {
        this.logs.shift();
      }

      const env = getEnv();

      // Send to monitoring service in production
      if (env.PROD) {
        this.sendToMonitoring(entry);
      }

      // Console output in development or test
      if (env.DEV || env.MODE === "test") {
        const metadataStr = serializedMetadata
          ? ` ${JSON.stringify(serializedMetadata)}`
          : "";
        console[level](`[${level.toUpperCase()}] ${message}${metadataStr}`);
      }
    } catch (e) {
      // Fallback logging if something goes wrong
      console.error("Logger error:", e);
      console[level](message, metadata);
    }
  }

  /**
   * Logs an informational message
   * @param message - The message to log
   * @param metadata - Optional structured data to include with the log
   */
  static info(message: string, metadata?: Record<string, unknown>) {
    this.log("info", message, metadata);
  }

  /**
   * Logs a warning message
   * @param message - The warning message to log
   * @param metadata - Optional structured data to include with the log
   */
  static warn(message: string, metadata?: Record<string, unknown>) {
    this.log("warn", message, metadata);
  }

  /**
   * Logs an error message and sends to Sentry in production
   * @param message - The error message to log
   * @param metadata - Optional structured data, including error objects
   */
  static error(message: string, metadata?: Record<string, unknown>) {
    this.log("error", message, metadata);
  }

  private static async sendToMonitoring(entry: LogEntry) {
    // Send to Sentry
    try {
      const sentryLevel = entry.level === "warn" ? "warning" : entry.level;

      if (entry.level === "error") {
        // For errors, try to extract the actual error object from metadata
        const error = entry.metadata?.error || new Error(entry.message);
        Sentry.captureException(error, {
          level: sentryLevel,
          extra: entry.metadata,
          tags: {
            source: "logger",
          },
        });
      } else {
        // For info and warnings, use captureMessage
        Sentry.captureMessage(entry.message, {
          level: sentryLevel,
          extra: entry.metadata,
          tags: {
            source: "logger",
          },
        });
      }
    } catch (error) {
      console.error("Failed to send log to Sentry:", error);
    }

    // Also send to custom endpoint if configured
    const env = getEnv();
    const monitoringEndpoint = env.VITE_MONITORING_ENDPOINT;
    if (monitoringEndpoint) {
      try {
        await fetch(monitoringEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entry),
        });
      } catch (error) {
        console.error("Failed to send log to monitoring endpoint:", error);
      }
    }
  }

  static getLogs(): LogEntry[] {
    return [...this.logs];
  }
}
