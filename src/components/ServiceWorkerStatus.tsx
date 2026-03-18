'use client';

import { useState, useEffect } from 'react';
import { useServiceWorker, useOfflineMode } from '@/hooks/useServiceWorker';

/**
 * Service Worker 状态显示组件
 * 显示缓存状态、网络状态和提供缓存管理功能
 */
interface ServiceWorkerStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function ServiceWorkerStatus({
  className = '',
  showDetails = false,
}: ServiceWorkerStatusProps) {
  const {
    isSupported,
    isRegistered,
    isOnline,
    cacheSize,
    error,
    updateCache,
    clearCache,
    unregister,
  } = useServiceWorker();
  const { isOffline } = useOfflineMode();
  const [showPanel, setShowPanel] = useState(false);

  // 格式化缓存大小
  const formatCacheSize = (bytes: number | null): string => {
    if (bytes === null) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 如果不支持或未注册，只显示基本状态
  if (!isSupported) {
    return null;
  }

  return (
    <div className={className}>
      {/* 状态指示器 */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
          aria-label="Service Worker 状态"
        >
          {/* 在线/离线状态指示 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isOnline ? '在线' : '离线'}
            />
            {isRegistered && (
              <svg
                className="w-4 h-4 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </button>

        {/* 状态面板 */}
        {showPanel && (
          <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-bottom-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Service Worker 状态
            </h3>

            {/* 状态信息 */}
            <div className="space-y-2 text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">支持状态:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {isSupported ? '✓ 支持' : '✗ 不支持'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">注册状态:</span>
                <span
                  className={`font-medium ${
                    isRegistered
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}
                >
                  {isRegistered ? '✓ 已注册' : '✗ 未注册'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">网络状态:</span>
                <span
                  className={`font-medium ${
                    isOnline
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isOnline ? '✓ 在线' : '✗ 离线'}
                </span>
              </div>

              {cacheSize !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">缓存大小:</span>
                  <span className="text-primary dark:text-primary-light font-medium">
                    {formatCacheSize(cacheSize)}
                  </span>
                </div>
              )}
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mb-4">
                <p className="text-xs text-red-600 dark:text-red-400">
                  错误: {error.message}
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={updateCache}
                disabled={!isRegistered}
                className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
              >
                更新缓存
              </button>

              <button
                onClick={clearCache}
                disabled={!isRegistered || cacheSize === 0}
                className="flex-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
              >
                清理缓存
              </button>

              <button
                onClick={unregister}
                disabled={!isRegistered}
                className="flex-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
              >
                注销
              </button>
            </div>

            {/* 离线提示 */}
            {isOffline && (
              <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ℹ️ 当前处于离线模式，显示缓存内容
                </p>
              </div>
            )}

            {/* 详细信息 */}
            {showDetails && isRegistered && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Service Worker 已启用自动缓存和离线支持
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 点击外部关闭面板 */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  );
}

/**
 * 离线页面提示组件
 */
export function OfflineBanner() {
  const { isOffline } = useOfflineMode();

  if (!isOffline) return null;

  return (
    <div className="bg-yellow-500 text-white py-2 px-4 text-center text-sm font-medium">
      ⚠️ 您当前处于离线模式，部分功能可能受限
    </div>
  );
}

/**
 * 缓存进度组件
 */
interface CacheProgressProps {
  isLoading: boolean;
  message?: string;
}

export function CacheProgress({ isLoading, message = '缓存中...' }: CacheProgressProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white py-2 px-4 text-center text-sm font-medium z-50">
      <div className="flex items-center justify-center gap-2">
        <svg
          className="animate-spin w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {message}
      </div>
    </div>
  );
}
