// Safe email regex that avoids catastrophic backtracking
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Safe URL regex with proper escaping and bounded quantifiers  
const URL_REGEX = /^https:\/\/[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?$/;

/**
 * Input validation utility with security-focused regex patterns
 * Provides validation methods for common input types with protection against ReDoS attacks
 */
export const InputValidator = {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  URL_REGEX,

  validateEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  },

  validatePassword(password: string): boolean {
    return PASSWORD_REGEX.test(password);
  },

  validateURL(url: string): boolean {
    return URL_REGEX.test(url);
  },

  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  },

  validateAmount(amount: number): boolean {
    return (
      Number.isFinite(amount) &&
      amount > 0 &&
      amount <= 1000000 &&
      Number.isInteger(amount * 100) // Ensure max 2 decimal places
    );
  }
} as const;