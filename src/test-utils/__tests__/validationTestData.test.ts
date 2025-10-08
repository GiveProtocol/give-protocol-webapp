import {
  validEmailCases,
  invalidEmailCases,
  validPasswordCases,
  invalidPasswordCases,
  validNameCases,
  invalidNameCases,
} from "../validationTestData";

describe("validationTestData", () => {
  describe("validEmailCases", () => {
    it("contains valid email examples", () => {
      expect(validEmailCases).toContain("test@example.com");
      expect(validEmailCases).toContain("user.name+tag@domain.co.uk");
      expect(validEmailCases.length).toBeGreaterThan(0);

      validEmailCases.forEach((email) => {
        expect(typeof email).toBe("string");
        expect(email).toContain("@");
      });
    });
  });

  describe("invalidEmailCases", () => {
    it("contains invalid email examples", () => {
      expect(invalidEmailCases).toContain("invalid");
      expect(invalidEmailCases).toContain("test@");
      expect(invalidEmailCases.length).toBeGreaterThan(0);

      invalidEmailCases.forEach((email) => {
        expect(typeof email).toBe("string");
      });
    });
  });

  describe("validPasswordCases", () => {
    it("contains valid password examples", () => {
      expect(validPasswordCases.length).toBeGreaterThan(0);

      validPasswordCases.forEach((password) => {
        expect(typeof password).toBe("string");
        expect(password.length).toBeGreaterThanOrEqual(8);
      });
    });
  });

  describe("invalidPasswordCases", () => {
    it("contains invalid password examples", () => {
      expect(invalidPasswordCases).toContain("password");
      expect(invalidPasswordCases).toContain("PASSWORD");
      expect(invalidPasswordCases.length).toBeGreaterThan(0);
    });
  });

  describe("validNameCases", () => {
    it("contains valid name examples", () => {
      expect(validNameCases).toContain("John Doe");
      expect(validNameCases).toContain("Jane Smith");
      expect(validNameCases.length).toBeGreaterThan(0);
    });
  });

  describe("invalidNameCases", () => {
    it("contains invalid name examples", () => {
      expect(invalidNameCases).toContain("");
      expect(invalidNameCases.length).toBeGreaterThan(0);
    });
  });
});
