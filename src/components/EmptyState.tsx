'use client';

import Link from 'next/link';

type EmptyStateProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

export default function EmptyState({
  title,
  description,
  primaryHref = '/posts',
  primaryLabel = '查看全部文章',
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`relative overflow-hidden rounded-[1.75rem] border border-subtle/80 bg-card-light/92 px-6 py-14 text-center shadow-soft dark:border-white/10 dark:bg-card-dark/88 ${className}`}>
      <div className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/12" />
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6M7 4h6l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z" />
        </svg>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-primary">{title}</h3>
      <p className="mx-auto max-w-xl text-secondary dark:text-muted">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {secondaryAction && (
          <button onClick={secondaryAction.onClick} className="btn btn-secondary">
            {secondaryAction.label}
          </button>
        )}
        <Link href={primaryHref} className="btn btn-primary">
          {primaryLabel}
        </Link>
      </div>
    </div>
  );
}
