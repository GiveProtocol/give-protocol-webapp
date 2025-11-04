import { validateAmount, isValidAmount } from './validation';

describe('validateAmount', () => {
  it('should accept valid amounts', () => {
    expect(validateAmount(1)).toBe(true);
    expect(validateAmount(100)).toBe(true);
    expect(validateAmount(1000)).toBe(true);
    expect(validateAmount(999999)).toBe(true);
    expect(validateAmount(1000000)).toBe(true);
  });

  it('should accept decimal amounts', () => {
    expect(validateAmount(0.01)).toBe(true);
    expect(validateAmount(123.45)).toBe(true);
    expect(validateAmount(999999.99)).toBe(true);
  });

  it('should reject zero', () => {
    expect(validateAmount(0)).toBe(false);
  });

  it('should reject negative amounts', () => {
    expect(validateAmount(-1)).toBe(false);
    expect(validateAmount(-100)).toBe(false);
  });

  it('should reject amounts above maximum', () => {
    expect(validateAmount(1000001)).toBe(false);
    expect(validateAmount(10000000)).toBe(false);
  });

  it('should reject NaN', () => {
    expect(validateAmount(Number.NaN)).toBe(false);
  });

  it('should reject Infinity', () => {
    expect(validateAmount(Infinity)).toBe(false);
    expect(validateAmount(-Infinity)).toBe(false);
  });

  it('should accept very small positive amounts', () => {
    expect(validateAmount(0.0001)).toBe(true);
    expect(validateAmount(0.000001)).toBe(true);
  });

  it('should accept amount exactly at boundary', () => {
    expect(validateAmount(1000000)).toBe(true);
    expect(validateAmount(0.000000000000000001)).toBe(true);
  });
});

describe('isValidAmount', () => {
  it('should accept valid amounts', () => {
    expect(isValidAmount(1)).toBe(true);
    expect(isValidAmount(100)).toBe(true);
    expect(isValidAmount(1000)).toBe(true);
    expect(isValidAmount(999999)).toBe(true);
    expect(isValidAmount(1000000)).toBe(true);
  });

  it('should accept decimal amounts', () => {
    expect(isValidAmount(0.01)).toBe(true);
    expect(isValidAmount(123.45)).toBe(true);
    expect(isValidAmount(999999.99)).toBe(true);
  });

  it('should reject zero', () => {
    expect(isValidAmount(0)).toBe(false);
  });

  it('should reject negative amounts', () => {
    expect(isValidAmount(-1)).toBe(false);
    expect(isValidAmount(-100)).toBe(false);
  });

  it('should reject amounts above maximum', () => {
    expect(isValidAmount(1000001)).toBe(false);
    expect(isValidAmount(10000000)).toBe(false);
  });

  it('should reject NaN', () => {
    expect(isValidAmount(Number.NaN)).toBe(false);
  });

  it('should accept very small positive amounts', () => {
    expect(isValidAmount(0.0001)).toBe(true);
    expect(isValidAmount(0.000001)).toBe(true);
  });

  it('should accept amount exactly at boundary', () => {
    expect(isValidAmount(1000000)).toBe(true);
  });
});
