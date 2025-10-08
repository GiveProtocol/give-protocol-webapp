import { 
  validateEmail, 
  validatePassword, 
  validateAmount,
  validateAuthInput,
  sanitizeInput,
  validateFileUpload,
  isValidAmount,
  validateUrl,
  validatePhoneNumber,
  validateName
} from '../validation';

describe('Validation utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      for (const email of validEmails) {
        expect(validateEmail(email)).toBe(true);
      }
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        '',
        'test@.com'
      ];

      for (const email of invalidEmails) {
        expect(validateEmail(email)).toBe(false);
      }
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'StrongPass123!',
        'MySecure@Password1',
        'Complex#Pass99',
      ];

      for (const password of validPasswords) {
        expect(validatePassword(password)).toBe(true);
      }
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'short',   // Less than 8 characters
        '1234567', // Less than 8 characters 
        '',        // Empty string
      ];

      for (const password of invalidPasswords) {
        expect(validatePassword(password)).toBe(false);
      }
    });
  });

  describe('validateAmount', () => {
    it('should validate positive numbers', () => {
      const validAmounts = [
        1,
        1.5,
        100.99,
        0.001,
        1000000,
      ];

      for (const amount of validAmounts) {
        expect(validateAmount(amount)).toBe(true);
      }
    });

    it('should reject invalid amounts', () => {
      const invalidAmounts = [
        0,
        -1,
        -100.5,
        NaN,
        Infinity,
        1000001, // Over limit
      ];

      for (const amount of invalidAmounts) {
        expect(validateAmount(amount)).toBe(false);
      }
    });
  });

  describe('validateAuthInput', () => {
    it('should pass for valid email and password', () => {
      expect(() => validateAuthInput('test@example.com', 'ValidPass123!')).not.toThrow();
    });

    it('should throw error for invalid email', () => {
      expect(() => validateAuthInput('invalid-email', 'ValidPass123!')).toThrow('Please enter a valid email address');
    });

    it('should throw error for invalid password', () => {
      expect(() => validateAuthInput('test@example.com', 'weak')).toThrow('Password must be at least 8 characters long');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("test")</script>')).toBe('scriptalert(test)/script');
      expect(sanitizeInput('<div>content</div>')).toBe('divcontent/div');
      expect(sanitizeInput('text with "quotes" and \'single quotes\'')).toBe('text with quotes and single quotes');
    });

    it('should preserve safe content', () => {
      expect(sanitizeInput('normal text')).toBe('normal text');
      expect(sanitizeInput('123 numbers')).toBe('123 numbers');
      expect(sanitizeInput('symbols @#$%^&*()')).toBe('symbols @#$%^&*()');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('validateFileUpload', () => {
    it('should pass for valid PDF file', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      expect(() => validateFileUpload(file)).not.toThrow();
    });

    it('should pass for valid JPEG file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }); // 2MB
      expect(() => validateFileUpload(file)).not.toThrow();
    });

    it('should pass for valid PNG file', () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); // 3MB
      expect(() => validateFileUpload(file)).not.toThrow();
    });

    it('should throw error for file too large', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB
      expect(() => validateFileUpload(file)).toThrow('File size must be less than 5MB');
    });

    it('should throw error for invalid file type', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 1024 }); // 1KB
      expect(() => validateFileUpload(file)).toThrow('File type must be PDF, JPEG, or PNG');
    });
  });

  describe('isValidAmount', () => {
    it('should validate positive amounts within limits', () => {
      expect(isValidAmount(1)).toBe(true);
      expect(isValidAmount(100.5)).toBe(true);
      expect(isValidAmount(1000000)).toBe(true);
    });

    it('should reject zero and negative amounts', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-1)).toBe(false);
      expect(isValidAmount(-100)).toBe(false);
    });

    it('should reject amounts over limit', () => {
      expect(isValidAmount(1000001)).toBe(false);
    });

    it('should reject NaN', () => {
      expect(isValidAmount(NaN)).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate HTTPS URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('https://www.example.com/path')).toBe(true);
      expect(validateUrl('https://subdomain.example.co.uk/path/to/page')).toBe(true);
    });

    it('should reject HTTP URLs', () => {
      expect(validateUrl('http://example.com')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('ftp://example.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });

    it('should handle malformed URLs', () => {
      expect(validateUrl('https://')).toBe(false);
      expect(validateUrl('https://.')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate basic phone number formats', () => {
      expect(validatePhoneNumber('1234567890')).toBe(true);
      expect(validatePhoneNumber('123-456-7890')).toBe(true);
      expect(validatePhoneNumber('123 456 7890')).toBe(true);
      expect(validatePhoneNumber('123.456.7890')).toBe(true);
      expect(validatePhoneNumber('+1234567890')).toBe(true);
      expect(validatePhoneNumber('(123)456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('12345')).toBe(false);
      expect(validatePhoneNumber('abc-def-ghij')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
      expect(validatePhoneNumber('123-456-78901234')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should validate names within length limits', () => {
      expect(validateName('John')).toBe(true);
      expect(validateName('Mary Jane')).toBe(true);
      expect(validateName('A'.repeat(50))).toBe(true);
      expect(validateName('A'.repeat(100))).toBe(true);
    });

    it('should reject names too short', () => {
      expect(validateName('A')).toBe(false);
      expect(validateName('')).toBe(false);
    });

    it('should reject names too long', () => {
      expect(validateName('A'.repeat(101))).toBe(false);
    });

    it('should handle names with whitespace', () => {
      expect(validateName('  John  ')).toBe(true); // Trimmed to 'John'
      expect(validateName('   A   ')).toBe(false); // Trimmed to 'A', too short
    });
  });
});