'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useEffect } from 'react';

/**
 * Web分析组件
 * 集成Vercel Analytics和Speed Insights
 */
export function WebAnalytics() {
  useEffect(() => {
    // 页面访问统计
    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] Page view:', window.location.pathname);
      }

      // 记录性能指标
      const reportWebVitals = (metric: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Analytics] Web Vital:', metric);
        }
      };

      // 监控性能
      if ('web-vitals' in window) {
        // @ts-ignore
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(reportWebVitals);
          getFID(reportWebVitals);
          getFCP(reportWebVitals);
          getLCP(reportWebVitals);
          getTTFB(reportWebVitals);
        });
      }
    }
  }, []);

  return (
    <>
      <Analytics
        beforeSend={(event: any) => {
          // 过滤敏感信息
          if (event.data?.url?.includes('/api/')) {
            return null;
          }
          return event;
        }}
      />
      <SpeedInsights />
    </>
  );
}

/**
 * 用户行为追踪Hook
 */
export function useAnalytics() {
  const trackPageView = (path: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
      });
    }
  };

  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackSearch = (searchTerm: string) => {
    trackEvent('search', 'engagement', searchTerm);
  };

  const trackPostView = (postSlug: string) => {
    trackEvent('view_post', 'content', postSlug);
  };

  const trackTagClick = (tag: string) => {
    trackEvent('click_tag', 'engagement', tag);
  };

  const trackError = (error: string, page: string) => {
    trackEvent('error', 'exception', error);
  };

  return {
    trackPageView,
    trackEvent,
    trackSearch,
    trackPostView,
    trackTagClick,
    trackError,
  };
}

/**
 * 性能监控Hook
 */
export function usePerformanceMonitor() {
  const measurePageLoad = (pageName: string) => {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    const metrics = {
      page: pageName,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${pageName}:`, metrics);
    }

    // 可以发送到分析服务
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      }).catch(console.error);
    }

    return metrics;
  };

  const measureComponent = (componentName: string) => {
    const startTime = performance.now();

    return {
      end: () => {
        const duration = performance.now() - startTime;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Component] ${componentName}: ${duration.toFixed(2)}ms`);
        }
        return duration;
      },
    };
  };

  return {
    measurePageLoad,
    measureComponent,
  };
}
