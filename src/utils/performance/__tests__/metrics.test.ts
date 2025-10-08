import { jest } from '@jest/globals';
import { PerformanceMetrics } from '../metrics';
import { Logger } from '../../logger';

// Mock the Logger
jest.mock('../../logger', () => ({
  Logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock performance.now()
const mockPerformanceNow = jest.fn();
global.performance = {
  ...global.performance,
  now: mockPerformanceNow,
};

describe('PerformanceMetrics', () => {
  let metrics: PerformanceMetrics;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);
    // Reset singleton instance
    (PerformanceMetrics as unknown as { instance: undefined }).instance = undefined;
    metrics = PerformanceMetrics.getInstance();
  });

  describe('getInstance', () => {
    it('returns a singleton instance', () => {
      const instance1 = PerformanceMetrics.getInstance();
      const instance2 = PerformanceMetrics.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('creates new instance only once', () => {
      expect(PerformanceMetrics.getInstance()).toBeInstanceOf(PerformanceMetrics);
    });
  });

  describe('measureTime', () => {
    it('measures time duration correctly', () => {
      mockPerformanceNow.mockReturnValue(2000); // End time
      const startTime = 1000;

      metrics.measureTime('test-operation', startTime);

      // Duration should be 2000 - 1000 = 1000ms
      expect(mockPerformanceNow).toHaveBeenCalled();
    });

    it('logs warning for slow operations', () => {
      mockPerformanceNow.mockReturnValue(2500); // End time
      const startTime = 1000; // Duration will be 1500ms > 1000ms threshold

      metrics.measureTime('slow-operation', startTime);

      expect(Logger.warn).toHaveBeenCalledWith('Slow operation detected', {
        operation: 'slow-operation',
        duration: 1500,
        timestamp: expect.any(String)
      });
    });

    it('does not log warning for fast operations', () => {
      mockPerformanceNow.mockReturnValue(1500); // End time
      const startTime = 1000; // Duration will be 500ms < 1000ms threshold

      metrics.measureTime('fast-operation', startTime);

      expect(Logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('memory management', () => {
    it('limits number of stored metrics', () => {
      // Add more than MAX_METRICS (1000) entries
      for (let i = 0; i < 1005; i++) {
        mockPerformanceNow.mockReturnValue(1000 + i);
        metrics.measureTime(`operation-${i}`, 1000);
      }

      // Verify metrics array doesn't exceed limit
      const storedMetrics = (metrics as unknown as { metrics: unknown[] }).metrics;
      expect(storedMetrics.length).toBeLessThanOrEqual(1000);
    });

    it('removes oldest metrics when limit exceeded', () => {
      // Add exactly MAX_METRICS + 1 entries
      for (let i = 0; i < 1001; i++) {
        mockPerformanceNow.mockReturnValue(1000 + i);
        metrics.measureTime(`operation-${i}`, 1000);
      }

      const storedMetrics = (metrics as unknown as { metrics: Array<{ name: string }> }).metrics;
      expect(storedMetrics.length).toBe(1000);
      // First metric should be operation-1, not operation-0
      expect(storedMetrics[0].name).toBe('operation-1');
    });
  });

  describe('metric storage', () => {
    it('stores metrics with correct structure', () => {
      const originalDateNow = Date.now;
      const mockTimestamp = 1234567890;
      Date.now = jest.fn(() => mockTimestamp);

      mockPerformanceNow.mockReturnValue(1500);
      metrics.measureTime('test-metric', 1000);

      const storedMetrics = (metrics as unknown as { 
        metrics: Array<{ name: string; value: number; timestamp: number }> 
      }).metrics;
      expect(storedMetrics).toHaveLength(1);
      expect(storedMetrics[0]).toEqual({
        name: 'test-metric',
        value: 500, // 1500 - 1000
        timestamp: mockTimestamp
      });

      Date.now = originalDateNow;
    });
  });

  describe('performance timing accuracy', () => {
    it('calculates duration correctly with decimal values', () => {
      mockPerformanceNow.mockReturnValue(1000.555);
      const startTime = 1000.123;

      metrics.measureTime('precise-operation', startTime);

      const storedMetrics = (metrics as unknown as { 
        metrics: Array<{ value: number }> 
      }).metrics;
      expect(storedMetrics[0].value).toBeCloseTo(0.432, 3);
    });
  });
});