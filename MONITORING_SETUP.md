# 监控与追踪配置

## 📊 当前状态
- 基础性能监控: ✅ 已实现 (Performance.tsx组件)
- Google Analytics: ⚠️ 未配置
- 错误追踪: ⚠️ 未配置
- 用户行为分析: ⚠️ 未配置

## 🎯 监控方案

### 1. 错误监控 (Sentry)

#### 安装
```bash
npm install @sentry/nextjs
```

#### 配置
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// src/app/global-error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  Sentry.captureException(error);

  return (
    <html>
      <body>
        <ErrorBoundary error={error} />
      </body>
    </html>
  );
}
```

### 2. 性能监控 (Vercel Analytics)

#### 安装
```bash
npm install @vercel/analytics
```

#### 配置
```tsx
// src/components/Analytics.tsx
'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function WebAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

### 3. 用户行为分析

```typescript
// src/lib/analytics.ts
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

export class AnalyticsHelper {
  static track(event: AnalyticsEvent) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, event.properties);
    }
  }

  static trackPageView(url: string) {
    this.track({
      name: 'page_view',
      properties: { page_path: url },
    });
  }

  static trackPostView(postSlug: string) {
    this.track({
      name: 'view_post',
      properties: { post_slug: postSlug },
    });
  }

  static trackSearch(query: string) {
    this.track({
      name: 'search',
      properties: { search_query: query },
    });
  }

  static trackTagClick(tag: string) {
    this.track({
      name: 'tag_click',
      properties: { tag },
    });
  }
}
```

### 4. 自定义指标收集

```typescript
// src/lib/metrics.ts
export class MetricsCollector {
  private static metrics: Record<string, number> = {};

  static record(metric: string, value: number) {
    this.metrics[metric] = value;

    // 发送到分析服务
    if (process.env.NODE_ENV === 'production') {
      // 发送到自定义端点
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric, value, timestamp: Date.now() }),
      }).catch(console.error);
    }
  }

  static measureTime<T>(metric: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    this.record(metric, end - start);
    return result;
  }

  static async measureTimeAsync<T>(metric: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    this.record(metric, end - start);
    return result;
  }
}
```

### 5. 监控仪表板

```tsx
// src/components/Dashboard.tsx
'use client';

import { useEffect, useState } from 'react';

interface DashboardMetrics {
  pageViews: number;
  uniqueVisitors: number;
  averageLoadTime: number;
  errorRate: number;
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    // 定期获取指标
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics/dashboard');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // 30秒刷新

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard title="页面浏览量" value={metrics.pageViews} />
      <MetricCard title="独立访客" value={metrics.uniqueVisitors} />
      <MetricCard title="平均加载时间" value={`${metrics.averageLoadTime.toFixed(2)}ms`} />
      <MetricCard title="错误率" value={`${metrics.errorRate.toFixed(2)}%`} />
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
```

## 📈 监控指标

### 业务指标
- 页面浏览量 (PV)
- 独立访客 (UV)
- 用户停留时间
- 跳出率

### 技术指标
- 页面加载时间
- API响应时间
- 错误率
- 可用性

### 内容指标
- 文章阅读量
- 热门标签
- 搜索频率
- 分享次数

## 🚨 告警配置

```typescript
// src/lib/alerts.ts
export class AlertManager {
  static async checkMetrics() {
    const metrics = await this.getMetrics();

    const alerts = [];

    if (metrics.errorRate > 5) {
      alerts.push({
        type: 'error',
        message: `错误率过高: ${metrics.errorRate}%`,
        severity: 'critical',
      });
    }

    if (metrics.averageLoadTime > 3000) {
      alerts.push({
        type: 'performance',
        message: `页面加载时间过长: ${metrics.averageLoadTime}ms`,
        severity: 'warning',
      });
    }

    return alerts;
  }

  private static async getMetrics() {
    // 从监控系统获取指标
    return {
      errorRate: 2.5,
      averageLoadTime: 2500,
      // ...
    };
  }
}
```

## 📊 报告自动化

```javascript
// scripts/generate-report.js
const fs = require('fs');
const path = require('path');

function generateWeeklyReport() {
  const report = {
    period: '2023-10-01 to 2023-10-07',
    metrics: {
      totalPageViews: 10000,
      uniqueVisitors: 2500,
      averageSessionDuration: 180,
      bounceRate: 0.45,
      topPosts: [
        { title: 'AI入门指南', views: 1500 },
        { title: 'AI工具推荐', views: 1200 },
      ],
      topTags: [
        { tag: 'AI', count: 800 },
        { tag: '机器学习', count: 600 },
      ],
    },
    recommendations: [
      '增加AI工具相关文章',
      '优化移动端体验',
      '添加更多示例代码',
    ],
  };

  const reportPath = path.join(__dirname, '../reports/weekly-2023-10-01.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ Weekly report generated: ${reportPath}`);
}

generateWeeklyReport();
```

## 🎯 实施计划

### Week 1: 基础监控
- [ ] 配置Sentry
- [ ] 设置Vercel Analytics
- [ ] 实施基础指标收集

### Week 2: 用户分析
- [ ] 配置Google Analytics
- [ ] 实施事件追踪
- [ ] 创建分析仪表板

### Week 3: 告警与报告
- [ ] 配置告警规则
- [ ] 自动报告生成
- [ ] 监控面板优化

## 📚 参考资源

- [Sentry错误监控](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
