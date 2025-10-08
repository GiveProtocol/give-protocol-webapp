import { Logger } from './logger';

export const ErrorHandler = {
  handle(error: unknown, context?: string): Error {
    const err = error instanceof Error ? error : new Error(String(error));
    
    // Log the error
    Logger.error(err.message, {
      context,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    // Sanitize error message for production
    if (import.meta.env.PROD) {
      return new Error('An unexpected error occurred. Please try again later.');
    }

    return err;
  },

  async handleAsync<T>(
    promise: Promise<T>,
    context?: string
  ): Promise<[T | null, Error | null]> {
    try {
      const result = await promise;
      return [result, null];
    } catch (error) {
      const handledError = this.handle(error, context);
      return [null, handledError];
    }
  }
} as const;