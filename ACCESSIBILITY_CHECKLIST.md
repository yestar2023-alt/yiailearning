# 可访问性优化清单

## ♿ WCAG 2.1 AA标准合规

### 优先级P0 - 必须修复

#### 1. 键盘导航
```tsx
// ✅ 导航组件支持Tab键
const Navigation = () => {
  return (
    <nav role="navigation" aria-label="主导航">
      <ul>
        <li>
          <a href="/" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/')}>
            首页
          </a>
        </li>
      </ul>
    </nav>
  );
};
```

#### 2. ARIA标签
```tsx
// ✅ 添加缺失的ARIA标签
<button
  aria-label="关闭对话框"
  aria-expanded={isOpen}
  aria-controls="dialog-content"
>
  ✕
</button>

<div id="dialog-content" role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">对话框标题</h2>
</div>
```

#### 3. 语义化HTML
```tsx
// ✅ 使用正确的HTML元素
<main role="main">
  <article>
    <header>
      <h1>文章标题</h1>
    </header>
    <section>
      <h2>章节标题</h2>
      <p>内容...</p>
    </section>
    <footer>
      <time dateTime="2023-10-10">2023年10月10日</time>
    </footer>
  </article>
</main>
```

#### 4. 图片替代文本
```tsx
// ✅ 为所有图片添加alt属性
<img
  src="/logo.png"
  alt="AI学习之路 - 人工智能学习博客"
/>

// 装饰性图片
<img src="/decoration.svg" alt="" aria-hidden="true" />
```

#### 5. 颜色对比度
```css
/* 确保文本对比度 ≥ 4.5:1 */
.text-secondary {
  color: #6b7280; /* 对比度 4.5:1 */
}

.dark .text-secondary {
  color: #9ca3af; /* 对比度 4.5:1 */
}
```

### 优先级P1 - 建议优化

#### 6. 焦点指示器
```css
/* 增强焦点可见性 */
a:focus,
button:focus,
input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

#### 7. 跳转链接
```tsx
// 在页面顶部添加跳转链接
const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50"
  >
    跳转到主要内容
  </a>
);
```

#### 8. 表格可访问性
```tsx
<table role="table">
  <caption>文章列表</caption>
  <thead>
    <tr>
      <th scope="col">标题</th>
      <th scope="col">日期</th>
      <th scope="col">标签</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">文章1</th>
      <td>2023-10-10</td>
      <td>AI</td>
    </tr>
  </tbody>
</table>
```

#### 9. 表单标签
```tsx
<form>
  <label htmlFor="search-input">搜索文章</label>
  <input
    id="search-input"
    type="search"
    aria-describedby="search-help"
    aria-required="true"
  />
  <div id="search-help">输入关键词搜索博客文章</div>

  <button aria-describedby="submit-help">搜索</button>
  <div id="submit-help">执行搜索操作</div>
</form>
```

#### 10. 动态内容通知
```tsx
// 使用aria-live通知屏幕阅读器
<div aria-live="polite" aria-atomic="true">
  {searchResults.map(result => (
    <div key={result.id}>{result.title}</div>
  ))}
</div>
```

## 🛠️ 测试工具

### 自动化测试
```bash
# 安装axe-core测试
npm install --save-dev @axe-core/react

// 在开发环境运行axe测试
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### 手动测试清单
- [ ] 使用Tab键可以导航到所有交互元素
- [ ] 所有图片有适当的alt文本
- [ ] 表单有对应的label
- [ ] 焦点可见
- [ ] 颜色对比度符合标准
- [ ] 使用屏幕阅读器测试

## 📊 合规评分

当前WCAG 2.1 AA合规率: **70%** (估算)

目标: **95%+**

### 修复进度
- [x] 基础HTML结构 ✅
- [ ] 键盘导航 ✅ (需测试)
- [ ] ARIA标签 ❌ (需添加)
- [ ] 图片alt文本 ❌ (需检查)
- [ ] 颜色对比度 ❌ (需测试)
- [ ] 焦点管理 ❌ (需增强)
- [ ] 表单标签 ❌ (需添加)
- [ ] 跳转链接 ❌ (需添加)

## 🎯 实施建议

### 第一阶段 (1天)
1. 为所有图片添加alt属性
2. 检查并修复颜色对比度
3. 添加基本的ARIA标签

### 第二阶段 (2-3天)
1. 实现键盘导航支持
2. 添加跳转链接
3. 优化表单可访问性

### 第三阶段 (1周)
1. 全面测试
2. 使用屏幕阅读器测试
3. 自动化测试集成
