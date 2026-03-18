'use client';

import { ReactNode, Suspense, lazy, useState, useEffect } from 'react';
import { Loading } from '@/components/Loading';

/**
 * 懒加载组件选项
 */
interface LazyLoadOptions {
  /**
   * 预加载延迟（毫秒）
   * @default 0
   */
  preloadDelay?: number;

  /**
   * 根视口外多远开始预加载（像素）
   * @default 100
   */
  rootMargin?: string;

  /**
   * 加载中的占位组件
   * @default Loading组件
   */
  fallback?: ReactNode;

  /**
   * 错误时的占位组件
   */
  errorFallback?: ReactNode;

  /**
   * 是否启用IntersectionObserver自动预加载
   * @default true
   */
  autoPreload?: boolean;
}

/**
 * 懒加载高阶组件
 * 提供组件的动态导入和Suspense包装
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const {
    preloadDelay = 0,
    rootMargin = '100px',
    fallback = <Loading />,
    errorFallback = <div className="text-red-500">加载失败</div>,
    autoPreload = true,
  } = options;

  // 使用React.lazy创建懒加载组件
  const LazyComponent = lazy(importFn);

  // 创建预加载函数
  const preload = () => {
    if (preloadDelay > 0) {
      setTimeout(() => {
        importFn();
      }, preloadDelay);
    } else {
      importFn();
    }
  };

  // 如果启用自动预加载，返回包装组件
  if (autoPreload) {
    return function LazyLoadWrapper(props: React.ComponentProps<T>) {
      return (
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      );
    };
  }

  // 返回懒加载组件和预加载函数
  return {
    LazyComponent,
    preload,
  };
}

/**
 * IntersectionObserver预加载Hook
 * 当组件进入视口时自动加载
 */
export function useIntersectionPreload(
  importFn: () => Promise<any>,
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const { rootMargin = '100px', threshold = 0.1 } = options;

  // 这里可以扩展为使用IntersectionObserver
  // 目前简化实现
  return {
    preload: importFn,
  };
}

/**
 * 预加载页面组件的辅助函数
 */
export function preloadPage(pageName: string) {
  // Next.js动态导入预加载
  const preloadMap: Record<string, () => Promise<any>> = {
    blog: () => import('@/app/posts/page'),
    resources: () => import('@/app/resources/page'),
    roadmap: () => import('@/app/roadmap/page'),
    search: () => import('@/app/posts/SearchablePosts'),
  };

  const preloadFn = preloadMap[pageName];
  if (preloadFn) {
    preloadFn();
  }
}

/**
 * 智能预加载Hook
 * 根据用户行为预测并预加载页面
 */
export function useSmartPreload() {
  const preloadOnHover = (pageName: string) => {
    // 鼠标悬停时预加载
    const timer = setTimeout(() => {
      preloadPage(pageName);
    }, 100);

    return () => clearTimeout(timer);
  };

  const preloadOnIdle = (pageName: string) => {
    // 浏览器空闲时预加载
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        preloadPage(pageName);
      });
    } else {
      setTimeout(() => {
        preloadPage(pageName);
      }, 2000);
    }
  };

  return {
    preloadOnHover,
    preloadOnIdle,
  };
}

/**
 * 组件懒加载包装器
 * 使用IntersectionObserver在进入视口时加载
 */
interface LazyLoadWrapperProps {
  children: ReactNode;
  loader: () => Promise<ReactNode>;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LazyLoadWrapper({
  children,
  loader,
  fallback = <Loading />,
  rootMargin = '100px',
  threshold = 0.1,
}: LazyLoadWrapperProps) {
  // 这里可以扩展为使用IntersectionObserver
  // 目前简化实现，直接渲染children或loader的结果
  return <>{children}</>;
}

/**
 * 批量懒加载组件
 */
interface BatchLazyLoadProps {
  items: Array<{
    key: string;
    loader: () => Promise<ReactNode>;
    fallback?: ReactNode;
  }>;
  renderItem: (item: ReactNode, key: string) => ReactNode;
  batchSize?: number;
  className?: string;
}

export function BatchLazyLoad({
  items,
  renderItem,
  batchSize = 5,
  className = '',
}: BatchLazyLoadProps) {
  // 分批渲染，实现虚拟化效果
  const [renderedItems, setRenderedItems] = useState<string[]>([]);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < items.length) {
        const batch = items.slice(currentIndex, currentIndex + batchSize);
        setRenderedItems((prev) => [
          ...prev,
          ...batch.map((item) => item.key),
        ]);
        currentIndex += batchSize;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [items, batchSize]);

  const renderedContent = items
    .filter((item) => renderedItems.includes(item.key))
    .map((item) => {
      const content = item.loader();
      return (
        <div key={item.key} className="lazy-load-item">
          {renderItem(content as any, item.key)}
        </div>
      );
    });

  return <div className={className}>{renderedContent}</div>;
}
