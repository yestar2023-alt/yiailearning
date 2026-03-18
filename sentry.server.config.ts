/**
 * Sentry服务端配置
 * API错误监控和性能追踪
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',

  tracesSampleRate: 0.1,

  environment: process.env.NODE_ENV,

  // 过滤敏感错误
  beforeSend(event, hint) {
    // 过滤开发环境错误
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // 过滤健康检查
    if (event.request?.url?.includes('/health')) {
      return null;
    }

    return event;
  },

  initialScope: {
    tags: {
      component: 'server',
    },
  },
});
