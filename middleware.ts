import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 安全中间件
 * 为所有响应添加安全头部，防止常见攻击
 */

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. 内容安全策略 (CSP)
  // 防止XSS攻击，控制资源加载
  response.headers.set(
    'Content-Security-Policy',
    [
      // 默认策略：只允许同源资源
      "default-src 'self'",
      // 脚本：允许同源和内联（开发环境）
      process.env.NODE_ENV === 'production'
        ? "script-src 'self' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // 样式：允许同源和内联样式
      "style-src 'self' 'unsafe-inline'",
      // 图片：允许同源、数据URI和HTTPS
      "img-src 'self' data: https:",
      // 字体：允许同源
      "font-src 'self'",
      // 连接：允许同源和特定外部API
      "connect-src 'self' https://api.vercel-analytics.com",
      // 媒体：允许同源
      "media-src 'self'",
      // 对象：不允许
      "object-src 'none'",
      // 框架：不允许
      "frame-src 'none'",
      // 基础URI：只允许同源
      "base-uri 'self'",
      // 表单：只允许同源
      "form-action 'self'",
      // 允许升级HTTPS
      "upgrade-insecure-requests",
    ].join('; ')
  );

  // 2. HTTP Strict Transport Security (HSTS)
  // 强制HTTPS，防止协议降级攻击
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // 3. X-Content-Type-Options
  // 防止MIME类型嗅探
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 4. X-Frame-Options
  // 防止点击劫持攻击
  response.headers.set('X-Frame-Options', 'DENY');

  // 5. X-XSS-Protection
  // 启用浏览器XSS过滤器（针对旧版浏览器）
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // 6. Referrer-Policy
  // 控制引用信息泄露
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 7. Permissions-Policy
  // 控制浏览器功能API的使用
  response.headers.set(
    'Permissions-Policy',
    [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
    ].join(', ')
  );

  // 8. 防止缓存敏感信息
  if (request.url.includes('/api/')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  return response;
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下开头的：
     * - api (API routes)
     * - _next/static (静态文件)
     * - _next/image (图像优化)
     * - favicon.ico (favicon文件)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
