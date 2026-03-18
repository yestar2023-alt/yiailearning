'use client';

import { useState, useEffect } from 'react';

/**
 * 媒体查询Hook
 * @param query 媒体查询字符串
 * @returns 是否匹配
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // 处理匹配结果变化
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 初始设置
    setMatches(mediaQuery.matches);

    // 添加监听器
    mediaQuery.addEventListener('change', handler);

    // 清理函数
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * 常用断点Hook
 * @param breakpoint 断点名称
 * @returns 是否匹配
 */
export function useBreakpoint(breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl') {
  const queries = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
  };

  return useMediaQuery(queries[breakpoint]);
}

/**
 * 移动设备检测Hook
 * @returns 是否为移动设备
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * 触摸设备检测Hook
 * @returns 是否为触摸设备
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

/**
 * 暗色模式检测Hook
 * @returns 是否为暗色模式
 */
export function useIsDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * 减少动画偏好检测Hook
 * @returns 是否减少动画
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export default useMediaQuery;
