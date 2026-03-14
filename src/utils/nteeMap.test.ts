import { describe, it, expect } from '@jest/globals';
import { getNteeCategory, formatNteeCode } from './nteeMap';

describe('nteeMap', () => {
  describe('getNteeCategory', () => {
    it('should return "Unknown" for null', () => {
      expect(getNteeCategory(null)).toBe('Unknown');
    });

    it('should return "Unknown" for undefined', () => {
      expect(getNteeCategory(undefined)).toBe('Unknown');
    });

    it('should return "Unknown" for empty string', () => {
      expect(getNteeCategory('')).toBe('Unknown');
    });

    it('should map "A" prefix to Arts, Culture & Humanities', () => {
      expect(getNteeCategory('A20')).toBe('Arts, Culture & Humanities');
    });

    it('should map "B" prefix to Education', () => {
      expect(getNteeCategory('B12')).toBe('Education');
    });

    it('should map "E" prefix to Health Care', () => {
      expect(getNteeCategory('E50')).toBe('Health Care');
    });

    it('should map "P" prefix to Human Services', () => {
      expect(getNteeCategory('P01')).toBe('Human Services');
    });

    it('should map "X" prefix to Religion-Related', () => {
      expect(getNteeCategory('X99')).toBe('Religion-Related');
    });

    it('should map "Z" prefix to Unknown', () => {
      expect(getNteeCategory('Z10')).toBe('Unknown');
    });

    it('should handle lowercase input by uppercasing the prefix', () => {
      expect(getNteeCategory('b20')).toBe('Education');
    });

    it('should return original code for unrecognized prefix', () => {
      expect(getNteeCategory('920')).toBe('920');
    });
  });

  describe('formatNteeCode', () => {
    it('should return "—" for null', () => {
      expect(formatNteeCode(null)).toBe('—');
    });

    it('should return "—" for undefined', () => {
      expect(formatNteeCode(undefined)).toBe('—');
    });

    it('should return "—" for empty string', () => {
      expect(formatNteeCode('')).toBe('—');
    });

    it('should format valid code as "CODE — Category"', () => {
      expect(formatNteeCode('B20')).toBe('B20 — Education');
    });

    it('should format code with unrecognized prefix using original code as category', () => {
      expect(formatNteeCode('920')).toBe('920 — 920');
    });

    it('should format lowercase code preserving original case in output', () => {
      expect(formatNteeCode('e12')).toBe('e12 — Health Care');
    });
  });
});
