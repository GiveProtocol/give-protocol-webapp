/**
 * Test coverage for cn.ts utility function
 */

import { cn } from '../cn';

describe('cn utility', () => {
  it('should combine class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(typeof result).toBe('string');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('should handle conditional class names', () => {
    const shouldIncludeConditional = false;
    const result = cn('base', shouldIncludeConditional && 'conditional', 'always');
    expect(typeof result).toBe('string');
    expect(result).toContain('base');
    expect(result).toContain('always');
    expect(result).not.toContain('conditional');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(typeof result).toBe('string');
    expect(result).toContain('base');
    expect(result).toContain('end');
  });
});