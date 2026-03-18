'use client';

import { useState, useEffect } from 'react';
import { useAnalytics, usePerformanceMonitor } from './WebAnalytics';

/**
 * 监控仪表板组件
 * 显示关键指标和健康状态
 */
interface DashboardMetrics {
  pageViews: number;
  uniqueVisitors: number;
  averageLoadTime: number;
  errorRate: number;
  uptime: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const analytics = useAnalytics();
  const { measurePageLoad } = usePerformanceMonitor();

  useEffect(() => {
    // 模拟获取监控数据
    const fetchMetrics = async () => {
      try {
        // 实际项目中应该从API获取
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 模拟数据
        const mockMetrics: DashboardMetrics = {
          pageViews: 1250,
          uniqueVisitors: 890,
          averageLoadTime: 1250,
          errorRate: 0.8,
          uptime: 99.9,
          coreWebVitals: {
            lcp: 2100,
            fid: 85,
            cls: 0.08,
          },
        };

        setMetrics(mockMetrics);
      } catch (error) {
        console.error('获取监控数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();

    // 自动刷新（每30秒）
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // 按需加载性能指标
  useEffect(() => {
    const metrics = measurePageLoad('dashboard');
    return () => {
      if (metrics) {
        console.log('[Dashboard] 加载完成:', metrics);
      }
    };
  }, [measurePageLoad]);

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-36 right-4 z-40 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
        aria-label="监控仪表板"
        title="查看监控数据"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setShowPanel(false)}
        aria-hidden="true"
      />

      {/* 面板 */}
      <div
        className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="monitoring-title"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="monitoring-title" className="text-xl font-bold">
            监控仪表板
          </h2>
          <button
            onClick={() => setShowPanel(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="关闭"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">正在加载...</p>
            </div>
          ) : metrics ? (
            <div className="space-y-6">
              {/* 概览指标 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">概览</h3>
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    title="页面浏览量"
                    value={metrics.pageViews.toLocaleString()}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    }
                    trend="+12.5%"
                  />
                  <MetricCard
                    title="独立访客"
                    value={metrics.uniqueVisitors.toLocaleString()}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    }
                    trend="+8.3%"
                  />
                  <MetricCard
                    title="平均加载时间"
                    value={`${metrics.averageLoadTime.toFixed(0)}ms`}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    }
                    trend="-5.2%"
                    good={metrics.averageLoadTime < 2000}
                  />
                  <MetricCard
                    title="错误率"
                    value={`${metrics.errorRate.toFixed(1)}%`}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    }
                    trend="-2.1%"
                    good={metrics.errorRate < 1}
                  />
                </div>
              </div>

              {/* Core Web Vitals */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
                <div className="space-y-3">
                  <WebVitalMetric
                    name="LCP (最大内容绘制)"
                    value={metrics.coreWebVitals.lcp}
                    unit="ms"
                    threshold={2500}
                  />
                  <WebVitalMetric
                    name="FID (首次输入延迟)"
                    value={metrics.coreWebVitals.fid}
                    unit="ms"
                    threshold={100}
                  />
                  <WebVitalMetric
                    name="CLS (累积布局偏移)"
                    value={metrics.coreWebVitals.cls}
                    unit=""
                    threshold={0.1}
                    isDecimal
                  />
                </div>
              </div>

              {/* 系统状态 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">系统状态</h3>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-800 dark:text-green-200">
                      系统运行正常
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                    正常运行时间: {metrics.uptime}%
                  </p>
                </div>
              </div>

              {/* 快捷操作 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">快捷操作</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => analytics.trackEvent('refresh_metrics', 'dashboard')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    刷新数据
                  </button>
                  <button
                    onClick={() => window.open('/api/analytics/export', '_blank')}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded transition-colors"
                  >
                    导出报告
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              无法加载监控数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  good,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  good?: boolean;
}) {
  const isPositive = trend.startsWith('+');
  const isGood = good ?? (isPositive ? title.includes('错误') === false : true);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-600 dark:text-gray-400">{icon}</div>
        <span
          className={`text-xs font-medium ${
            isGood
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
    </div>
  );
}

function WebVitalMetric({
  name,
  value,
  unit,
  threshold,
  isDecimal = false,
}: {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  isDecimal?: boolean;
}) {
  const isGood = value < threshold;
  const formattedValue = isDecimal ? value.toFixed(3) : `${value}${unit}`;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          目标: &lt;{threshold}{unit}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {formattedValue}
        </span>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            isGood
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {isGood ? '良好' : '需改进'}
        </span>
      </div>
    </div>
  );
}
