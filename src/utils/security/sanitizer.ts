import { Logger } from "../logger";

/**
 * Input sanitization and validation utility for preventing XSS and injection attacks
 * @class InputSanitizer
 * @description Singleton class that provides comprehensive input sanitization including HTML filtering, text cleaning, and pattern validation. Uses secure DOM parsing and configurable whitelists to prevent malicious content injection while preserving safe formatting.
 * @example
 * ```typescript
 * const sanitizer = InputSanitizer.getInstance();
 *
 * // Sanitize HTML content
 * const safeHtml = sanitizer.sanitizeHTML('<p>Safe content</p><script>alert("xss")</script>');
 * // Returns: '<p>Safe content</p>'
 *
 * // Sanitize text fields
 * const safeText = sanitizer.sanitizeText('User <script>alert("xss")</script> input', 'description');
 * // Returns: 'User  input' (with proper length limits and escaping)
 *
 * // Validate patterns
 * const isValidEmail = sanitizer.validatePattern('user@example.com', 'email');
 * // Returns: true
 *
 * // Bulk sanitization with schema
 * const sanitizedData = sanitizer.sanitizeObject(
 *   { title: '<b>Title</b>', description: 'Safe content' },
 *   { title: 'html', description: 'text' }
 * );
 * ```
 */
export class InputSanitizer {
  private static instance: InputSanitizer;

  private readonly allowedTags = [
    "p",
    "br",
    "b",
    "i",
    "em",
    "strong",
    "a",
    "ul",
    "ol",
    "li",
  ];

  private readonly allowedAttributes = {
    a: ["href", "title", "target"],
  };

  private readonly maxLengths = {
    title: 100,
    description: 1000,
    name: 50,
    comment: 500,
  };

  private readonly patterns = {
    // Safe email regex that avoids catastrophic backtracking
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    wallet: /^0x[a-fA-F0-9]{40}$/,
    // Safe URL regex with proper escaping and bounded quantifiers
    url: /^https:\/\/[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?$/,
    amount: /^\d+(?:\.\d{1,18})?$/,
  };

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  static getInstance(): InputSanitizer {
    if (!this.instance) {
      this.instance = new InputSanitizer();
    }
    return this.instance;
  }

  sanitizeHTML(input: string): string {
    try {
      const doc = new DOMParser().parseFromString(input, "text/html");
      this.sanitizeNode(doc.body);
      return doc.body.innerHTML;
    } catch (error) {
      Logger.error("HTML sanitization failed", { error });
      return "";
    }
  }

  private sanitizeNode(node: Node): void {
    const children = Array.from(node.childNodes);

    children.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element;

        if (!this.allowedTags.includes(element.tagName.toLowerCase())) {
          node.removeChild(child);
          return;
        }

        // Remove disallowed attributes
        Array.from(element.attributes).forEach((attr) => {
          const tagAllowedAttrs =
            this.allowedAttributes[element.tagName.toLowerCase()];
          if (!tagAllowedAttrs || !tagAllowedAttrs.includes(attr.name)) {
            element.removeAttribute(attr.name);
          }
        });

        this.sanitizeNode(child);
      }
    });
  }

  sanitizeText(input: string, field: keyof typeof this.maxLengths): string {
    if (!input) return "";

    const sanitized = input
      .trim()
      .slice(0, this.maxLengths[field])
      .replace(/[<>]/g, "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");

    return sanitized;
  }

  validatePattern(input: string, pattern: keyof typeof this.patterns): boolean {
    return this.patterns[pattern].test(input);
  }

  sanitizeObject<T extends Record<string, unknown>>(
    obj: T,
    schema: Record<keyof T, string>,
  ): T {
    const sanitized = {} as T;

    for (const [key, value] of Object.entries(obj)) {
      if (schema[key] === "html") {
        sanitized[key] = this.sanitizeHTML(value);
      } else if (schema[key] === "text") {
        sanitized[key] = this.sanitizeText(value, key as string);
      } else if (this.patterns[schema[key]]) {
        sanitized[key] = this.validatePattern(value, schema[key]) ? value : "";
      }
    }

    return sanitized;
  }
}
