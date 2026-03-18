import { AppError, PostError, NetworkError, SearchError, PerformanceError, Result, SuccessResult, ErrorResult } from '@/types';

// 错误工厂类
export class ErrorFactory {
  static createValidationError(field: string, message: string, value?: unknown): AppError {
    return {
      message,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: { field, value },
      timestamp: Date.now(),
    };
  }

  static createPostError(type: PostError['type'], message: string, slug?: string, originalError?: Error): PostError {
    return new PostError(message, type, {
      slug,
      originalError,
    });
  }

  static createNetworkError(type: NetworkError['type'], message: string, url?: string, statusCode?: number): NetworkError {
    return new NetworkError(message, type, {
      url,
      statusCode,
    });
  }

  static createSearchError(type: SearchError['type'], message: string, query?: string): SearchError {
    return new SearchError(message, type, {
      query,
    });
  }

  static createPerformanceError(type: PerformanceError['type'], message: string, metric?: string, value?: number): PerformanceError {
    return new PerformanceError(message, type, {
      metric,
      value,
    });
  }

  static fromUnknown(error: unknown, defaultMessage: string = 'Unknown error occurred'): AppError {
    if (error instanceof Error) {
      return {
        message: error.message || defaultMessage,
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        stack: error.stack,
        timestamp: Date.now(),
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        timestamp: Date.now(),
      };
    }

    return {
      message: defaultMessage,
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      details: error,
      timestamp: Date.now(),
    };
  }
}

// Result 工具函数
export class ResultUtils {
  static success<T>(data: T): SuccessResult<T> {
    return {
      success: true,
      data,
    };
  }

  static failure<E>(error: E): ErrorResult<E> {
    return {
      success: false,
      error,
    };
  }

  static async fromPromise<T, E = AppError>(
    promise: Promise<T>,
    errorFactory?: (error: unknown) => E
  ): Promise<Result<T, E>> {
    try {
      const data = await promise;
      return ResultUtils.success(data);
    } catch (error) {
      const processedError = errorFactory ? errorFactory(error) : ErrorFactory.fromUnknown(error) as E;
      return ResultUtils.failure(processedError);
    }
  }

  static isResult<T, E>(value: unknown): value is Result<T, E> {
    return typeof value === 'object' && value !== null && 'success' in value;
  }

  static isSuccess<T, E>(result: Result<T, E>): result is SuccessResult<T> {
    return result.success === true;
  }

  static isFailure<T, E>(result: Result<T, E>): result is ErrorResult<E> {
    return result.success === false;
  }
}

// 错误处理工具类
export class ErrorHandler {
  private static errors: AppError[] = [];
  private static maxErrors = 100;

  // 记录错误
  static log(error: AppError): void {
    console.error('[ErrorHandler]', error);

    // 添加到错误队列
    this.errors.push(error);

    // 保持队列大小
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  // 获取最近的错误
  static getRecentErrors(count: number = 10): AppError[] {
    return this.errors.slice(-count);
  }

  // 清除错误记录
  static clearErrors(): void {
    this.errors = [];
  }

  // 安全执行函数
  static async safeExecute<T>(
    fn: () => Promise<T>,
    errorFactory?: (error: unknown) => AppError
  ): Promise<Result<T, AppError>> {
    return ResultUtils.fromPromise(fn(), errorFactory || ErrorFactory.fromUnknown);
  }

  // 处理Post错误
  static handlePostError(error: unknown, slug?: string): PostError {
    if (error instanceof PostError) {
      this.log(error);
      return error;
    }

    const postError = ErrorFactory.createPostError(
      'processing_error',
      error instanceof Error ? error.message : 'Unknown post processing error',
      slug,
      error instanceof Error ? error : undefined
    );

    this.log(postError);
    return postError;
  }

  // 处理网络错误
  static handleNetworkError(error: unknown, url?: string): NetworkError {
    if (error instanceof NetworkError) {
      this.log(error);
      return error;
    }

    let type: NetworkError['type'] = 'network';
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        type = 'timeout';
      } else if ('status' in error) {
        type = Number((error as any).status) >= 500 ? 'server_error' : 'client_error';
      }
    }

    const networkError = ErrorFactory.createNetworkError(
      type,
      error instanceof Error ? error.message : 'Unknown network error',
      url,
      error instanceof Error && 'status' in error ? Number((error as any).status) : undefined
    );

    this.log(networkError);
    return networkError;
  }

  // 检查错误是否可以重试
  static isRetryable(error: AppError): boolean {
    // 网络错误通常可以重试
    if (error instanceof NetworkError) {
      return ['network', 'timeout', 'server_error'].includes(error.type);
    }

    // Post错误通常不重试
    if (error instanceof PostError) {
      return false;
    }

    // 某些服务器错误可以重试
    if (error.statusCode && error.statusCode >= 500) {
      return true;
    }

    return false;
  }

  // 创建重试函数
  static createRetryableFunction<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): () => Promise<T> {
    return async () => {
      let lastError: unknown;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          const appError = ErrorFactory.fromUnknown(error);

          if (!this.isRetryable(appError) || attempt === maxRetries) {
            throw error;
          }

          // 指数退避
          const backoffDelay = delay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }

      throw lastError;
    };
  }
}

// 异步错误包装器
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  errorFactory?: (error: unknown, ...args: T) => AppError
) {
  return async (...args: T): Promise<Result<R, AppError>> => {
    try {
      const result = await fn(...args);
      return ResultUtils.success(result);
    } catch (error) {
      const appError = errorFactory
        ? errorFactory(error, ...args)
        : ErrorFactory.fromUnknown(error);

      ErrorHandler.log(appError);
      return ResultUtils.failure(appError);
    }
  };
}

// 全局错误处理器（在客户端使用）
export function setupGlobalErrorHandler() {
  if (typeof window !== 'undefined') {
    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      const error = ErrorFactory.fromUnknown(event.reason, 'Unhandled Promise Rejection');
      ErrorHandler.log(error);

      // 在开发模式下显示详细错误
      if (process.env.NODE_ENV === 'development') {
        console.error('Unhandled Promise Rejection:', event.reason);
      }
    });

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      const error = ErrorFactory.fromUnknown(event.error, 'Global Error');
      ErrorHandler.log(error);

      // 在开发模式下显示详细错误
      if (process.env.NODE_ENV === 'development') {
        console.error('Global Error:', event.error);
      }
    });
  }
}