'use client';

import { useEffect, useState } from 'react';
import type { Metric } from 'web-vitals';

interface PerformanceMonitorProps {
  onReport?: (metric: Metric) => void;
}

/**
 * Web Vitals性能监控组件
 * 自动收集并上报Core Web Vitals指标
 */
export function PerformanceMonitor({ onReport }: PerformanceMonitorProps) {
  useEffect(() => {
    // 使用原生Performance API进行基础监控
    const measurePerformance = () => {
      if (typeof window === 'undefined' || !window.performance) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!navigation) return;

      // 收集性能指标
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
      };

      // 上报指标
      if (onReport) {
        Object.entries(metrics).forEach(([name, value]) => {
          const metric = {
            name,
            value,
            delta: value,
            id: `metric_${Date.now()}_${name}`,
          } as Metric;
          onReport(metric);
        });
      }

      // 开发环境输出
      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance] 页面加载性能指标:', metrics);
      }
    };

    // 页面加载完成后测量
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, [onReport]);

  return null;
}

/**
 * 根据指标值获取评级
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    // LCP (Largest Contentful Paint)
    LCP: [2500, 4000],
    // FID (First Input Delay) - 已被INP取代但仍支持
    FID: [100, 300],
    // CLS (Cumulative Layout Shift)
    CLS: [0.1, 0.25],
    // FCP (First Contentful Paint)
    FCP: [1800, 3000],
    // TTFB (Time to First Byte)
    TTFB: [800, 1800],
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold[0]) return 'good';
  if (value <= threshold[1]) return 'needs-improvement';
  return 'poor';
}

/**
 * 性能指标展示组件
 */
interface PerformanceStatsProps {
  className?: string;
}

export function PerformanceStats({ className = '' }: PerformanceStatsProps) {
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    // 收集页面性能指标
    const collectMetrics = () => {
      if (typeof window === 'undefined' || !window.performance) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!navigation) return;

      const metrics = {
        TTFB: navigation.responseStart - navigation.requestStart,
        FCP: navigation.loadEventStart,
        DOM: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        Load: navigation.loadEventEnd - navigation.loadEventStart,
      };

      setStats(metrics);
    };

    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    return () => {
      window.removeEventListener('load', collectMetrics);
    };
  }, []);

  if (Object.keys(stats).length === 0) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Core Web Vitals
      </h3>

      <div className="space-y-2">
        {Object.entries(stats).map(([name, value]) => (
          <div key={name} className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">{name}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-gray-900 dark:text-white">
                {value.toFixed(0)}ms
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-xs ${getRating(name, value) === 'good'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : getRating(name, value) === 'needs-improvement'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
              >
                {getRating(name, value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
