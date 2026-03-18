'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import toc from 'remark-toc';
import { rehype } from 'rehype';
import rehypeSlug from 'rehype-slug';
import rehypePrism from 'rehype-prism-plus';
import { PostMeta, PostSummary, PostError } from '@/types';

const postsDirectory = path.join(process.cwd(), 'src/data/posts');

function normalizePostMeta(data: PostMeta, content: string): PostMeta {
  const summary =
    typeof data.summary === 'string' && data.summary.trim()
      ? data.summary.trim()
      : typeof data.description === 'string' && data.description.trim()
        ? data.description.trim()
        : undefined;

  const excerpt =
    typeof data.excerpt === 'string' && data.excerpt.trim()
      ? data.excerpt.trim()
      : summary || extractExcerpt(content);

  return {
    ...data,
    summary: summary || excerpt,
    excerpt,
  };
}

function isPublishedPost(data: PostMeta) {
  return data.draft !== true && data.published !== false;
}

// 获取所有文章的 slug（文件名）
export async function getPostSlugs() {
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith('.md'))
    .filter((file) => {
      const fullPath = path.join(postsDirectory, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      return isPublishedPost(data as PostMeta);
    });
}

// 根据 slug 获取文章数据
export async function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\\.md$/, '');

  const fullPath = path.join(postsDirectory, `${realSlug}.md`);

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const { data, content } = matter(fileContents);
    const postMeta = normalizePostMeta(data as PostMeta, content);

    const processedContentRemark = await remark()
      .use(html)
      .use(toc, { heading: '目录', maxDepth: 2 })
      .process(content);
      
    const finalContent = await rehype()
      .use(rehypeSlug)
      .use(rehypePrism, { showLineNumbers: true })
      .process(processedContentRemark.toString());

    return {
      slug: realSlug,
      meta: postMeta,
      content: finalContent.toString(),
    };
  } catch (error) {
    // 转换为PostError并重新抛出
    const postError = new PostError(
      `Failed to process post ${slug}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error && 'code' in error && (error as any).code === 'ENOENT' ? 'not_found' : 'processing_error',
      {
        slug,
        originalError: error instanceof Error ? error : undefined,
      }
    );

    throw postError;
  }
}

// 提取文章摘要，如果不存在则从内容中提取
function extractExcerpt(content: string, maxLength: number = 150): string {
  // Remove markdown headings, links, images, etc.
  const plainText = content
    .replace(/#+\s+(.*)/g, '$1') // Remove headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // Remove images
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  // Truncate and add ellipsis if needed
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Try to truncate at a sentence or word boundary
  const truncated = plainText.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('。');
  const lastSpace = truncated.lastIndexOf(' ');
  
  // Prefer sentence boundary, then word boundary
  const breakPoint = lastPeriod > maxLength * 0.7 ? lastPeriod : 
                    lastSpace > maxLength * 0.7 ? lastSpace : 
                    maxLength;
  
  return plainText.substring(0, breakPoint) + '...';
}

// 获取所有文章的简略信息
export async function getAllPosts(): Promise<PostSummary[]> { // 明确返回类型
  const slugs = await getPostSlugs();
  const posts = slugs
    .map((slug) => {
      const fullPath = path.join(postsDirectory, slug);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      const postMeta = normalizePostMeta(data as PostMeta, content);

      if (!isPublishedPost(postMeta)) {
        return null;
      }

      return {
        slug: slug.replace(/\.md$/, ''),
        meta: postMeta,
      };
    })
    .filter((post): post is PostSummary => post !== null);

  // 按发布日期倒序排列
  return posts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}
