"use client";

import React from 'react';
import Link from 'next/link';
import PostCardIllustration from './PostCardIllustration';

type PostCardProps = {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  excerpt?: string;
  coverImage?: string;
  onTagClick?: (tag: string) => void;
};

export default function PostCard({
  slug,
  title,
  date,
  tags,
  excerpt,
  onTagClick
}: PostCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const leadTag = tags?.[0] || '文章';

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-subtle/80 bg-card-light/92 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-card-hover dark:border-white/10 dark:bg-card-dark/88">
      {/* 顶部渐变线 */}
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* 背景光晕 */}
      <div className="absolute right-5 top-5 h-24 w-24 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10 transition-all duration-500 group-hover:bg-primary/10 group-hover:scale-150" />

      {/* 悬停时的背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* 封面插图区域 */}
      <div className="relative h-36 overflow-hidden rounded-t-[1.5rem] border-b border-subtle/50 dark:border-white/5">
        <PostCardIllustration tag={leadTag} title={title} />

        {/* 标签徽章 - 悬浮在插图上 */}
        <div className="absolute top-4 right-4 z-10">
          <span className="rounded-full border border-primary/30 bg-white/90 dark:bg-card-dark/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary shadow-sm">
            {leadTag}
          </span>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-secondary">
          <time dateTime={date} className="font-medium">
            {formattedDate}
          </time>
          {tags && tags.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(1, 3).map(tag => (
                <span
                  key={tag}
                  className="cursor-pointer font-medium text-primary/80 transition-colors hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onTagClick) onTagClick(tag);
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <h3 className="mb-4 line-clamp-2 text-2xl font-bold leading-tight text-primary transition-all duration-300 group-hover:text-primary-hover">
          <Link href={`/posts/${slug}`} className="relative z-10 group/title">
            <span className="absolute inset-0" />
            <span className="bg-gradient-to-r from-primary to-primary bg-[length:0%_2px] bg-no-repeat bg-left-bottom transition-all duration-300 group-hover/title:bg-[length:100%_2px]">
              {title}
            </span>
          </Link>
        </h3>

        {excerpt && (
          <p className="mb-6 line-clamp-4 text-secondary leading-7">
            {excerpt}
          </p>
        )}

        {/* 底部操作栏 */}
        <div className="group/link mt-auto flex items-center justify-end border-t border-subtle/70 pt-4 text-sm font-medium text-primary dark:border-white/10 relative z-10">
        <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-300 group-hover:bg-primary/5 group-hover:gap-2 cursor-pointer">
          <span className="relative">
            阅读全文
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover/link:w-full" />
          </span>
          <svg
            className="h-4 w-4 transform transition-transform duration-300 group-hover/link:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </div>
    </article>
  );
}
