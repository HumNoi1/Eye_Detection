/**
 * Hook for tracking and visualizing performance metrics
 */

import { useState, useEffect, useCallback } from 'react';

export type MetricPoint = {
  timestamp: number;
  value: number;
};

export type PerformanceMetrics = {
  fps: MetricPoint[];
  latency: MetricPoint[];
  memory?: MetricPoint[];
};

const MAX_POINTS = 60; // Keep last 60 data points (~1 minute at 1fps)

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: [],
    latency: [],
    memory: []
  });

  const addMetric = useCallback((type: 'fps' | 'latency' | 'memory', value: number) => {
    setMetrics(prev => {
      const newPoint: MetricPoint = {
        timestamp: Date.now(),
        value
      };

      const updated = [...(prev[type] || []), newPoint];
      const trimmed = updated.slice(-MAX_POINTS);

      return {
        ...prev,
        [type]: trimmed
      };
    });
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics({
      fps: [],
      latency: [],
      memory: []
    });
  }, []);

  const getStats = useCallback((type: 'fps' | 'latency' | 'memory') => {
    const data = metrics[type] || [];
    if (data.length === 0) return { min: 0, max: 0, avg: 0, current: 0 };

    const values = data.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const current = values[values.length - 1] || 0;

    return { min, max, avg, current };
  }, [metrics]);

  // Track memory usage
  useEffect(() => {
    const interval = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ('memory' in performance && (performance as any).memory) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memoryInfo = (performance as any).memory;
        const usedMB = memoryInfo.usedJSHeapSize / 1048576; // Convert to MB
        addMetric('memory', usedMB);
      }
    }, 2000); // Every 2 seconds

    return () => clearInterval(interval);
  }, [addMetric]);

  return {
    metrics,
    addMetric,
    clearMetrics,
    getStats
  };
}
