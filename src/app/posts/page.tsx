import { getAllPosts } from '../../lib/posts';
import SearchablePosts from './SearchablePosts';
import PageTitle from '../../components/PageTitle';
import React, { Suspense } from 'react';

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  const latestDate = posts[0]?.meta.date;
  
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <section className="rounded-[2rem] border border-subtle/70 bg-card-light/80 p-8 shadow-soft backdrop-blur-sm dark:border-white/10 dark:bg-card-dark/80 md:p-10">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-subtle dark:text-muted">
          Content Library
        </div>
        <PageTitle>博客文章</PageTitle>
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <p className="max-w-3xl text-secondary leading-8">
            这里集中放所有已经整理好的文章。核心目标不是把页面做复杂，而是让内容更容易被继续补充、筛选和回看。
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-subtle/70 bg-background-light/80 px-4 py-3 dark:border-white/10 dark:bg-card-dark/65">
              <div className="text-secondary">文章总数</div>
              <div className="mt-1 text-2xl font-bold text-primary">{posts.length}</div>
            </div>
            <div className="rounded-2xl border border-subtle/70 bg-background-light/80 px-4 py-3 dark:border-white/10 dark:bg-card-dark/65">
              <div className="text-secondary">最近更新</div>
              <div className="mt-1 font-semibold text-primary">
                {latestDate
                  ? new Date(latestDate).toLocaleDateString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                    })
                  : '暂无'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="py-10 text-center text-secondary dark:text-muted">加载中...</div>}>
        <SearchablePosts initialPosts={posts} />
      </Suspense>
    </div>
  );
} 
