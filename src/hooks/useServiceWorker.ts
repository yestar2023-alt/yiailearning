'use client';

import { useEffect, useState } from 'react';

interface UseServiceWorkerReturn {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
  cacheSize: number | null;
  error: Error | null;
  updateCache: () => Promise<void>;
  clearCache: () => Promise<void>;
  unregister: () => Promise<boolean>;
}

/**
 * Service Worker 管理 Hook
 * 提供Service Worker注册、缓存管理和离线状态监控
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [cacheSize, setCacheSize] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // 检查Service Worker支持
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsSupported('serviceWorker' in navigator);

    if (!('serviceWorker' in navigator)) {
      console.warn('[SW] 浏览器不支持 Service Worker');
      return;
    }
  }, []);

  // 注册Service Worker
  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        console.log('[SW] Service Worker 注册成功:', registration);

        setRegistration(registration);
        setIsRegistered(true);

        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] 新版本可用，刷新页面以更新');

                // 显示更新通知
                if (window.confirm('发现新版本，是否立即更新？')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });

        // 监听Service Worker控制器变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] Service Worker 控制器已更新');
          window.location.reload();
        });

        // 获取缓存大小
        getCacheSize(registration);
      } catch (err) {
        console.error('[SW] Service Worker 注册失败:', err);
        setError(err as Error);
      }
    };

    // 只有在生产环境或localhost才注册
    if (process.env.NODE_ENV === 'production' || window.location.hostname === 'localhost') {
      registerSW();
    }
  }, [isSupported]);

  // 监听网络状态
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      console.log('[SW] 网络已连接');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[SW] 网络已断开，进入离线模式');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * 获取缓存大小
   */
  const getCacheSize = async (reg: ServiceWorkerRegistration) => {
    try {
      if ('messageChannel' in reg) {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          if (event.data.type === 'CACHE_SIZE') {
            setCacheSize(event.data.size);
          }
        };

        reg.active?.postMessage(
          { type: 'GET_CACHE_SIZE' },
          [messageChannel.port2]
        );
      }
    } catch (err) {
      console.error('[SW] 获取缓存大小失败:', err);
    }
  };

  /**
   * 手动更新缓存
   */
  const updateCache = async () => {
    try {
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        // 重新注册以更新
        const newRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('[SW] 缓存已更新:', newRegistration);
      }
    } catch (err) {
      console.error('[SW] 更新缓存失败:', err);
      setError(err as Error);
    }
  };

  /**
   * 清理所有缓存
   */
  const clearCache = async () => {
    try {
      if ('messageChannel' in registration!) {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          if (event.data.type === 'CACHE_CLEARED') {
            console.log('[SW] 缓存已清理');
            setCacheSize(0);
          }
        };

        registration!.active?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      }
    } catch (err) {
      console.error('[SW] 清理缓存失败:', err);
      setError(err as Error);
    }
  };

  /**
   * 注销Service Worker
   */
  const unregister = async (): Promise<boolean> => {
    try {
      if (registration) {
        const result = await registration.unregister();
        console.log('[SW] Service Worker 已注销:', result);
        setIsRegistered(false);
        setRegistration(null);
        return result;
      }
      return false;
    } catch (err) {
      console.error('[SW] 注销失败:', err);
      setError(err as Error);
      return false;
    }
  };

  return {
    isSupported,
    isRegistered,
    isOnline,
    registration,
    cacheSize,
    error,
    updateCache,
    clearCache,
    unregister,
  };
}

/**
 * 预加载资源 Hook
 * 在空闲时预加载指定资源
 */
export function usePreloadResources() {
  const preloadResource = (url: string) => {
    if (typeof window === 'undefined' || !('caches' in window)) return;

    // 在浏览器空闲时预加载
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        caches.open('preload-v1').then((cache) => {
          cache.add(url).catch((err) => {
            console.error('[SW] 预加载失败:', err);
          });
        });
      });
    } else {
      setTimeout(() => {
        caches.open('preload-v1').then((cache) => {
          cache.add(url).catch((err) => {
            console.error('[SW] 预加载失败:', err);
          });
        });
      }, 2000);
    }
  };

  return { preloadResource };
}

/**
 * 离线页面检测 Hook
 */
export function useOfflineMode() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始状态
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline };
}
