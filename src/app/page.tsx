import Link from 'next/link';
import { getAllPosts } from '../lib/posts';
import PostCard from '../components/PostCard';
import AiNetworkIllustration from '../components/AiNetworkIllustration';

export default async function HomePage() {
  const allPosts = await getAllPosts();
  const featuredPost = allPosts[0];
  const recentPosts = allPosts.slice(1, 4);
  const tagCount = new Set(allPosts.flatMap((post) => post.meta.tags || [])).size;

  return (
    <div className="max-w-6xl mx-auto space-y-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 rounded-[2.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03]" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/8 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="grid gap-8 rounded-[2.5rem] border border-subtle/60 bg-card-light/70 p-8 shadow-soft backdrop-blur-xl dark:border-white/5 dark:bg-card-dark/70 lg:grid-cols-[1.2fr_0.8fr] lg:p-14 animate-fade-in">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary animate-slide-up" style={{animationDelay: '0.1s'}}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              持续更新中
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-gradient md:text-7xl">
                AI 学习笔记
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-secondary md:text-xl">
                这里记录我用 AI 工具学习、做项目、整理方法的过程。目标很简单：内容能快速发布，页面也要清爽耐看。
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/posts" className="btn btn-primary px-6 py-3 text-base group/btn">
                <span>去看最新文章</span>
                <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/about" className="btn btn-secondary px-6 py-3 text-base">
                了解本站
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="card p-5 group/stat cursor-default">
                <div className="text-sm text-secondary transition-colors group-hover/stat:text-primary">已发布文章</div>
                <div className="mt-2 text-3xl font-bold text-gradient">{allPosts.length}</div>
              </div>
              <div className="card p-5 group/stat cursor-default">
                <div className="text-sm text-secondary transition-colors group-hover/stat:text-primary">覆盖标签</div>
                <div className="mt-2 text-3xl font-bold text-gradient">{tagCount}</div>
              </div>
              <div className="card p-5 group/stat cursor-default">
                <div className="text-sm text-secondary transition-colors group-hover/stat:text-primary">最近更新</div>
                <div className="mt-2 text-lg font-semibold text-primary">
                  {featuredPost
                    ? new Date(featuredPost.meta.date).toLocaleDateString('zh-CN', {
                        month: 'long',
                        day: 'numeric',
                      })
                    : '暂无'}
                </div>
              </div>
            </div>
          </div>

          {/* AI 神经网络插图 */}
          <div className="card relative overflow-hidden min-h-[480px]">
            <AiNetworkIllustration />
          </div>
        </div>
      </section>

      <section className="animate-slide-up">
        <div className="mb-12 flex flex-col gap-5 px-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mb-3 text-3xl font-bold text-primary">最新文章</h2>
            <p className="text-secondary">探索 AI 工具、学习方法和实践经验</p>
          </div>
          <Link href="/posts" className="group flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary-hover px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10">
            查看全部文章
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {recentPosts.map((post) => (
            <PostCard
              key={post.slug}
              slug={post.slug}
              title={post.meta.title}
              date={post.meta.date}
              tags={post.meta.tags}
              excerpt={post.meta.excerpt}
            />
          ))}
        </div>
      </section>

      {/* 关于区域 */}
      <section className="animate-slide-up"
      >
        <div className="rounded-3xl border border-subtle/60 bg-gradient-to-br from-card-light/80 to-muted/30 p-8 dark:border-white/10 dark:from-card-dark/80 dark:to-muted/20 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-primary"
              >关于本站
              </h2>
              <p className="text-secondary text-lg leading-relaxed"
              >
                这里是一个 AI 学习者的知识库，记录使用 Cursor、各类 AI 工具进行开发和学习的心得与实践案例。
              </p>
              <p className="text-secondary leading-relaxed"
              >
                内容包括 Vibe Coding、AI Agent 开发、工具技巧等，希望能为你的 AI 学习之旅提供参考。
              </p>
              <div className="pt-2">
                <Link href="/about" className="btn btn-secondary inline-flex"
                >
                  了解更多
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="card p-8"
            >
              <h3 className="font-semibold text-xl mb-6 text-primary"
              >内容方向
              </h3>
              <ul className="space-y-4 text-secondary"
              >
                <li className="flex items-center gap-3 group/item"
                >
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold group-hover/item:bg-primary/20 transition-colors"
                  >01
                  </span>
                  <span>Vibe Coding 实践与心得</span>
                </li>
                <li className="flex items-center gap-3 group/item"
                >
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold group-hover/item:bg-primary/20 transition-colors"
                  >02
                  </span>
                  <span>AI Agent 开发与应用</span>
                </li>
                <li className="flex items-center gap-3 group/item"
                >
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold group-hover/item:bg-primary/20 transition-colors"
                  >03
                  </span>
                  <span>Cursor 等 AI 工具使用技巧</span>
                </li>
                <li className="flex items-center gap-3 group/item"
                >
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold group-hover/item:bg-primary/20 transition-colors"
                  >04
                  </span>
                  <span>非科班学习 AI 开发的经验</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
