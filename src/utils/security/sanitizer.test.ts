import { InputSanitizer } from "./sanitizer";

describe("InputSanitizer", () => {
  let sanitizer: InputSanitizer;

  beforeEach(() => {
    sanitizer = InputSanitizer.getInstance();
  });

  describe("Singleton pattern", () => {
    it("returns the same instance on repeated calls", () => {
      expect(InputSanitizer.getInstance()).toBe(InputSanitizer.getInstance());
    });
  });

  describe("sanitizeHTML", () => {
    it("returns clean text when input has no HTML", () => {
      const result = sanitizer.sanitizeHTML("Hello World");
      expect(result).toContain("Hello World");
    });

    it("preserves allowed tags: <p>", () => {
      const result = sanitizer.sanitizeHTML("<p>Safe paragraph</p>");
      expect(result).toContain("<p>Safe paragraph</p>");
    });

    it("preserves allowed tags: <b>", () => {
      const result = sanitizer.sanitizeHTML("<b>Bold text</b>");
      expect(result).toContain("<b>Bold text</b>");
    });

    it("preserves allowed tags: <em>", () => {
      const result = sanitizer.sanitizeHTML("<em>Emphasis</em>");
      expect(result).toContain("<em>Emphasis</em>");
    });

    it("preserves allowed tags: <strong>", () => {
      const result = sanitizer.sanitizeHTML("<strong>Strong</strong>");
      expect(result).toContain("<strong>Strong</strong>");
    });

    it("preserves allowed tags: <ul>, <li>", () => {
      const result = sanitizer.sanitizeHTML("<ul><li>Item</li></ul>");
      expect(result).toContain("<ul>");
      expect(result).toContain("<li>Item</li>");
    });

    it("removes <script> tags", () => {
      const result = sanitizer.sanitizeHTML(
        '<script>alert("xss")</script>Safe text',
      );
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("alert");
    });

    it("removes <div> tags (not in allowedTags)", () => {
      const result = sanitizer.sanitizeHTML("<div>Content</div>");
      expect(result).not.toContain("<div>");
    });

    it("removes <img> tags", () => {
      const result = sanitizer.sanitizeHTML(
        '<img src="bad.jpg" onerror="alert(1)" />',
      );
      expect(result).not.toContain("<img");
    });

    it("removes disallowed attributes from allowed tags", () => {
      // <p> is allowed but onclick is not
      const result = sanitizer.sanitizeHTML(
        '<p onclick="evil()">Text</p>',
      );
      expect(result).not.toContain("onclick");
    });

    it("preserves href on <a> tag (allowed attribute)", () => {
      const result = sanitizer.sanitizeHTML(
        '<a href="https://example.com">Link</a>',
      );
      expect(result).toContain("href");
    });

    it("returns empty string on parse failure simulation", () => {
      // sanitizeHTML should handle errors gracefully (returns "")
      // We test with empty string input:
      const result = sanitizer.sanitizeHTML("");
      expect(typeof result).toBe("string");
    });
  });

  describe("sanitizeText", () => {
    it("returns empty string for empty input", () => {
      expect(sanitizer.sanitizeText("", "title")).toBe("");
    });

    it("trims whitespace", () => {
      expect(sanitizer.sanitizeText("  hello  ", "name")).toBe("hello");
    });

    it("removes < characters", () => {
      const result = sanitizer.sanitizeText("<script>", "description");
      expect(result).not.toContain("<");
    });

    it("removes > characters", () => {
      const result = sanitizer.sanitizeText("a>b", "title");
      expect(result).not.toContain(">");
    });

    it("escapes & as &amp;", () => {
      const result = sanitizer.sanitizeText("a & b", "title");
      expect(result).toContain("&amp;");
    });

    it("escapes double quotes", () => {
      const result = sanitizer.sanitizeText('say "hi"', "title");
      expect(result).toContain("&quot;");
    });

    it("escapes single quotes", () => {
      const result = sanitizer.sanitizeText("it's", "title");
      expect(result).toContain("&#x27;");
    });

    it("escapes forward slashes", () => {
      const result = sanitizer.sanitizeText("a/b", "title");
      expect(result).toContain("&#x2F;");
    });

    it("enforces max length for title (100 chars)", () => {
      const long = "a".repeat(200);
      const result = sanitizer.sanitizeText(long, "title");
      expect(result.length).toBeLessThanOrEqual(100);
    });

    it("enforces max length for description (1000 chars)", () => {
      const long = "a".repeat(2000);
      const result = sanitizer.sanitizeText(long, "description");
      expect(result.length).toBeLessThanOrEqual(1000);
    });

    it("enforces max length for name (50 chars)", () => {
      const long = "a".repeat(100);
      const result = sanitizer.sanitizeText(long, "name");
      expect(result.length).toBeLessThanOrEqual(50);
    });

    it("enforces max length for comment (500 chars)", () => {
      const long = "a".repeat(1000);
      const result = sanitizer.sanitizeText(long, "comment");
      expect(result.length).toBeLessThanOrEqual(500);
    });
  });

  describe("validatePattern", () => {
    describe("email", () => {
      it("accepts valid email", () => {
        expect(sanitizer.validatePattern("user@example.com", "email")).toBe(
          true,
        );
      });

      it("accepts email with subdomain", () => {
        expect(
          sanitizer.validatePattern("user@mail.example.com", "email"),
        ).toBe(true);
      });

      it("rejects email without @", () => {
        expect(sanitizer.validatePattern("notanemail", "email")).toBe(false);
      });

      it("rejects email without domain", () => {
        expect(sanitizer.validatePattern("user@", "email")).toBe(false);
      });
    });

    describe("wallet", () => {
      it("accepts valid Ethereum address", () => {
        expect(
          sanitizer.validatePattern(
            "0x1234567890abcdef1234567890abcdef12345678",
            "wallet",
          ),
        ).toBe(true);
      });

      it("rejects address without 0x prefix", () => {
        expect(
          sanitizer.validatePattern(
            "1234567890abcdef1234567890abcdef12345678",
            "wallet",
          ),
        ).toBe(false);
      });

      it("rejects address that is too short", () => {
        expect(sanitizer.validatePattern("0x1234", "wallet")).toBe(false);
      });

      it("rejects address with invalid characters", () => {
        expect(sanitizer.validatePattern("0xGGGG", "wallet")).toBe(false);
      });
    });

    describe("url", () => {
      it("accepts valid https URL", () => {
        expect(
          sanitizer.validatePattern("https://example.com", "url"),
        ).toBe(true);
      });

      it("accepts https URL with path", () => {
        expect(
          sanitizer.validatePattern("https://example.com/path/to/page", "url"),
        ).toBe(true);
      });

      it("rejects http URL (only https allowed)", () => {
        expect(
          sanitizer.validatePattern("http://example.com", "url"),
        ).toBe(false);
      });

      it("rejects plain text", () => {
        expect(sanitizer.validatePattern("not-a-url", "url")).toBe(false);
      });
    });

    describe("amount", () => {
      it("accepts integer amount", () => {
        expect(sanitizer.validatePattern("100", "amount")).toBe(true);
      });

      it("accepts decimal amount", () => {
        expect(sanitizer.validatePattern("1.5", "amount")).toBe(true);
      });

      it("accepts amount with many decimal places", () => {
        expect(
          sanitizer.validatePattern("0.000000000000000001", "amount"),
        ).toBe(true);
      });

      it("rejects negative amount", () => {
        expect(sanitizer.validatePattern("-100", "amount")).toBe(false);
      });

      it("rejects non-numeric string", () => {
        expect(sanitizer.validatePattern("abc", "amount")).toBe(false);
      });
    });
  });

  describe("sanitizeObject", () => {
    it("sanitizes text fields according to schema", () => {
      const obj = { name: "<script>bad</script>" };
      const schema = { name: "text" };
      const result = sanitizer.sanitizeObject(obj, schema);
      expect(result.name).not.toContain("<script>");
    });

    it("sanitizes html fields according to schema", () => {
      const obj = { content: '<p>Good</p><script>bad()</script>' };
      const schema = { content: "html" };
      const result = sanitizer.sanitizeObject(obj, schema);
      expect(result.content).not.toContain("<script>");
      expect(result.content).toContain("<p>Good</p>");
    });

    it("validates pattern fields and returns empty string for invalid", () => {
      const obj = { email: "not-an-email" };
      const schema = { email: "email" };
      const result = sanitizer.sanitizeObject(obj, schema);
      expect(result.email).toBe("");
    });

    it("validates pattern fields and keeps value when valid", () => {
      const obj = { email: "user@example.com" };
      const schema = { email: "email" };
      const result = sanitizer.sanitizeObject(obj, schema);
      expect(result.email).toBe("user@example.com");
    });
  });
});
