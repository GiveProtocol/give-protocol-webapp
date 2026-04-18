import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { PerformanceMonitor } from './performance';
import { Logger } from '@/utils/logger';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance();
    // Clear metrics by getting a fresh state: measure and then override
    // We work around the private metrics map by testing through the public API
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('returns the same instance on multiple calls', () => {
      const instance1 = PerformanceMonitor.getInstance();
      const instance2 = PerformanceMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('returns an instance of PerformanceMonitor', () => {
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });
  });

  describe('measureTime', () => {
    it('records a duration for a new operation', () => {
      monitor.measureTime('test_op_measure', 50);
      const metrics = monitor.getMetrics('test_op_measure');
      expect(metrics).not.toBeNull();
      expect(metrics?.avg).toBe(50);
    });

    it('records multiple durations for the same operation', () => {
      monitor.measureTime('test_op_multi', 100);
      monitor.measureTime('test_op_multi', 200);
      monitor.measureTime('test_op_multi', 300);
      const metrics = monitor.getMetrics('test_op_multi');
      expect(metrics).not.toBeNull();
      expect(metrics?.avg).toBe(200);
    });

    it('logs a warning for slow operations exceeding 1000ms', () => {
      monitor.measureTime('slow_op', 1500);
      expect(Logger.warn).toHaveBeenCalledWith(
        'Slow operation detected',
        expect.objectContaining({
          operation: 'slow_op',
          duration: 1500,
        })
      );
    });

    it('does not log a warning for operations under 1000ms', () => {
      jest.clearAllMocks();
      monitor.measureTime('fast_op_no_warn', 500);
      expect(Logger.warn).not.toHaveBeenCalled();
    });

    it('does not log a warning for exactly 1000ms', () => {
      jest.clearAllMocks();
      monitor.measureTime('exact_1000', 1000);
      expect(Logger.warn).not.toHaveBeenCalled();
    });

    it('keeps only the last 100 samples', () => {
      for (let i = 1; i <= 110; i++) {
        monitor.measureTime('capped_op', i);
      }
      const metrics = monitor.getMetrics('capped_op');
      expect(metrics).not.toBeNull();
      // After 110 entries, only the last 100 remain (values 11..110)
      // avg = (11+12+...+110)/100 = (sum of 11 to 110)/100
      // sum = (110*111/2) - (10*11/2) = 6105 - 55 = 6050
      // avg = 60.5
      expect(metrics?.avg).toBe(60.5);
      expect(metrics?.max).toBe(110);
    });
  });

  describe('getMetrics', () => {
    it('returns null for an unknown operation', () => {
      const result = monitor.getMetrics('unknown_op_xyz');
      expect(result).toBeNull();
    });

    it('returns correct avg, p95, and max for a single sample', () => {
      monitor.measureTime('single_sample_op', 42);
      const metrics = monitor.getMetrics('single_sample_op');
      expect(metrics).toEqual({
        avg: 42,
        p95: 42,
        max: 42,
      });
    });

    it('calculates p95 correctly for multiple samples', () => {
      // Insert 20 samples: 1..20
      for (let i = 1; i <= 20; i++) {
        monitor.measureTime('p95_op', i);
      }
      const metrics = monitor.getMetrics('p95_op');
      expect(metrics).not.toBeNull();

      // avg = (1+2+...+20)/20 = 210/20 = 10.5
      expect(metrics?.avg).toBe(10.5);

      // p95Index = Math.floor(20 * 0.95) = 19
      // sorted[19] = 20
      expect(metrics?.p95).toBe(20);

      // max = 20
      expect(metrics?.max).toBe(20);
    });

    it('returns correct max value', () => {
      monitor.measureTime('max_op', 10);
      monitor.measureTime('max_op', 50);
      monitor.measureTime('max_op', 30);
      const metrics = monitor.getMetrics('max_op');
      expect(metrics?.max).toBe(50);
    });
  });
});
