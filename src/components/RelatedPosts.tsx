'use client';

import React from 'react';
import Link from 'next/link';
import { getRelatedPosts, getRelatedPostsByTags, getPopularPosts } from '@/lib/related-posts';
import { PostMeta } from '@/types';

interface RelatedPostsProps {
  currentPost: PostMeta & { slug: string };
  allPosts: (PostMeta & { slug: string })[];
  limit?: number;
  variant?: 'default' | 'by-tags' | 'popular';
  showReason?: boolean;
  className?: string;
}

export function RelatedPosts({
  currentPost,
  allPosts,
  limit = 5,
  variant = 'default',
  showReason = true,
  className = '',
}: RelatedPostsProps) {
  let relatedPosts;

  switch (variant) {
    case 'by-tags':
      relatedPosts = getRelatedPostsByTags(currentPost, allPosts, 3);
      break;
    case 'popular':
      relatedPosts = getPopularPosts(allPosts, limit);
      break;
    default:
      relatedPosts = getRelatedPosts(currentPost, allPosts, { limit });
      break;
  }

  // 如果是按标签分组显示
  if (variant === 'by-tags' && typeof relatedPosts === 'object') {
    return (
      <div className={className}>
        <h3 className="mb-4 text-lg font-semibold text-text-light dark:text-text-dark">
          相关文章
        </h3>

        <div className="space-y-6">
          {Object.entries(relatedPosts).map(([tag, posts]) => (
            <div key={tag} className="space-y-3">
              <h4 className="text-sm font-medium text-primary dark:text-primary-light">
                标签: {tag}
              </h4>

              <div className="grid gap-3">
                {posts.map((post: any) => (
                  <RelatedPostCard
                    key={post.slug}
                    post={post}
                    showReason={showReason}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 如果是数组形式 (普通模式和热门模式)
  if (Array.isArray(relatedPosts) && relatedPosts.length > 0) {
    const title = variant === 'popular' ? '热门文章' : '相关文章';

    return (
      <div className={className}>
        <h3 className="mb-4 text-lg font-semibold text-text-light dark:text-text-dark">
          {title}
        </h3>

        <div className="grid gap-3">
          {relatedPosts.map((post) => (
            <RelatedPostCard
              key={post.slug}
              post={post}
              showReason={showReason}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// 相关文章卡片组件
interface RelatedPostCardProps {
  post: PostMeta & {
    slug: string;
    similarity?: number;
    reason?: string;
  };
  showReason?: boolean;
}

function RelatedPostCard({ post, showReason }: RelatedPostCardProps) {
  const similarityPercentage = post.similarity
    ? Math.round(post.similarity * 100)
    : 0;

  return (
    <article className="group">
      <Link
        href={`/posts/${post.slug}`}
        className="block rounded-[1.25rem] border border-subtle/80 bg-card-light/90 p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg dark:border-white/10 dark:bg-card-dark/85 dark:hover:border-accent/35"
      >
        <div className="flex items-start gap-4">
          {/* 缩略图占位 */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-background-light to-accent-soft/80 text-primary dark:from-primary/20 dark:via-card-dark dark:to-accent/15 dark:text-primary-light">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {/* 文章标题 */}
            <h4 className="line-clamp-2 text-sm font-semibold text-text-light transition-colors group-hover:text-primary dark:text-text-dark dark:group-hover:text-primary-light">
              {post.title}
            </h4>

            {/* 文章摘要 */}
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-secondary dark:text-muted">
              {post.summary || post.excerpt}
            </p>

            <div className="mt-2 flex items-center justify-between">
              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs text-primary dark:border-primary/25 dark:bg-primary/15 dark:text-primary-light"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 相似度或日期 */}
              <div className="text-xs text-subtle dark:text-muted">
                {post.similarity ? (
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {similarityPercentage}% 匹配
                  </span>
                ) : (
                  new Date(post.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                )}
              </div>
            </div>

            {/* 推荐原因 */}
            {showReason && post.reason && post.similarity && (
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:border-primary/25 dark:bg-primary/15 dark:text-primary-light">
                  {post.reason}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

// 横向相关文章展示组件
interface RelatedPostsHorizontalProps {
  currentPost: PostMeta & { slug: string };
  allPosts: (PostMeta & { slug: string })[];
  limit?: number;
  className?: string;
}

export function RelatedPostsHorizontal({
  currentPost,
  allPosts,
  limit = 5,
  className = '',
}: RelatedPostsHorizontalProps) {
  const relatedPosts = getRelatedPosts(currentPost, allPosts, { limit });

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="mb-4 text-lg font-semibold text-text-light dark:text-text-dark">
        相关文章
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/30 dark:scrollbar-thumb-accent/30">
        {relatedPosts.map((post) => (
          <article
            key={post.slug}
            className="w-64 flex-shrink-0 rounded-[1.25rem] border border-subtle/80 bg-card-light/90 p-4 shadow-soft dark:border-white/10 dark:bg-card-dark/85"
          >
            <Link href={`/posts/${post.slug}`}>
              <h4 className="line-clamp-2 text-sm font-semibold text-text-light transition-colors hover:text-primary dark:text-text-dark dark:hover:text-primary-light">
                {post.title}
              </h4>
              <p className="mt-2 line-clamp-3 text-xs leading-6 text-secondary dark:text-muted">
                {post.summary || post.excerpt}
              </p>
              <div className="mt-2 flex items-center gap-1">
                {post.tags?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary dark:border-primary/25 dark:bg-primary/15 dark:text-primary-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export default RelatedPosts;
