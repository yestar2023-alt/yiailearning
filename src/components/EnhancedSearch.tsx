'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SearchResult {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  excerpt?: string;
  score: number;
}

interface SearchSuggestion {
  text: string;
  type: 'tag' | 'recent' | 'popular';
  count?: number;
}

interface EnhancedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  maxSuggestions?: number;
  enableHistory?: boolean;
  enablePopular?: boolean;
}

export function EnhancedSearch({
  onSearch,
  placeholder = '搜索文章、标签...',
  className = '',
  showSuggestions = true,
  maxSuggestions = 8,
  enableHistory = true,
  enablePopular = true,
}: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>('search-history', []);
  const [popularSearches] = useState<string[]>(['AI工具', '机器学习', '深度学习', '神经网络', 'Python']);

  const debouncedQuery = useDebounce(query, 300);

  // 搜索建议
  const suggestions = useMemo((): SearchSuggestion[] => {
    if (!showSuggestions || !isOpen) return [];

    const suggestions: SearchSuggestion[] = [];

    // 1. 搜索历史 (最近5个)
    const recentHistory = enableHistory ? searchHistory.slice(0, 5) : [];
    if (enableHistory && query === '') {
      recentHistory.forEach(text => {
        suggestions.push({ text, type: 'recent' });
      });
    }

    // 2. 热门搜索 (当没有输入时显示)
    if (enablePopular && query === '') {
      const popular = popularSearches
        .filter(text => !recentHistory.includes(text))
        .slice(0, 3);
      popular.forEach(text => {
        suggestions.push({ text, type: 'popular' });
      });
    }

    // 3. 标签搜索建议
    if (query.length > 0) {
      const matchingTags = [
        'AI工具推荐',
        '人工智能',
        '机器学习',
        '深度学习',
        '神经网络',
        'Python',
        'TensorFlow',
        'PyTorch',
        '计算机视觉',
        '自然语言处理',
      ].filter(tag => tag.includes(query));

      matchingTags.forEach(text => {
        suggestions.push({ text, type: 'tag', count: 10 });
      });
    }

    return suggestions.slice(0, maxSuggestions);
  }, [query, isOpen, searchHistory, popularSearches, enableHistory, enablePopular, maxSuggestions, showSuggestions]);

  // 执行搜索
  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery);

      // 添加到搜索历史
      if (enableHistory) {
        setSearchHistory(prev => {
          const newHistory = [debouncedQuery, ...prev.filter(h => h !== debouncedQuery)];
          return newHistory.slice(0, 20); // 最多保存20条历史
        });
      }
    }
  }, [debouncedQuery, onSearch, enableHistory, setSearchHistory]);

  // 键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex];
          setQuery(suggestion.text);
          onSearch(suggestion.text);
          setIsOpen(false);
        } else {
          onSearch(query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, suggestions, selectedIndex, query, onSearch]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSearch(suggestion.text);
    setIsOpen(false);
  };

  // 清除搜索
  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  // 获取建议图标
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'popular':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'tag':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  // 获取建议类型标签颜色
  const getSuggestionColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return 'border border-subtle/70 bg-background-light text-secondary dark:border-white/10 dark:bg-card-dark dark:text-muted';
      case 'popular':
        return 'border border-primary/15 bg-primary/10 text-primary dark:border-primary/25 dark:bg-primary/15 dark:text-primary-light';
      case 'tag':
        return 'border border-primary/20 bg-primary/10 text-primary dark:border-primary/25 dark:bg-primary/15 dark:text-primary-light';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-[1.2rem] border border-subtle/80 bg-card-light/90 px-4 py-3 pl-12 pr-12 text-text-light shadow-soft transition-colors placeholder:text-subtle focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-card-dark/85 dark:text-text-dark dark:placeholder:text-muted dark:focus:border-primary/30 dark:focus:ring-primary/15"
          autoComplete="off"
        />

        {/* 搜索图标 */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle dark:text-muted">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* 清除按钮 */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-subtle transition-colors hover:text-primary dark:text-muted dark:hover:text-primary-light"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* 加载指示器 (可以添加) */}
      </div>

      {/* 搜索建议下拉框 */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-3 max-h-96 overflow-y-auto rounded-[1.4rem] border border-subtle/80 bg-card-light/95 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-card-dark/95">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.text}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-background-light/90 dark:hover:bg-white/5 ${index === selectedIndex ? 'bg-primary/8 dark:bg-primary/10' : ''
                }`}
            >
              <span className="text-subtle dark:text-muted">
                {getSuggestionIcon(suggestion.type)}
              </span>
              <span className="flex-1 text-text-light dark:text-text-dark">
                {suggestion.text}
              </span>
              {suggestion.count && (
                <span className="text-xs text-subtle dark:text-muted">
                  {suggestion.count}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${getSuggestionColor(suggestion.type)}`}>
                {suggestion.type === 'recent' && '最近'}
                {suggestion.type === 'popular' && '热门'}
                {suggestion.type === 'tag' && '标签'}
              </span>
            </button>
          ))}

          {/* 底部提示 */}
          <div className="border-t border-subtle/70 bg-background-light/80 px-4 py-2 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs text-subtle dark:text-muted">
              使用 ↑↓ 键导航，Enter 键选择，ESC 键关闭
            </p>
          </div>
        </div>
      )}

      {/* 背景点击关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// 高级搜索组件
export function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    tags: [] as string[],
    dateRange: 'all', // all, week, month, year
    sortBy: 'relevance', // relevance, date, title
  });

  // 执行搜索
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // 这里应该调用实际的搜索API
      // 模拟搜索结果
      await new Promise(resolve => setTimeout(resolve, 300));

      const mockResults: SearchResult[] = [
        {
          slug: 'ai-tools-for-beginners',
          title: 'AI初学者工具推荐',
          summary: '推荐最适合初学者的AI工具和平台',
          tags: ['AI工具', '初学者'],
          score: 0.95,
        },
      ];

      setSearchResults(mockResults);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <EnhancedSearch
        onSearch={handleSearch}
        placeholder="搜索文章、标签或内容..."
        className="w-full max-w-2xl mx-auto"
      />

      {/* 搜索结果 */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-secondary dark:text-muted">搜索中...</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-secondary dark:text-muted">
            找到 {searchResults.length} 篇相关文章
          </p>

          {searchResults.map(result => (
            <article
              key={result.slug}
              className="rounded-[1.4rem] border border-subtle/80 bg-card-light/90 p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg dark:border-white/10 dark:bg-card-dark/85"
            >
              <h3 className="mb-2 text-xl font-semibold text-text-light dark:text-text-dark">
                <a href={`/posts/${result.slug}`} className="transition-colors hover:text-primary dark:hover:text-primary-light">
                  {result.title}
                </a>
              </h3>
              <p className="mb-3 text-secondary dark:text-muted">
                {result.summary}
              </p>
              <div className="flex flex-wrap gap-2">
                {result.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary dark:border-primary/25 dark:bg-primary/15 dark:text-primary-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
