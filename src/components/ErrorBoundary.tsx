'use client';

import React, { Component, ReactNode } from 'react';
import { ErrorProps } from '@/types';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    componentStack: string;
  } | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode; onError?: (error: Error, errorInfo: any) => void },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 生成唯一的错误ID
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      errorInfo,
    });

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在生产环境中，可以将错误发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: any) => {
    try {
      // 这里可以集成错误监控服务，如 Sentry、LogRocket 等
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // 示例：发送到错误收集端点
      if (process.env.NEXT_PUBLIC_ERROR_ENDPOINT) {
        fetch(process.env.NEXT_PUBLIC_ERROR_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport),
        }).catch((reportError) => {
          console.error('Failed to report error:', reportError);
        });
      }
    } catch (reportError) {
      console.error('Error reporting failed:', reportError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              哎呀，出现了一些问题
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              很抱歉，页面遇到了意外错误。请尝试刷新页面或稍后再试。
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-red-600 dark:text-red-400 mb-2">
                  错误详情 (开发模式)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 max-h-40 overflow-auto">
                  <div className="mb-2">
                    <strong>错误:</strong> {this.state.error.message}
                  </div>
                  {this.state.errorId && (
                    <div className="mb-2">
                      <strong>错误ID:</strong> {this.state.errorId}
                    </div>
                  )}
                  <div>
                    <strong>堆栈:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              >
                重试
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                刷新页面
              </button>
            </div>

            {this.state.errorId && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                错误ID: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 用于函数组件的错误边界Hook
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('Error caught by error handler:', error, errorInfo);

    // 在生产环境中发送错误报告
    if (process.env.NODE_ENV === 'production') {
      // 这里可以添加错误报告逻辑
    }
  };
}

// 通用错误显示组件
export function ErrorDisplay({ error, onRetry, className }: ErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || '未知错误';

  return (
    <div className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            {errorMessage}
          </p>
        </div>
        {onRetry && (
          <div className="ml-3">
            <button
              onClick={onRetry}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium"
            >
              重试
            </button>
          </div>
        )}
      </div>
    </div>
  );
}