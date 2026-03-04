import { calculateImpact } from './calculateImpact';
import type { FundImpactMetric } from '@/types/impact';

const makeMetric = (overrides: Partial<FundImpactMetric> = {}): FundImpactMetric => ({
  id: 'metric-1',
  fundId: '1',
  unitName: 'Acres of Rainforest',
  unitCostUsd: 25,
  unitIcon: 'trees',
  descriptionTemplate: 'This could protect {{value}} {{unit_name}}',
  sortOrder: 0,
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('calculateImpact', () => {
  it('divides amount by unit cost and returns whole numbers when value >= 1', () => {
    const results = calculateImpact(100, [makeMetric()]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe(4);
    expect(results[0].formattedValue).toBe('4');
  });

  it('rounds to one decimal place when value < 1', () => {
    const results = calculateImpact(10, [makeMetric({ unitCostUsd: 100 })]);
    expect(results[0].value).toBe(0.1);
    expect(results[0].formattedValue).toBe('0.1');
  });

  it('fills template placeholders', () => {
    const results = calculateImpact(100, [makeMetric()]);
    expect(results[0].description).toBe('This could protect 4 Acres of Rainforest');
  });

  it('returns empty array for zero amount', () => {
    expect(calculateImpact(0, [makeMetric()])).toEqual([]);
  });

  it('returns empty array for negative amount', () => {
    expect(calculateImpact(-50, [makeMetric()])).toEqual([]);
  });

  it('returns empty array for empty metrics', () => {
    expect(calculateImpact(100, [])).toEqual([]);
  });

  it('sorts results by sortOrder', () => {
    const metrics = [
      makeMetric({ id: 'b', sortOrder: 2, unitName: 'Second' }),
      makeMetric({ id: 'a', sortOrder: 0, unitName: 'First' }),
      makeMetric({ id: 'c', sortOrder: 1, unitName: 'Middle' }),
    ];
    const results = calculateImpact(100, metrics);
    expect(results.map((r) => r.unitName)).toEqual(['First', 'Middle', 'Second']);
  });

  it('floors values for whole-number results', () => {
    const results = calculateImpact(99, [makeMetric({ unitCostUsd: 25 })]);
    expect(results[0].value).toBe(3);
  });

  it('carries over metric icon and id', () => {
    const results = calculateImpact(50, [makeMetric({ id: 'abc', unitIcon: 'sprout' })]);
    expect(results[0].metricId).toBe('abc');
    expect(results[0].unitIcon).toBe('sprout');
  });
});
