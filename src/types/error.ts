// 应用错误类型定义
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
  stack?: string;
  timestamp?: number;
}

// 验证错误类型定义
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  code?: string;
}

// API错误类型定义
export interface APIError {
  status: number;
  message: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

// 文章处理错误类型定义
export class PostError extends Error implements AppError {
  type: 'not_found' | 'invalid_format' | 'processing_error' | 'parse_error';
  code?: string;
  statusCode?: number;
  details?: unknown;
  timestamp?: number;
  slug?: string;
  originalError?: Error;

  constructor(
    message: string,
    type: PostError['type'],
    options?: {
      code?: string;
      statusCode?: number;
      slug?: string;
      originalError?: Error;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = 'PostError';
    this.type = type;
    this.code = options?.code;
    this.statusCode = options?.statusCode;
    this.slug = options?.slug;
    this.originalError = options?.originalError;
    this.details = options?.details;
    this.timestamp = Date.now();
  }
}

// 网络错误类型定义
export class NetworkError extends Error implements AppError {
  type: 'network' | 'timeout' | 'server_error' | 'client_error';
  code?: string;
  statusCode?: number;
  details?: unknown;
  timestamp?: number;
  url?: string;
  method?: string;
  timeout?: number;

  constructor(
    message: string,
    type: NetworkError['type'],
    options?: {
      code?: string;
      statusCode?: number;
      url?: string;
      method?: string;
      timeout?: number;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = 'NetworkError';
    this.type = type;
    this.code = options?.code;
    this.statusCode = options?.statusCode;
    this.url = options?.url;
    this.method = options?.method;
    this.timeout = options?.timeout;
    this.details = options?.details;
    this.timestamp = Date.now();
  }
}

// 搜索错误类型定义
export class SearchError extends Error implements AppError {
  type: 'index_error' | 'query_error' | 'result_error';
  code?: string;
  statusCode?: number;
  details?: unknown;
  timestamp?: number;
  query?: string;
  indexSize?: number;

  constructor(
    message: string,
    type: SearchError['type'],
    options?: {
      code?: string;
      statusCode?: number;
      query?: string;
      indexSize?: number;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = 'SearchError';
    this.type = type;
    this.code = options?.code;
    this.statusCode = options?.statusCode;
    this.query = options?.query;
    this.indexSize = options?.indexSize;
    this.details = options?.details;
    this.timestamp = Date.now();
  }
}

// 性能监控错误类型定义
export class PerformanceError extends Error implements AppError {
  type: 'metric_error' | 'tracking_error' | 'reporting_error';
  code?: string;
  statusCode?: number;
  details?: unknown;
  timestamp?: number;
  metric?: string;
  value?: number;

  constructor(
    message: string,
    type: PerformanceError['type'],
    options?: {
      code?: string;
      statusCode?: number;
      metric?: string;
      value?: number;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = 'PerformanceError';
    this.type = type;
    this.code = options?.code;
    this.statusCode = options?.statusCode;
    this.metric = options?.metric;
    this.value = options?.value;
    this.details = options?.details;
    this.timestamp = Date.now();
  }
}

// 错误处理器类型定义
export type ErrorHandler = (error: AppError) => void;

// 异步错误处理器类型定义
export type AsyncErrorHandler = (error: AppError) => Promise<void>;

// Result 类型定义
export type Result<T, E = AppError> = SuccessResult<T> | ErrorResult<E>;

export interface SuccessResult<T> {
  success: true;
  data: T;
}

export interface ErrorResult<E> {
  success: false;
  error: E;
}

// 错误边界状态类型定义
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    componentStack: string;
  } | null;
  errorId: string | null;
}

// 错误报告类型定义
export interface ErrorReport {
  id: string;
  timestamp: number;
  error: AppError;
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    sessionId?: string;
    buildVersion?: string;
    environment: 'development' | 'staging' | 'production';
  };
  breadcrumbs: Array<{
    timestamp: number;
    type: 'navigation' | 'user' | 'network' | 'console' | 'error';
    message: string;
    data?: unknown;
  }>;
  tags: string[];
}

// 错误恢复策略类型定义
export interface ErrorRecoveryStrategy {
  type: 'retry' | 'fallback' | 'ignore' | 'redirect';
  maxRetries?: number;
  delay?: number;
  fallbackComponent?: React.ComponentType;
  redirectUrl?: string;
}

// 错误级别类型定义
export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';

// 错误分类类型定义
export type ErrorCategory =
  | 'validation'
  | 'network'
  | 'parsing'
  | 'rendering'
  | 'performance'
  | 'security'
  | 'business'
  | 'infrastructure'
  | 'user'
  | 'unknown';

// 错误上下文类型定义
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

// 错误工厂函数类型定义
export interface ErrorFactory {
  createValidationError: (field: string, message: string, value?: unknown) => ValidationError;
  createPostError: (type: PostError['type'], message: string, slug?: string) => PostError;
  createNetworkError: (type: NetworkError['type'], message: string, url?: string) => NetworkError;
  createSearchError: (type: SearchError['type'], message: string, query?: string) => SearchError;
  createPerformanceError: (type: PerformanceError['type'], message: string, metric?: string) => PerformanceError;
}

// 错误监控配置类型定义
export interface ErrorMonitoringConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  environment: string;
  sampleRate: number;
  maxErrors: number;
  ignoredErrors: string[];
  beforeSend?: (error: AppError) => AppError | null;
  afterSend?: (error: AppError, reportId: string) => void;
}

// 工具函数类型定义
export type ResultAsync<T, E = AppError> = Promise<Result<T, E>>;

export type Option<T> = T | null | undefined;

export type Try<T, E = AppError> = Result<T, E>;

// 错误代码常量
export const ERROR_CODES = {
  // 通用错误
  UNKNOWN: 'UNKNOWN',
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // 文章错误
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  POST_PARSE_ERROR: 'POST_PARSE_ERROR',
  POST_INVALID_FORMAT: 'POST_INVALID_FORMAT',

  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',

  // 搜索错误
  SEARCH_INDEX_ERROR: 'SEARCH_INDEX_ERROR',
  SEARCH_QUERY_ERROR: 'SEARCH_QUERY_ERROR',
  SEARCH_RESULT_ERROR: 'SEARCH_RESULT_ERROR',

  // 性能错误
  PERFORMANCE_METRIC_ERROR: 'PERFORMANCE_METRIC_ERROR',
  PERFORMANCE_TRACKING_ERROR: 'PERFORMANCE_TRACKING_ERROR',
  PERFORMANCE_REPORTING_ERROR: 'PERFORMANCE_REPORTING_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];