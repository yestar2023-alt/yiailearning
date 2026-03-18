# 测试策略文档

## 🧪 测试金字塔

### 当前测试覆盖率: **0%** (估算)

### 目标测试覆盖率
- 单元测试: **80%+**
- 集成测试: **70%+**
- E2E测试: **60%+**

## 📦 建议测试栈

### 1. 单元测试 (Jest + React Testing Library)
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

#### 示例测试文件
```typescript
// __tests__/components/PostCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PostCard } from '@/components/PostCard';

describe('PostCard', () => {
  const mockPost = {
    slug: 'test-post',
    title: '测试文章',
    date: '2023-10-10',
    tags: ['测试'],
    excerpt: '这是一篇测试文章',
  };

  it('正确渲染文章标题', () => {
    render(<PostCard {...mockPost} />);
    expect(screen.getByText('测试文章')).toBeInTheDocument();
  });

  it('点击标签触发回调', async () => {
    const onTagClick = jest.fn();
    render(<PostCard {...mockPost} onTagClick={onTagClick} />);

    const tag = screen.getByText('测试');
    await userEvent.click(tag);

    expect(onTagClick).toHaveBeenCalledWith('测试');
  });
});
```

### 2. 集成测试
```typescript
// __tests__/pages/posts.test.tsx
import { render, screen } from '@testing-library/react';
import PostsPage from '@/app/posts/page';

// Mock数据
jest.mock('@/lib/posts', () => ({
  getAllPosts: jest.fn().mockResolvedValue([
    {
      slug: 'test-post',
      meta: {
        title: '测试文章',
        date: '2023-10-10',
        tags: ['测试'],
        excerpt: '这是一篇测试文章',
      },
    },
  ]),
}));

describe('Posts Page', () => {
  it('显示文章列表', async () => {
    render(await PostsPage());

    expect(screen.getByText('测试文章')).toBeInTheDocument();
  });
});
```

### 3. E2E测试 (Playwright)
```bash
npm install --save-dev @playwright/test
```

#### 示例E2E测试
```typescript
// e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test('主页加载并显示文章', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // 检查页面标题
  await expect(page).toHaveTitle(/AI学习之路/);

  // 检查导航链接
  await expect(page.locator('text=首页')).toBeVisible();
  await expect(page.locator('text=博客')).toBeVisible();

  // 检查文章列表
  await expect(page.locator('[data-testid="post-card"]')).toHaveCount(4);
});

test('文章详情页加载', async ({ page }) => {
  await page.goto('http://localhost:3000/posts/getting-started-with-ai');

  // 检查文章标题
  await expect(page.locator('h1')).toContainText('AI入门指南');

  // 检查目录
  await expect(page.locator('[data-testid="table-of-contents"]')).toBeVisible();
});
```

## 🔧 Jest配置

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

## 📝 测试脚本

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## 🎯 测试重点

### 优先级P0 - 必须测试
1. **核心组件**
   - PostCard
   - Breadcrumb
   - Navigation

2. **工具函数**
   - getAllPosts
   - getPostBySlug
   - extractExcerpt

3. **页面**
   - 首页
   - 文章列表页
   - 文章详情页

### 优先级P1 - 建议测试
1. **辅助组件**
   - Loading
   - ErrorBoundary
   - SearchablePosts

2. **工具类**
   - ErrorHandler
   - ResultUtils

### 优先级P2 - 可选测试
1. **样式组件**
   - ThemeToggle
   - PageTitle

2. **配置**
   - SiteConfig
   - Markdown解析

## 📊 CI/CD集成

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
```

## 🎯 实施计划

### Week 1: 单元测试
- [ ] 配置Jest和Testing Library
- [ ] 编写PostCard组件测试
- [ ] 编写工具函数测试

### Week 2: 集成测试
- [ ] 测试页面组件
- [ ] 测试API集成
- [ ] 达到70%覆盖率

### Week 3: E2E测试
- [ ] 配置Playwright
- [ ] 编写主要流程测试
- [ ] 配置CI/CD
