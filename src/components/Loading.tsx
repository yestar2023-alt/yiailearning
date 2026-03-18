import { LoadingProps } from '@/types';

export function Loading({ message = '加载中...', className, size = 'medium' }: LoadingProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-subtle/50 dark:border-white/10`}>
          <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-primary border-t-transparent dark:border-primary-light`}></div>
        </div>
      </div>
      {message && (
        <p className={`mt-4 text-secondary dark:text-muted ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );
}

// 骨架屏组件
export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[1.25rem] border border-subtle/80 bg-card-light/70 p-6 shadow-soft dark:border-white/10 dark:bg-card-dark/75">
      <div className="mb-4 h-4 w-3/4 rounded bg-subtle/30 dark:bg-white/10"></div>
      <div className="mb-2 h-3 w-1/2 rounded bg-subtle/25 dark:bg-white/10"></div>
      <div className="space-y-2">
        <div className="h-3 rounded bg-subtle/25 dark:bg-white/10"></div>
        <div className="h-3 w-5/6 rounded bg-subtle/25 dark:bg-white/10"></div>
        <div className="h-3 w-4/6 rounded bg-subtle/25 dark:bg-white/10"></div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-16 rounded-full bg-accent-soft/80 dark:bg-accent/15"></div>
        <div className="h-6 w-20 rounded-full bg-primary/12 dark:bg-primary/18"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

// 页面加载组件
export function PageLoading({ message = '页面加载中...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading message={message} size="large" />
    </div>
  );
}

// 按钮加载状态
export function ButtonLoading({ className }: { className?: string }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
