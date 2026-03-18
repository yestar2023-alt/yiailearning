"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PostCard from '../../components/PostCard';
import EmptyState from '../../components/EmptyState';

type Post = {
  slug: string;
  meta: {
    title: string;
    date: string;
    tags?: string[];
    excerpt?: string;
  };
};

export default function SearchablePosts({ initialPosts }: { initialPosts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const searchParams = useSearchParams();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  
  useEffect(() => {
    // Get tag from URL if available
    const tagFromUrl = searchParams.get('tag');
    setSelectedTag(tagFromUrl || '');
  }, [searchParams]);
  
  // Extract all unique tags from posts
  const allTags = Array.from(
    new Set(
      initialPosts.flatMap(post => post.meta.tags || [])
    )
  ).filter(Boolean);

  // Filter posts based on search query and selected tag
  const filteredPosts = initialPosts.filter(post => {
    const searchableText = [
      post.meta.title,
      post.meta.excerpt || '',
      ...(post.meta.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery);
    const matchesTag = !selectedTag || (post.meta.tags && post.meta.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  return (
    <>
      {/* 搜索和标签筛选 */}
      <div className="mb-10 rounded-[1.5rem] border border-subtle/70 bg-card-light/80 p-6 shadow-soft backdrop-blur-sm dark:border-white/10 dark:bg-card-dark/80">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-subtle dark:text-muted">
              搜索与筛选
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索标题、摘要或标签..."
                className="input py-3 pr-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:w-[260px]">
            <div className="rounded-2xl border border-subtle/70 bg-background-light/80 px-4 py-3 dark:border-white/10 dark:bg-card-dark/65">
              <div className="text-secondary">当前结果</div>
              <div className="mt-1 text-2xl font-bold text-primary">{filteredPosts.length}</div>
            </div>
            <div className="rounded-2xl border border-subtle/70 bg-background-light/80 px-4 py-3 dark:border-white/10 dark:bg-card-dark/65">
              <div className="text-secondary">全部标签</div>
              <div className="mt-1 text-2xl font-bold text-primary">{allTags.length}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-subtle/70 pt-5 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
            <span>当前显示 {filteredPosts.length} / {initialPosts.length} 篇文章</span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag('')}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary transition-colors hover:border-primary/30 hover:text-primary-hover"
              >
                标签：{selectedTag}
                <span>×</span>
              </button>
            )}
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`rounded-full px-3 py-1 text-sm transition-all duration-200 ${
                  selectedTag === ''
                    ? 'bg-primary text-white shadow-sm shadow-primary/15'
                    : 'border border-subtle/70 bg-background-light/75 text-secondary hover:border-primary/20 hover:text-primary dark:border-white/10 dark:bg-card-dark/65'
                }`}
              >
                全部
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`rounded-full px-3 py-1 text-sm transition-all duration-200 ${
                    selectedTag === tag
                      ? 'bg-primary text-white shadow-sm shadow-primary/15'
                      : 'border border-subtle/70 bg-background-light/75 text-secondary hover:border-primary/20 hover:text-primary dark:border-white/10 dark:bg-card-dark/65'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 文章列表 */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <PostCard 
            key={post.slug}
            slug={post.slug}
            title={post.meta.title}
            date={post.meta.date}
            tags={post.meta.tags}
            excerpt={post.meta.excerpt}
            onTagClick={(tag) => setSelectedTag(tag)}
          />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <EmptyState
          title={searchQuery || selectedTag ? '没有找到相关文章' : '暂无文章'}
          description={
            searchQuery || selectedTag
              ? '可以换一个关键词，或者先清掉当前标签筛选，再继续找。'
              : '精彩内容即将上线，敬请期待。'
          }
          primaryHref="/"
          primaryLabel="返回首页看看"
          secondaryAction={
            searchQuery || selectedTag
              ? {
                  label: '清除筛选条件',
                  onClick: () => {
                    setSearchQuery('');
                    setSelectedTag('');
                  },
                }
              : undefined
          }
        />
      )}
    </>
  );
} 
