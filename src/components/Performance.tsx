'use client';

import { useEffect } from 'react';

// 性能指标类型
interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export default function Performance() {
  useEffect(() => {
    // 检查性能API是否可用
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const metrics: PerformanceMetrics = {};

    // 获取First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }

    // 获取Navigation Timing指标
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      metrics.ttfb = nav.responseStart - nav.requestStart;
    }

    // 监听Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            metrics.lcp = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // 监听First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              metrics.fid = entry.processingStart - entry.startTime;
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // 监听Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          metrics.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // 页面卸载时发送性能数据
        const sendMetrics = () => {
          if (process.env.NODE_ENV === 'production') {
            // 这里可以发送到你的分析服务
            console.log('Performance Metrics:', metrics);
            
            // 示例：发送到Google Analytics
            if (window.gtag) {
              window.gtag('event', 'performance_metrics', {
                custom_map: {
                  metric_fcp: 'fcp',
                  metric_lcp: 'lcp',
                  metric_fid: 'fid',
                  metric_cls: 'cls',
                  metric_ttfb: 'ttfb'
                },
                fcp: metrics.fcp,
                lcp: metrics.lcp,
                fid: metrics.fid,
                cls: metrics.cls,
                ttfb: metrics.ttfb
              });
            }
          }
        };

        // 页面可见性变化时发送数据
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            sendMetrics();
          }
        });

        // 页面卸载前发送数据
        window.addEventListener('beforeunload', sendMetrics);
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }, []);

  return null; // 这是一个隐形组件，不渲染任何内容
}

// 声明全局gtag类型
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
} 