// 文章元数据类型定义
export interface PostMeta {
  title: string;
  date: string;
  tags?: string[];
  excerpt?: string;
  summary?: string; // 兼容旧的summary字段
  description?: string;
  coverImage?: string;
  author?: string;
  category?: string;
  slug?: string;
  readTime?: number;
  draft?: boolean;
  published?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  keywords?: string;
  [key: string]: unknown; // 允许其他任意字段
}

// 文章摘要类型定义
export interface PostSummary {
  slug: string;
  meta: PostMeta;
}

// 完整文章内容类型定义
export interface PostContent extends PostMeta {
  contentHtml: string;
}

// 传统的文章元数据类型（向后兼容）
export interface PostMetadata {
  title: string;
  date: string;
  summary: string;
  slug: string;
  tags?: string[];
}

// 目录项类型定义
export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

// 标题类型定义
export interface Heading {
  id: string;
  text: string;
  level: number;
}

// 文章统计信息类型定义
export interface PostStats {
  wordCount: number;
  readingTime: number;
  headingsCount: number;
  imagesCount: number;
  linksCount: number;
}

// 文章验证结果类型定义
export interface PostValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats?: PostStats;
}

// 文章排序类型定义
export type PostSortBy = 'date' | 'title' | 'readTime';
export type SortOrder = 'asc' | 'desc';

export interface PostSortOptions {
  sortBy: PostSortBy;
  order: SortOrder;
}

// 文章过滤类型定义
export interface PostFilter {
  tags?: string[];
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  difficulty?: string[];
  searchQuery?: string;
}

// 分页类型定义
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
