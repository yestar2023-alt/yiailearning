# 代码质量改进指南

## 📊 当前状态评估

### 已完成的优化 ✅
- ✅ TypeScript严格模式
- ✅ ESLint + Prettier配置
- ✅ 统一类型定义
- ✅ 错误处理机制
- ✅ 单元测试准备 (配置已存在)

### 需要改进的地方 ❌

## 🎯 优先级清单

### P0 - 必须立即处理

#### 1. 代码覆盖率提升到80%
```bash
当前: 0%
目标: 80%

建议:
- 优先测试核心组件 (PostCard, Navigation, ErrorBoundary)
- 测试工具函数 (error-handler, markdown utils)
- 测试页面逻辑 (posts page, blog page)
```

#### 2. 添加JSDoc注释
```typescript
/**
 * 获取所有博客文章
 * @returns Promise<PostMetadata[]> 文章元数据数组
 * @throws PostError 当读取文件失败时
 *
 * @example
 * ```typescript
 * const posts = await getAllPosts();
 * console.log(posts.length); // 4
 * ```
 */
export async function getAllPosts(): Promise<PostMetadata[]> {
  // 实现...
}
```

#### 3. 类型守卫增强
```typescript
// 添加类型守卫
export function isPostMeta(obj: unknown): obj is PostMeta {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'title' in obj &&
    'date' in obj
  );
}

export function isPostError(error: unknown): error is PostError {
  return (
    error instanceof Error &&
    'type' in error &&
    ['not_found', 'invalid_format', 'processing_error'].includes(
      (error as any).type
    )
  );
}
```

### P1 - 重要但不紧急

#### 4. API路由标准化
```typescript
// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts';

/**
 * 获取所有文章的API端点
 * @route GET /api/posts
 * @returns 200 - 文章列表
 * @returns 500 - 服务器错误
 */
export async function GET(request: NextRequest) {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
```

#### 5. 常量提取
```typescript
// src/constants/
export const SITE_CONFIG = {
  name: 'AI学习之路',
  description: '...',
  url: 'https://yourdomain.com',
} as const;

export const API_CONFIG = {
  timeout: 5000,
  retry: 3,
  retryDelay: 1000,
} as const;

export const SEO_CONFIG = {
  keywords: ['AI', '机器学习', '人工智能'],
  ogImage: '/images/og-default.jpg',
} as const;
```

#### 6. 工具函数补充
```typescript
// src/utils/
export const stringUtils = {
  slugify: (str: string): string => str.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  truncate: (str: string, length: number): string =>
    str.length > length ? str.substring(0, length) + '...' : str,
};

export const dateUtils = {
  format: (date: string | Date, locale: string = 'zh-CN'): string =>
    new Date(date).toLocaleDateString(locale),
  isValid: (date: string): boolean => !isNaN(Date.parse(date)),
};

export const arrayUtils = {
  unique: <T>(arr: T[]): T[] => [...new Set(arr)],
  chunk: <T>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    ),
};
```

#### 7. 自定义Hooks
```typescript
// src/hooks/useLocalStorage.ts
'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}

// src/hooks/useDebounce.ts
'use client';

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### P2 - 建议实施

#### 8. 状态管理优化
```typescript
// 如有需要，可考虑Zustand或Context API管理全局状态
// 当前项目规模较小，可保持现状
```

#### 9. 错误恢复策略
```typescript
// src/lib/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, onRetry } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === retries) {
        throw lastError;
      }

      onRetry?.(lastError, attempt);
      await new Promise((r) => setTimeout(r, delay * attempt));
    }
  }

  throw lastError!;
}
```

#### 10. 性能优化配置
```typescript
// src/lib/cache.ts
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new MemoryCache();
```

## 📝 代码规范

### 提交信息规范
```bash
# 使用约定式提交 (Conventional Commits)
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加或修改测试
chore: 构建工具或辅助工具
```

### 文件组织规范
```
src/
├── app/          # Next.js App Router
├── components/   # React组件 (按功能分组)
│   ├── ui/       # 通用UI组件
│   ├── forms/    # 表单组件
│   └── layout/   # 布局组件
├── hooks/        # 自定义Hooks
├── lib/          # 工具库
├── types/        # TypeScript类型
├── constants/    # 常量定义
└── utils/        # 通用工具函数
```

## 🎯 实施计划

### Week 1: 基础改进
- [ ] 添加JSDoc注释 (核心函数)
- [ ] 提取常量定义
- [ ] 创建类型守卫
- [ ] 添加单元测试 (达到50%覆盖率)

### Week 2: 工具增强
- [ ] 创建自定义Hooks
- [ ] 补充工具函数
- [ ] 实现API路由
- [ ] 添加集成测试

### Week 3: 质量提升
- [ ] 达到80%测试覆盖率
- [ ] 代码审查流程
- [ ] 性能优化
- [ ] 文档完善

## 📊 质量指标

| 指标 | 当前 | 目标 | 状态 |
|------|------|------|------|
| 测试覆盖率 | 0% | 80% | ❌ |
| 类型覆盖率 | 90% | 100% | ⚠️ |
| 文档覆盖率 | 20% | 80% | ❌ |
| 代码重复率 | 15% | <5% | ❌ |
| 复杂度 | 中等 | 低 | ⚠️ |

## 🛠️ 工具推荐

- **Storybook**: 组件文档化
- **SonarQube**: 代码质量检查
- **Husky**: Git钩子
- **lint-staged**: 暂存文件检查
