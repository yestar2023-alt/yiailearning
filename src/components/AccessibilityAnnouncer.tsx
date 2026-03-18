'use client';

import { useEffect, useState } from 'react';

/**
 * 屏幕阅读器公告组件
 * 动态通知屏幕阅读器重要状态变化
 */
interface AccessibilityAnnouncerProps {
  /**
   * 公告的消息
   */
  message: string;

  /**
   * 公告优先级 (polite: 礼貌打断, assertive: 立即打断)
   */
  priority?: 'polite' | 'assertive';

  /**
   * 是否清除之前的公告
   */
  clearOnMount?: boolean;
}

let liveRegion: HTMLElement | null = null;

/**
 * 屏幕阅读器公告Hook
 */
export function useAccessibilityAnnouncer() {
  const [announce, setAnnounce] = useState<((message: string, priority?: 'polite' | 'assertive') => void) | null>(null);

  useEffect(() => {
    // 创建或获取live region
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('class', 'sr-only');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    setAnnounce((message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (liveRegion) {
        liveRegion.setAttribute('aria-live', priority);
        liveRegion.textContent = message;
      }
    });

    return () => {
      // 清理但不删除liveRegion，因为它可能被其他组件使用
    };
  }, []);

  return announce;
}

/**
 * 屏幕阅读器公告组件
 */
export function AccessibilityAnnouncer({
  message,
  priority = 'polite',
  clearOnMount = false,
}: AccessibilityAnnouncerProps) {
  const [mounted, setMounted] = useState(false);
  const announce = useAccessibilityAnnouncer();

  useEffect(() => {
    setMounted(true);

    if (clearOnMount && announce) {
      announce('', priority);
    }
  }, [announce, priority, clearOnMount]);

  useEffect(() => {
    if (mounted && message && announce) {
      announce(message, priority);
    }
  }, [mounted, message, announce, priority]);

  return null;
}

/**
 * 跳过链接组件
 * 允许用户跳过导航直接到主要内容
 */
export function SkipToContentLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded focus:shadow-lg transition-all"
    >
      跳到主要内容
    </a>
  );
}

/**
 * 焦点指示器组件
 * 为键盘导航用户提供清晰的焦点指示
 */
interface FocusIndicatorProps {
  children: React.ReactNode;
  className?: string;
}

export function FocusIndicator({ children, className = '' }: FocusIndicatorProps) {
  return (
    <div
      className={`focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${className}`}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

/**
 * 可访问性状态指示器
 * 显示当前焦点状态和其他可访问性相关信息
 */
export function AccessibilityStatus() {
  const [focusVisible, setFocusVisible] = useState(false);
  const announce = useAccessibilityAnnouncer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
        if (announce) {
          announce('键盘导航已启用', 'polite');
        }
      }
    };

    const handleMouseDown = () => {
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [announce]);

  if (!focusVisible) {
    return (
      <div className="sr-only">
        使用Tab键导航，Enter键激活，Escape键退出
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded text-sm z-50">
      <span className="sr-only">状态：</span>
      键盘导航模式
    </div>
  );
}

/**
 * 可访问性帮助提示组件
 */
export function AccessibilityHelpTooltip({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="help-title" className="text-xl font-bold mb-4">
          键盘导航帮助
        </h2>

        <div className="space-y-3 text-sm">
          <div>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Tab</kbd>
            <span className="ml-2">移动到下一个元素</span>
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Shift + Tab</kbd>
            <span className="ml-2">移动到上一个元素</span>
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd>
            <span className="ml-2">激活链接或按钮</span>
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Space</kbd>
            <span className="ml-2">激活复选框或按钮</span>
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Escape</kbd>
            <span className="ml-2">关闭弹窗或菜单</span>
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↑↓←→</kbd>
            <span className="ml-2">在菜单或列表中导航</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          关闭
        </button>
      </div>
    </div>
  );
}

/**
 * 屏幕阅读器专用隐藏内容
 * 对视觉用户隐藏，对屏幕阅读器可见
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/**
 * 视觉隐藏但可访问的占位符
 * 用于为图标按钮提供文本标签
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}
