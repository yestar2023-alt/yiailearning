import { NextRequest, NextResponse } from 'next/server';

/**
 * 性能数据收集 API 端点
 * 接收来自客户端的性能指标数据
 */

interface PerformanceMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  timestamp?: number;
  url?: string;
  userAgent?: string;
}

// 存储性能数据的内存缓存（生产环境应使用数据库或监控服务）
let performanceData: PerformanceMetric[] = [];

// 限制存储的指标数量
const MAX_METRICS = 100;

/**
 * POST - 接收性能指标数据
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求体
    if (!body || !body.name || typeof body.value !== 'number') {
      return NextResponse.json(
        { error: '无效的性能指标数据' },
        { status: 400 }
      );
    }

    // 添加时间戳和来源信息
    const metric: PerformanceMetric = {
      name: body.name,
      value: body.value,
      id: body.id || `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      delta: body.delta || body.value,
      rating: calculateRating(body.name, body.value),
      timestamp: Date.now(),
      url: request.headers.get('referer') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    // 添加到缓存
    performanceData.push(metric);

    // 限制缓存大小
    if (performanceData.length > MAX_METRICS) {
      performanceData = performanceData.slice(-MAX_METRICS);
    }

    // 在开发环境输出日志
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance API] 收到指标:', metric);
    }

    // 可以在这里发送到外部监控服务（如 Sentry, Datadog 等）
    // await sendToExternalService(metric);

    return NextResponse.json({
      success: true,
      message: '性能指标已接收',
    });
  } catch (error) {
    console.error('[Performance API] 处理请求失败:', error);

    return NextResponse.json(
      { error: '处理性能指标失败' },
      { status: 500 }
    );
  }
}

/**
 * GET - 获取性能数据统计
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metricName = searchParams.get('metric');

    let filteredData = performanceData;

    // 如果指定了指标名称，过滤数据
    if (metricName) {
      filteredData = performanceData.filter((m) => m.name === metricName);
    }

    // 计算统计数据
    const stats = calculateStats(filteredData);

    return NextResponse.json({
      success: true,
      stats,
      count: filteredData.length,
    });
  } catch (error) {
    console.error('[Performance API] 获取统计数据失败:', error);

    return NextResponse.json(
      { error: '获取性能数据失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - 清理性能数据
 */
export async function DELETE() {
  try {
    performanceData = [];

    return NextResponse.json({
      success: true,
      message: '性能数据已清理',
    });
  } catch (error) {
    console.error('[Performance API] 清理数据失败:', error);

    return NextResponse.json(
      { error: '清理数据失败' },
      { status: 500 }
    );
  }
}

/**
 * 根据指标值计算评级
 */
function calculateRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    // LCP (Largest Contentful Paint)
    LCP: [2500, 4000],
    // FID (First Input Delay)
    FID: [100, 300],
    // CLS (Cumulative Layout Shift)
    CLS: [0.1, 0.25],
    // FCP (First Contentful Paint)
    FCP: [1800, 3000],
    // TTFB (Time to First Byte)
    TTFB: [800, 1800],
    // 自定义指标
    DOM: [200, 500],
    Load: [300, 800],
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold[0]) return 'good';
  if (value <= threshold[1]) return 'needs-improvement';
  return 'poor';
}

/**
 * 计算统计数据
 */
function calculateStats(data: PerformanceMetric[]) {
  if (data.length === 0) {
    return {
      count: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      p95: 0,
      p99: 0,
      ratingDistribution: {
        good: 0,
        'needs-improvement': 0,
        poor: 0,
      },
    };
  }

  // 提取值并排序
  const values = data.map((m) => m.value).sort((a, b) => a - b);
  const count = values.length;

  // 计算百分位数
  const p95Index = Math.floor(count * 0.95);
  const p99Index = Math.floor(count * 0.99);

  // 计算评级分布
  const ratingDistribution = {
    good: data.filter((m) => m.rating === 'good').length,
    'needs-improvement': data.filter((m) => m.rating === 'needs-improvement').length,
    poor: data.filter((m) => m.rating === 'poor').length,
  };

  return {
    count,
    average: values.reduce((a, b) => a + b, 0) / count,
    median: values[Math.floor(count / 2)],
    min: values[0],
    max: values[count - 1],
    p95: values[p95Index] || 0,
    p99: values[p99Index] || 0,
    ratingDistribution,
  };
}

/**
 * 发送到外部监控服务（示例）
 */
async function sendToExternalService(metric: PerformanceMetric) {
  // TODO: 集成外部监控服务
  // 例如：
  // - Sentry
  // - Datadog
  // - New Relic
  // - Google Analytics
  // - 自建监控系统

  // 示例：发送到控制台（在生产环境中应替换为真实的监控服务）
  if (process.env.NODE_ENV === 'production') {
    console.log('[External Monitor] 发送指标:', metric);
  }
}
