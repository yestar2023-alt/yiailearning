import Link from 'next/link';
import { getPostSlugs, getPostBySlug } from '../../../lib/posts';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { siteConfig } from '../../../lib/config';
import Breadcrumb from '../../../components/Breadcrumb';
import { AuthorCard } from '../../../components/AuthorSchema';
import WeChatSubscribeCard from '../../../components/WeChatSubscribeCard';

type Heading = {
  id: string;
  text: string;
  level: number;
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.slug);
    const url = `${siteConfig.url}/posts/${params.slug}`;
    const description = post.meta.excerpt || post.meta.summary || post.meta.description || siteConfig.description;
    
    return {
      title: post.meta.title,
      description,
      keywords: post.meta.tags?.join(', '),
      authors: [{ name: siteConfig.author.name }],
      openGraph: {
        title: post.meta.title,
        description,
        url: url,
        siteName: siteConfig.title,
        images: [
          {
            url: siteConfig.logo.url,
            width: 1200,
            height: 630,
            alt: post.meta.title,
          }
        ],
        locale: 'zh_CN',
        type: 'article',
        publishedTime: post.meta.date,
        tags: post.meta.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.meta.title,
        description,
        images: [siteConfig.logo.url],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    };
  }
}

// 从HTML内容中提取目录
function extractTableOfContents(content: string): Heading[] {
  const headingRegex = /<h([2-3]) id="([^"]+)">(.+?)<\/h[2-3]>/g;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, '') // 移除内部HTML标签
    });
  }

  return headings;
}

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map(slug => ({ slug: slug.replace(/\.md$/, '') }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  try {
    const post = await getPostBySlug(params.slug);
    const toc = extractTableOfContents(post.content);
    const postUrl = `${siteConfig.url}/posts/${params.slug}`;
    const postSummary = post.meta.excerpt || post.meta.summary || post.meta.description;

    // 面包屑导航数据
    const breadcrumbItems = [
      { name: '文章', href: '/posts' },
      { name: post.meta.title, href: `/posts/${params.slug}`, current: true }
    ];

    // 作者信息
    const authorInfo = {
      name: siteConfig.author.name,
      description: siteConfig.author.description,
      url: siteConfig.url,
      image: siteConfig.author.image,
      jobTitle: siteConfig.author.title,
      sameAs: siteConfig.author.sameAs,
    };

    return (
      <div className="max-w-5xl mx-auto">
        {/* 面包屑导航 */}
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* 主内容区 */}
          <div className="md:w-3/4">
            <article className="card overflow-hidden">
              <header className="border-b border-subtle/80 bg-[linear-gradient(135deg,rgba(99,102,241,0.08),rgba(6,182,212,0.06))] px-5 py-8 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(6,182,212,0.10))] md:px-8 md:py-10">
                <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  深度阅读
                </div>
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-subtle dark:text-muted">
                  AI 学习札记
                </div>
                <h1 className="mb-4 text-3xl font-bold leading-tight text-primary md:text-5xl">{post.meta.title}</h1>
                {postSummary && (
                  <p className="mb-5 max-w-3xl text-base leading-8 text-secondary md:text-lg">
                    {postSummary}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <p className="rounded-full border border-subtle/70 bg-card-light/75 px-4 py-2 text-sm text-secondary dark:border-white/10 dark:bg-card-dark/75">
                    {new Date(post.meta.date).toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  {post.meta.tags && post.meta.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.meta.tags.map(tag => (
                        <Link 
                          key={tag} 
                          href={`/posts?tag=${tag}`}
                          className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </header>

              <div 
                className="article-prose px-5 py-8 md:px-8 md:py-10"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />

              {/* 结构化数据 */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": post.meta.title,
                    "description": postSummary,
                    "image": `${siteConfig.url}${siteConfig.logo.url}`,
                    "datePublished": post.meta.date,
                    "dateModified": post.meta.date,
                    "author": {
                      "@type": "Person",
                      "name": siteConfig.author.name
                    },
                    "publisher": {
                      "@type": "Organization",
                      "name": siteConfig.title,
                      "logo": {
                        "@type": "ImageObject",
                        "url": `${siteConfig.url}${siteConfig.logo.url}`
                      }
                    },
                    "mainEntityOfPage": {
                      "@type": "WebPage",
                      "@id": postUrl
                    },
                    "keywords": post.meta.tags?.join(', '),
                    "articleSection": "AI学习",
                    "inLanguage": "zh-CN"
                  })
                }}
              />

              {/* 作者信息 */}
              <div className="mx-5 mt-2 border-t border-subtle pt-8 md:mx-8">
                <AuthorCard author={authorInfo} />
              </div>

              <div className="mx-5 mt-6 border-t border-subtle pt-6 pb-8 md:mx-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/posts" className="btn btn-secondary">
                    返回文章列表
                  </Link>
                  <a
                    href={`https://x.com/intent/post?text=${encodeURIComponent(post.meta.title)}&url=${encodeURIComponent(postUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                  >
                    分享到 X
                  </a>
                </div>
              </div>
            </article>
          </div>

          {/* 侧边栏 */}
          <div className="md:w-1/4">
            <div className="sticky top-24 space-y-6">
              {/* 目录 */}
              {toc.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary">目录</h3>
                  <nav>
                    <ul className="space-y-2">
                      {toc.map((heading) => (
                        <li 
                          key={heading.id} 
                          className={`${heading.level === 3 ? 'ml-4' : ''}`}
                        >
                          <a 
                            href={`#${heading.id}`} 
                            className="block rounded-xl border border-transparent px-3 py-2 text-secondary transition-colors duration-200 hover:border-primary/20 hover:bg-primary/5 hover:text-primary dark:hover:border-primary/25"
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
              
              {/* 标签云 */}
              {post.meta.tags && post.meta.tags.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary">文章标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.meta.tags.map(tag => (
                      <Link 
                        key={tag} 
                        href={`/posts?tag=${tag}`}
                        className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <WeChatSubscribeCard compact />
              
              {/* 相关推荐 */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 text-primary">继续阅读</h3>
                <ul className="space-y-3 text-secondary">
                  <li>
                    <Link href="/posts" className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      查看全部文章
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      关于本站
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
} 
