// 性能指标类型定义
export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fmp?: number; // First Meaningful Paint
  tti?: number; // Time to Interactive
}

// 性能条目类型定义
export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
  toJSON?: () => object;
}

// 导航时序类型定义
export interface PerformanceNavigationTiming extends PerformanceEntry {
  navigationStart: number;
  unloadEventStart: number;
  unloadEventEnd: number;
  redirectStart: number;
  redirectEnd: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  secureConnectionStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
}

// 性能监控配置类型定义
export interface PerformanceConfig {
  enableTracking: boolean;
  sampleRate: number; // 采样率 0-1
  endpoint?: string; // 数据上报端点
  includeDetails: boolean;
  thresholdWarning: Partial<PerformanceMetrics>;
  thresholdCritical: Partial<PerformanceMetrics>;
}

// 性能报告类型定义
export interface PerformanceReport {
  url: string;
  timestamp: number;
  userAgent: string;
  metrics: PerformanceMetrics;
  navigation: PerformanceNavigationTiming;
  resources: PerformanceResourceTiming[];
  vitals: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  score: {
    performance: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
  };
}

// 资源时序类型定义
export interface PerformanceResourceTiming extends PerformanceEntry {
  initiatorType: string;
  nextHopProtocol: string;
  workerStart: number;
  redirectStart: number;
  redirectEnd: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  secureConnectionStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
}

// 性能警告类型定义
export interface PerformanceWarning {
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  message: string;
  suggestions: string[];
}

// 性能对比类型定义
export interface PerformanceComparison {
  current: PerformanceMetrics;
  baseline: PerformanceMetrics;
  previous: PerformanceMetrics;
  improvement: {
    metric: keyof PerformanceMetrics;
    change: number;
    percentage: number;
    status: 'improved' | 'degraded' | 'unchanged';
  }[];
}

// Core Web Vitals 类型定义
export interface CoreWebVitals {
  lcp: {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    threshold: { good: number; poor: number };
  };
  fid: {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    threshold: { good: number; poor: number };
  };
  cls: {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    threshold: { good: number; poor: number };
  };
  ttfb: {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    threshold: { good: number; poor: number };
  };
}

// 性能优化建议类型定义
export interface PerformanceOptimization {
  category: 'network' | 'rendering' | 'images' | 'scripts' | 'css' | 'server';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implementation: string[];
}

// 全局类型声明
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export {};