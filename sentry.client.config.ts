/**
 * Sentry客户端配置
 * 错误监控和性能追踪
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',

  // 控制采样率
  tracesSampleRate: 0.1, // 10%的请求被追踪

  // 会话重放采样
  replaysSessionSampleRate: 0.1, // 10%的用户会话被记录
  replaysOnErrorSampleRate: 1.0, // 所有错误会话被记录

  // 环境
  environment: process.env.NODE_ENV,

  // 集成
  integrations: [
    // new Sentry.BrowserTracing({
    //   routingInstrumentation: Sentry.nextRouterInstrumentation,
    // }),
    // new Sentry.Replay(),
  ],

  // 过滤和清洗敏感信息
  beforeSend(event, hint) {
    // 过滤掉浏览器扩展错误
    if (event.extra?.browser) {
      return null;
    }

    // 过滤404错误（除非是特定重要页面）
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
    }

    // 清洗敏感信息
    if (event.request) {
      // 移除密码和令牌
      if (event.request.data) {
        try {
          const data = JSON.parse(event.request.data as string);
          delete data.password;
          delete data.token;
          delete data.apiKey;
          delete data.secret;
          event.request.data = JSON.stringify(data);
        } catch (e) {
          // 忽略JSON解析错误
        }
      }

      // 移除Cookie（除非必要）
      if (event.request.cookies) {
        delete event.request.cookies;
      }

      // 移除Authorization头
      if (event.request.headers) {
        delete event.request.headers.Authorization;
      }
    }

    return event;
  },

  // 设置用户信息
  initialScope: {
    tags: {
      component: 'client',
    },
  },
});

// 导出错误处理辅助函数
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    Sentry.captureException(error);
  });
};

export const captureMessage = (message: string, level?: Sentry.SeverityLevel) => {
  Sentry.captureMessage(message, level);
};

export const setUser = (user: { id: string; email: string; username?: string }) => {
  Sentry.setUser(user);
};

export const addBreadcrumb = (message: string, category?: string, level?: Sentry.SeverityLevel) => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    timestamp: Date.now(),
  });
};
