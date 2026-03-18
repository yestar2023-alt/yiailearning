// 站点核心配置类型定义
export interface SiteConfig {
  title: string;
  description: string;
  language: string;
  url: string;
  social: {
    github?: string;
    twitter?: string;
    youtube?: string;
    wechat?: string;
    [key: string]: string | undefined;
  };
  wechat?: {
    enabled?: boolean;
    title?: string;
    accountName?: string;
    description?: string;
    qrImage?: string;
  };
  navigation: Array<{
    name: string;
    href: string;
  }>;
  logo: {
    type: 'text' | 'image';
    text?: string;
    url?: string;
    alt?: string;
  };
  copyright: string;
}

// 作者信息类型定义
export interface AuthorInfo {
  name: string;
  description: string;
  url?: string;
  image?: string;
  sameAs?: string[];
  jobTitle?: string;
  worksFor?: {
    name: string;
    url?: string;
  };
}

// 标签类型定义
export interface Tag {
  name: string;
  slug?: string;
  count?: number;
}

// 搜索相关类型定义
export interface SearchData {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  content: string;
  excerpt?: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  score: number;
  excerpt?: string;
}
