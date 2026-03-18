import { ReactNode } from 'react';

// 面包屑导航类型定义
export interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

// 文章卡片类型定义
export interface PostCardProps {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  excerpt?: string;
  coverImage?: string;
  onTagClick?: (tag: string) => void;
  className?: string;
}

// 页面标题类型定义
export interface PageTitleProps {
  children: ReactNode;
  className?: string;
}

// 内部链接类型定义
export interface InternalLinkProps {
  href: string;
  children: ReactNode;
  title?: string;
  className?: string;
}

// 相关文章类型定义
export interface RelatedArticle {
  title: string;
  href: string;
  description: string;
  date?: string;
  tags?: string[];
}

export interface RelatedArticlesProps {
  articles: RelatedArticle[];
  title?: string;
  className?: string;
}

// 关键词高亮类型定义
export interface KeywordHighlightProps {
  children: ReactNode;
  keywords?: string[];
  className?: string;
}

// 目录组件类型定义
export interface TableOfContentsProps {
  headings: Array<{
    id: string;
    text: string;
    level: number;
  }>;
  maxDepth?: number;
  className?: string;
}

// 标签组件类型定义
export interface TagProps {
  tag: string;
  count?: number;
  onClick?: (tag: string) => void;
  className?: string;
  variant?: 'default' | 'small' | 'large';
}

export interface TagListProps {
  tags: string[];
  selectedTags?: string[];
  onTagClick?: (tag: string) => void;
  className?: string;
  maxTags?: number;
}

// 搜索组件类型定义
export interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export interface SearchResultsProps {
  results: Array<{
    slug: string;
    title: string;
    summary: string;
    tags: string[];
    excerpt?: string;
  }>;
  query: string;
  isLoading?: boolean;
  className?: string;
}

// 加载状态类型定义
export interface LoadingProps {
  message?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

// 错误状态类型定义
export interface ErrorProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

// 按钮组件类型定义
export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

// 通用卡片类型定义
export interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

// 导航菜单类型定义
export interface NavigationItem {
  name: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
  badge?: string | number;
}

export interface NavigationProps {
  items: NavigationItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

// 模态框类型定义
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

// 工具提示类型定义
export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}