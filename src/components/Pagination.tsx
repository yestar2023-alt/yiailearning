'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { generatePaginationLinks } from '@/lib/pagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  showInfo?: boolean;
  maxVisible?: number;
  className?: string;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = '/posts',
  showInfo = true,
  maxVisible = 7,
  className = '',
  onPageChange,
}: PaginationProps) {
  const router = useRouter();

  // 如果只有一页或没有数据，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  // 生成分页链接
  const pageLinks = generatePaginationLinks(currentPage, totalPages, basePath, maxVisible);

  // 处理页码点击
  const handlePageClick = (page: number, url: string) => {
    // 调用回调函数
    if (onPageChange) {
      onPageChange(page);
      return;
    }

    // 默认行为：导航到新页面
    router.push(url);
  };

  // 计算显示信息
  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, totalPages * 10);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* 分页信息 */}
      {showInfo && (
        <div className="text-sm text-secondary dark:text-muted">
          第 {startItem}-{endItem} 条，共 {totalPages} 页
        </div>
      )}

      {/* 分页按钮 */}
      <nav className="flex items-center gap-1" aria-label="分页导航">
        {/* 上一页按钮 */}
        <button
          onClick={() => handlePageClick(currentPage - 1, `${basePath}?page=${currentPage - 1}`)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 1
              ? 'cursor-not-allowed text-subtle/70 dark:text-muted/60'
              : 'text-secondary hover:bg-background-light dark:text-muted dark:hover:bg-white/5'
          }`}
          aria-label="上一页"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 页码按钮 */}
        <div className="flex items-center gap-1">
          {pageLinks.map((link, index) => {
            if (link.isEllipsis) {
              // 省略号
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-subtle dark:text-muted"
                >
                  ...
                </span>
              );
            }

            // 页码按钮
            return (
              <button
                key={`page-${link.page}`}
                onClick={() => handlePageClick(link.page, link.url)}
                className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  link.isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/15'
                    : 'text-secondary hover:bg-background-light dark:text-muted dark:hover:bg-white/5'
                }`}
                aria-label={`第 ${link.page} 页`}
                aria-current={link.isActive ? 'page' : undefined}
              >
                {link.page}
              </button>
            );
          })}
        </div>

        {/* 下一页按钮 */}
        <button
          onClick={() => handlePageClick(currentPage + 1, `${basePath}?page=${currentPage + 1}`)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? 'cursor-not-allowed text-subtle/70 dark:text-muted/60'
              : 'text-secondary hover:bg-background-light dark:text-muted dark:hover:bg-white/5'
          }`}
          aria-label="下一页"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>

      {/* 跳转到指定页 */}
      <div className="flex items-center gap-2">
        <label htmlFor="page-input" className="text-sm text-secondary dark:text-muted">
          跳转到
        </label>
        <input
          id="page-input"
          type="number"
          min={1}
          max={totalPages}
          className="w-16 rounded-lg border border-subtle/80 bg-card-light/90 px-2 py-1 text-sm text-text-light focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-card-dark dark:text-text-dark dark:focus:border-primary/30"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = parseInt((e.target as HTMLInputElement).value, 10);
              if (value >= 1 && value <= totalPages) {
                handlePageClick(value, `${basePath}?page=${value}`);
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
        />
        <span className="text-sm text-secondary dark:text-muted">页</span>
      </div>
    </div>
  );
}

// 简洁版分页组件
interface PaginationSimpleProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationSimple({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationSimpleProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-subtle/80 bg-card-light/90 px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-card-dark dark:text-muted dark:hover:bg-white/5"
      >
        上一页
      </button>

      <span className="px-4 py-2 text-sm font-medium text-secondary dark:text-muted">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg border border-subtle/80 bg-card-light/90 px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-card-dark dark:text-muted dark:hover:bg-white/5"
      >
        下一页
      </button>
    </div>
  );
}

// 无限滚动分页组件
interface InfiniteScrollPaginationProps {
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function InfiniteScrollPagination({
  hasMore,
  onLoadMore,
  isLoading,
  className = '',
  children,
}: InfiniteScrollPaginationProps) {
  // Intersection Observer 实现无限滚动
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className={className}>
      {children}

      {/* 加载触发器 */}
      <div ref={loadMoreRef} className="h-10" />

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      )}

      {/* 没有更多数据 */}
      {!hasMore && (
        <div className="py-4 text-center text-secondary dark:text-muted">
          已加载全部内容
        </div>
      )}
    </div>
  );
}

export default Pagination;
