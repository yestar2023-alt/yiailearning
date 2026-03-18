import Link from 'next/link';
import { siteConfig } from '@/lib/config';
import WeChatSubscribeCard from '@/components/WeChatSubscribeCard';

export default function AboutPage() {
  const sections = [
    {
      title: '为什么做这个站',
      content:
        '我想把自己在 AI 工具、Agent 工作流和网站搭建里的真实实践留下来。不是为了堆概念，而是把做过、踩过坑、能复用的方法整理清楚。',
    },
    {
      title: '内容怎么来',
      content:
        '平时会先在飞书里记录，再同步成 markdown 文章。这样写作门槛低，后续只需要补少量摘要、标签和排版，就能发布到站点。',
    },
    {
      title: '接下来会继续写什么',
      content:
        '重点会放在 Cursor、Vibe Coding、Agent 应用、非科班学习路线，以及适合个人创作者的轻量网站流程。',
    },
  ];

  return (
    <div className="container-narrow space-y-12">
      <section className="rounded-[2rem] border border-subtle/70 bg-card-light/80 p-8 shadow-soft backdrop-blur-sm dark:border-white/10 dark:bg-card-dark/80 md:p-12">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
            About This Site
          </div>
          <h1 className="text-4xl font-bold text-primary md:text-5xl">把零散经验整理成可持续更新的内容库</h1>
          <p className="text-lg leading-8 text-secondary">
            {siteConfig.author.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/posts" className="btn btn-primary">
              查看全部文章
            </Link>
            <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              GitHub
            </a>
          </div>
        </div>
      </section>

      <WeChatSubscribeCard />

      <section className="grid gap-6 md:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="card p-6">
            <h2 className="text-xl font-semibold text-primary">{section.title}</h2>
            <p className="mt-4 leading-7 text-secondary">{section.content}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] bg-muted/50 p-8 dark:bg-muted/30 md:p-10">
        <h2 className="text-2xl font-bold text-primary">当前内容重点</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            '用 AI 工具提升个人创作和开发效率',
            '把飞书、Markdown、网站发布串成轻量流程',
            '记录真实项目，而不是只写抽象概念',
            '让非科班学习者也能快速上手并持续输出',
          ].map((item) => (
            <div key={item} className="card p-5 text-secondary">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
