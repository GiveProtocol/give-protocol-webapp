/**
 * CSRF protection utility that generates and validates tokens
 * Uses class pattern with private constructor due to maintaining static state (token)
 */
// skipcq: JS-0327 - Class with static state (token) requires singleton pattern, not namespace object
export class CSRFProtection {
  private static token: string | null = null;
  private static initializationCount = 0;

  // Private constructor prevents instantiation - this is a singleton utility class with state
  private constructor() {
    throw new Error(
      "CSRFProtection cannot be instantiated. Use static methods instead.",
    );
  }

  static initialize(): void {
    this.initializationCount++;
    this.token = crypto.randomUUID();
    document.cookie = `csrf-token=${this.token}; path=/; samesite=strict`;
  }

  static getToken(): string {
    if (!this.token) {
      this.initialize();
    }

    if (!this.token) {
      throw new Error("Failed to initialize CSRF token");
    }

    return this.token;
  }

  static validate(token: string): boolean {
    return token === this.token;
  }

  static getHeaders(): Record<string, string> {
    return {
      "X-CSRF-Token": this.getToken(),
    };
  }
}
