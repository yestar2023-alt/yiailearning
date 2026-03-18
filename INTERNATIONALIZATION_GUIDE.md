# 国际化(i18n)实施指南

## 🌐 当前状态
- **当前语言**: 仅中文
- **目标**: 支持中英文双语

## 📦 实施步骤

### 1. 安装依赖
```bash
npm install next-intl
```

### 2. 配置next.config.js
```javascript
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // 现有配置...
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    localeDetection: true,
  },
};

module.exports = withNextIntl(nextConfig);
```

### 3. 创建翻译文件
```
src/messages/
├── zh.json (中文)
└── en.json (英文)
```

#### 中文翻译 (zh.json)
```json
{
  "navigation": {
    "home": "首页",
    "blog": "博客",
    "resources": "资源",
    "roadmap": "学习路线"
  },
  "home": {
    "title": "AI学习之路",
    "subtitle": "探索人工智能的学习路径、工具和资源",
    "latestPosts": "最新文章",
    "allPosts": "查看所有文章"
  },
  "blog": {
    "title": "博客",
    "searchPlaceholder": "搜索文章...",
    "noResults": "未找到相关文章",
    "tags": "标签",
    "readingTime": "阅读时间"
  },
  "common": {
    "loadMore": "加载更多",
    "backToHome": "返回首页",
    "previous": "上一页",
    "next": "下一页",
    "date": "日期",
    "author": "作者"
  }
}
```

#### 英文翻译 (en.json)
```json
{
  "navigation": {
    "home": "Home",
    "blog": "Blog",
    "resources": "Resources",
    "roadmap": "Roadmap"
  },
  "home": {
    "title": "AI Learning Journey",
    "subtitle": "Exploring AI learning paths, tools and resources",
    "latestPosts": "Latest Posts",
    "allPosts": "View All Posts"
  },
  "blog": {
    "title": "Blog",
    "searchPlaceholder": "Search posts...",
    "noResults": "No articles found",
    "tags": "Tags",
    "readingTime": "Reading time"
  },
  "common": {
    "loadMore": "Load More",
    "backToHome": "Back to Home",
    "previous": "Previous",
    "next": "Next",
    "date": "Date",
    "author": "Author"
  }
}
```

### 4. 创建i18n配置
```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));
```

### 5. 创建Layout包装器
```tsx
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

### 6. 创建中间件
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### 7. 使用翻译
```tsx
// src/components/Navigation.tsx
import { useTranslations } from 'next-intl';

export function Navigation() {
  const t = useTranslations('navigation');

  return (
    <nav>
      <ul>
        <li><Link href="/">{t('home')}</Link></li>
        <li><Link href="/blog">{t('blog')}</Link></li>
        <li><Link href="/resources">{t('resources')}</Link></li>
        <li><Link href="/roadmap">{t('roadmap')}</Link></li>
      </ul>
    </nav>
  );
}
```

### 8. 语言切换组件
```tsx
// src/components/LanguageSwitcher.tsx
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const switchLanguage = (newLocale: string) => {
    router.replace('/', { locale: newLocale });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => switchLanguage('zh')}
        className={locale === 'zh' ? 'active' : ''}
      >
        中文
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={locale === 'en' ? 'active' : ''}
      >
        English
      </button>
    </div>
  );
}
```

## 📊 实施进度

- [ ] 安装依赖
- [ ] 配置Next.js i18n
- [ ] 创建翻译文件
- [ ] 实现Layout国际化
- [ ] 添加语言切换
- [ ] 翻译所有组件
- [ ] SEO优化(多语言meta)
- [ ] 测试所有语言

## 🎯 预估工作量

- **第一周**: 配置和基础翻译
- **第二周**: 组件国际化
- **第三周**: 测试和优化

## 📚 参考资源

- [next-intl官方文档](https://next-intl-docs.vercel.app/)
- [Next.js i18n路由](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
