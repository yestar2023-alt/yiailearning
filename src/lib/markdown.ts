import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { PostMetadata, PostContent, TableOfContentsItem, PostError } from '@/types';

const postsDirectory = path.join(process.cwd(), 'src/data/posts');

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map(fileName => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, '')
      }
    };
  });
}

export function getAllPosts(): PostMetadata[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine the data
      return {
        slug,
        title: matterResult.data.title || 'Untitled',
        date: matterResult.data.date || new Date().toISOString(),
        summary: matterResult.data.summary || '',
        tags: matterResult.data.tags || [],
      };
    });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    const postError = new PostError(
      `Failed to load posts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'processing_error',
      {
        originalError: error instanceof Error ? error : undefined,
      }
    );
    throw postError;
  }
}

export async function getPostData(slug: string): Promise<PostContent> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      throw new PostError(`Post not found: ${slug}`, 'not_found', {
        slug,
      });
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Validate required fields
    if (!matterResult.data.title) {
      throw new PostError(`Post missing required title: ${slug}`, 'invalid_format', {
        slug,
      });
    }

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
      .use(html, { sanitize: false })
      .process(matterResult.content);

    const contentHtml = processedContent.toString();

    // Combine the data with the slug and contentHtml
    return {
      slug,
      contentHtml,
      title: matterResult.data.title || 'Untitled',
      date: matterResult.data.date || new Date().toISOString(),
      summary: matterResult.data.summary || '',
      tags: matterResult.data.tags || [],
    };
  } catch (error) {
    if (error instanceof PostError) {
      throw error;
    }

    // Handle other types of errors
    throw new PostError(
      `Failed to process post ${slug}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'processing_error',
      {
        slug,
        originalError: error instanceof Error ? error : undefined,
      }
    );
  }
}

export function extractTableOfContents(content: string): TableOfContentsItem[] {
  const headingRegex = /<h([2-3]) id="([^"]+)">([^<]+)<\/h[2-3]>/g;
  const toc: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    toc.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: match[3]
    });
  }

  return toc;
} 