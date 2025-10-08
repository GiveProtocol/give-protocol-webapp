/* eslint-disable jest/expect-expect */
import { InputValidator } from '../inputValidation';
import { validationTestCases, testValidCases, testInvalidCases } from '@/test-utils/validationTestData';

describe('InputValidator', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      testValidCases(InputValidator.validateEmail, validationTestCases.email.valid);
    });

    it('rejects invalid email addresses', () => {
      testInvalidCases(InputValidator.validateEmail, validationTestCases.email.invalid);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      testValidCases(InputValidator.validatePassword, validationTestCases.password.valid);
    });

    it('rejects weak passwords', () => {
      testInvalidCases(InputValidator.validatePassword, validationTestCases.password.invalid);
    });
  });

  describe('validateURL', () => {
    it('validates correct HTTPS URLs', () => {
      testValidCases(InputValidator.validateURL, validationTestCases.url.valid);
    });

    it('rejects invalid URLs', () => {
      testInvalidCases(InputValidator.validateURL, validationTestCases.url.invalid);
    });
  });

  describe('sanitizeInput', () => {
    it('removes HTML tags and quotes', () => {
      const testSanitization = (testCases: Array<{ input: string; expected: string }>) => {
        for (const { input, expected } of testCases) {
          expect(InputValidator.sanitizeInput(input)).toBe(expected);
        }
      };

      testSanitization(validationTestCases.sanitization.htmlRemoval);
      testSanitization(validationTestCases.sanitization.quoteRemoval);
    });

    it('trims whitespace', () => {
      const testCases = validationTestCases.sanitization.whitespaceHandling.slice(0, 2);
      for (const { input, expected } of testCases) {
        expect(InputValidator.sanitizeInput(input)).toBe(expected);
      }
    });

    it('handles empty and whitespace-only strings', () => {
      const testCases = validationTestCases.sanitization.whitespaceHandling.slice(2);
      for (const { input, expected } of testCases) {
        expect(InputValidator.sanitizeInput(input)).toBe(expected);
      }
    });

    it('preserves safe content', () => {
      const testCases = validationTestCases.sanitization.safeContent;
      for (const { input, expected } of testCases) {
        expect(InputValidator.sanitizeInput(input)).toBe(expected);
      }
    });
  });

  describe('validateAmount', () => {
    it('validates correct amounts', () => {
      testValidCases(InputValidator.validateAmount, validationTestCases.amount.valid);
    });

    it('rejects invalid amounts', () => {
      testInvalidCases(InputValidator.validateAmount, validationTestCases.amount.invalid);
    });

    it('handles edge cases for decimal precision', () => {
      testValidCases(InputValidator.validateAmount, validationTestCases.amount.decimalPrecision.valid);
      testInvalidCases(InputValidator.validateAmount, validationTestCases.amount.decimalPrecision.invalid);
    });
  });

  describe('static properties', () => {
    it('has the correct regex patterns', () => {
      expect(InputValidator.EMAIL_REGEX).toBeInstanceOf(RegExp);
      expect(InputValidator.PASSWORD_REGEX).toBeInstanceOf(RegExp);
      expect(InputValidator.URL_REGEX).toBeInstanceOf(RegExp);
    });

    it('email regex matches expected pattern', () => {
      expect(InputValidator.EMAIL_REGEX.test('test@example.com')).toBe(true);
      expect(InputValidator.EMAIL_REGEX.test('invalid')).toBe(false);
    });

    it('password regex matches expected pattern', () => {
      expect(InputValidator.PASSWORD_REGEX.test('Password123!')).toBe(true);
      expect(InputValidator.PASSWORD_REGEX.test('weak')).toBe(false);
    });

    it('URL regex matches expected pattern', () => {
      expect(InputValidator.URL_REGEX.test('https://example.com')).toBe(true);
      expect(InputValidator.URL_REGEX.test('http://example.com')).toBe(false);
    });
  });
});