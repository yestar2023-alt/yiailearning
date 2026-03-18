/**
 * 相关文章推荐算法
 * 基于标签、内容相似度和发布时间计算相关文章
 */

import { PostMeta } from '@/types';

export interface RelatedPost extends PostMeta {
  slug: string;
  similarity: number; // 相似度分数 0-1
  reason: string; // 推荐原因
}

/**
 * 计算两个标签数组的Jaccard相似度
 * @param tags1 标签数组1
 * @param tags2 标签数组2
 * @returns 相似度分数 (0-1)
 */
function calculateTagSimilarity(tags1: string[] = [], tags2: string[] = []): number {
  const set1 = new Set(tags1.map(tag => tag.toLowerCase()));
  const set2 = new Set(tags2.map(tag => tag.toLowerCase()));

  const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
  const union = new Set([...Array.from(set1), ...Array.from(set2)]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * 计算文本相似度 (基于简单关键词匹配)
 * @param text1 文本1
 * @param text2 文本2
 * @returns 相似度分数 (0-1)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 2);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
  const union = new Set([...Array.from(set1), ...Array.from(set2)]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * 计算发布时间接近度 (越接近分数越高)
 * @param date1 日期1
 * @param date2 日期2
 * @returns 接近度分数 (0-1)
 */
function calculateDateProximity(date1: string, date2: string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();

  const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);

  // 使用指数衰减，最大分数在同一天，随着时间差增加快速降低
  return Math.exp(-diffDays / 30);
}

/**
 * 获取相关文章推荐
 * @param currentPost 当前文章
 * @param allPosts 所有文章列表
 * @param options 配置选项
 * @returns 推荐文章列表
 */
export function getRelatedPosts(
  currentPost: PostMeta & { slug: string },
  allPosts: (PostMeta & { slug: string })[],
  options: {
    limit?: number; // 返回文章数量
    minSimilarity?: number; // 最小相似度阈值
    weight?: {
      tags?: number; // 标签权重
      text?: number; // 文本相似度权重
      date?: number; // 时间权重
    };
  } = {}
): RelatedPost[] {
  const {
    limit = 5,
    minSimilarity = 0.1,
    weight = {
      tags: 0.5,
      text: 0.3,
      date: 0.2,
    },
  } = options;

  // 排除当前文章
  const otherPosts = allPosts.filter(post => post.slug !== currentPost.slug);

  // 计算每篇文章的相似度
  const scoredPosts = otherPosts.map(post => {
    // 标签相似度 (0-1)
    const tagSim = calculateTagSimilarity(currentPost.tags, post.tags);

    // 文本相似度 (0-1)
    const textSim = calculateTextSimilarity(
      currentPost.summary || '',
      post.summary || ''
    );

    // 发布时间接近度 (0-1)
    const dateProx = calculateDateProximity(currentPost.date, post.date);

    // 加权计算总分
    const totalScore =
      tagSim * weight.tags! +
      textSim * weight.text! +
      dateProx * weight.date!;

    // 生成推荐原因
    let reason = '';
    if (tagSim > 0.5) {
      const commonTags = currentPost.tags?.filter(tag =>
        post.tags?.includes(tag)
      ) || [];
      reason = `共同标签: ${commonTags.join(', ')}`;
    } else if (textSim > 0.3) {
      reason = '内容相关';
    } else if (dateProx > 0.7) {
      reason = '发布时间接近';
    } else {
      reason = '推荐阅读';
    }

    return {
      ...post,
      slug: post.slug,
      similarity: totalScore,
      reason,
    };
  });

  // 按相似度排序并过滤
  const filteredPosts = scoredPosts
    .filter(post => post.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return filteredPosts;
}

/**
 * 按标签分组获取相关文章
 * @param currentPost 当前文章
 * @param allPosts 所有文章
 * @param limitPerTag 每个标签的文章数
 * @returns 按标签分组的文章
 */
export function getRelatedPostsByTags(
  currentPost: PostMeta & { slug: string },
  allPosts: (PostMeta & { slug: string })[],
  limitPerTag: number = 3
): Record<string, RelatedPost[]> {
  const grouped: Record<string, RelatedPost[]> = {};

  currentPost.tags?.forEach(tag => {
    const postsWithTag = allPosts
      .filter(post =>
        post.slug !== currentPost.slug &&
        post.tags?.includes(tag)
      )
      .map(post => ({
        ...post,
        slug: post.slug,
        similarity: 1, // 标签完全匹配
        reason: `标签: ${tag}`,
      }))
      .slice(0, limitPerTag);

    if (postsWithTag.length > 0) {
      grouped[tag] = postsWithTag;
    }
  });

  return grouped;
}

/**
 * 获取热门文章 (基于标签频率和发布时间)
 * @param allPosts 所有文章
 * @param limit 文章数量
 * @returns 热门文章列表
 */
export function getPopularPosts(
  allPosts: (PostMeta & { slug: string })[],
  limit: number = 5
): RelatedPost[] {
  const now = new Date().getTime();

  const postsWithScore = allPosts.map(post => {
    // 标签数量分数 (标签越多可能越热门)
    const tagScore = Math.min((post.tags?.length || 0) / 5, 1);

    // 发布时间分数 (越新分数越高)
    const postDate = new Date(post.date).getTime();
    const daysSincePublished = (now - postDate) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.exp(-daysSincePublished / 30);

    // 摘要长度分数 (摘要详细可能更受欢迎)
    const summaryLength = (post.summary || '').length;
    const summaryScore = Math.min(summaryLength / 200, 1);

    // 综合分数
    const totalScore = tagScore * 0.3 + recencyScore * 0.5 + summaryScore * 0.2;

    return {
      ...post,
      slug: post.slug,
      similarity: totalScore,
      reason: '热门推荐',
    };
  });

  return postsWithScore
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * 基于类别获取相关文章
 * @param currentPost 当前文章
 * @param allPosts 所有文章
 * @param limit 文章数量
 * @returns 同类别文章
 */
export function getPostsByCategory(
  currentPost: PostMeta & { slug: string },
  allPosts: (PostMeta & { slug: string })[],
  limit: number = 5
): RelatedPost[] {
  // 如果文章有category字段，按category过滤
  if (currentPost.category) {
    return allPosts
      .filter(post =>
        post.slug !== currentPost.slug &&
        post.category === currentPost.category
      )
      .map(post => ({
        ...post,
        slug: post.slug,
        similarity: 1,
        reason: `类别: ${currentPost.category}`,
      }))
      .slice(0, limit);
  }

  // 如果没有category，基于标签获取
  return getRelatedPosts(currentPost, allPosts, { limit });
}

/**
 * 获取文章统计信息
 * @param posts 文章列表
 * @returns 统计信息
 */
export function getPostStats(posts: (PostMeta & { slug: string })[]) {
  const totalPosts = posts.length;

  // 标签统计
  const tagCounts = new Map<string, number>();
  posts.forEach(post => {
    post.tags?.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // 类别统计
  const categoryCounts = new Map<string, number>();
  posts.forEach(post => {
    if (post.category) {
      categoryCounts.set(post.category, (categoryCounts.get(post.category) || 0) + 1);
    }
  });

  // 日期范围
  const dates = posts.map(post => new Date(post.date).getTime());
  const oldestDate = new Date(Math.min(...dates));
  const newestDate = new Date(Math.max(...dates));

  return {
    totalPosts,
    topTags,
    categoryCounts: Array.from(categoryCounts.entries()),
    dateRange: {
      oldest: oldestDate,
      newest: newestDate,
    },
  };
}
