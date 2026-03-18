'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 报告错误到Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background-light px-6 dark:bg-background-dark">
          <div className="w-full max-w-md rounded-[1.75rem] border border-subtle/80 bg-card-light/95 p-7 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-card-dark/92">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15">
              <svg
                className="h-8 w-8 text-primary dark:text-primary-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="mb-2 text-center text-2xl font-bold text-text-light dark:text-text-dark">
              出现错误
            </h2>

            <p className="mb-6 text-center text-secondary dark:text-muted">
              抱歉，页面遇到了意外错误。我们已经记录了这个问题。
            </p>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full rounded-xl bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark"
              >
                重试
              </button>

              <a
                href="/"
                className="block w-full rounded-xl border border-subtle/80 bg-background-light/85 px-4 py-2 text-center text-secondary transition-colors hover:border-accent/20 hover:text-accent dark:border-white/10 dark:bg-white/5 dark:text-muted dark:hover:text-accent-light"
              >
                返回首页
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-subtle transition-colors hover:text-primary dark:text-muted dark:hover:text-primary-light">
                  错误详情 (开发模式)
                </summary>
                <pre className="mt-2 overflow-auto rounded-2xl bg-background-light/90 p-3 text-xs text-primary dark:bg-black/30 dark:text-primary-light">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
