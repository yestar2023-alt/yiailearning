# 🚀 飞书同步完整指南

## 📋 五种管理多篇文档的方法

恭喜！现在你有了**5种**管理多篇飞书文档的方法，再也不用每次手动改ID了！

---

## ✨ 方法一：文件夹批量管理（推荐⭐⭐⭐⭐⭐）

### 优势
- ✅ 只需配置一次文件夹ID
- ✅ 自动发现新文档
- ✅ 无需手动维护文档列表

### 使用步骤

#### 1. 获取文件夹ID
```bash
打开飞书文件夹，查看URL：
https://你的公司.feishu.cn/drive/folder/flXXXXXXXXXXXX

文件夹ID: flXXXXXXXXXXXX
```

#### 2. 配置环境变量
```bash
# .env.local
FEISHU_APP_ID=cli_xxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxx
FEISHU_FOLDER_ID=flXXXXXXXXXXXX
FEISHU_SYNC_LIMIT=10
```

#### 3. 执行同步
```bash
# 同步文件夹中所有文档
npm run sync:all

# 自动发现新文档（推荐第一次使用）
npm run sync:discover
```

#### 4. 查看文档列表
```bash
npm run docs:list
```

---

## 🔧 方法二：文档配置管理

### 优势
- ✅ 精细化控制每篇文档
- ✅ 可以分组管理
- ✅ 支持启用/禁用

### 使用步骤

#### 1. 添加单篇文档
```bash
# 基本添加
npm run docs:add doccnAbCdEfGhIj "我的AI学习笔记" AI 学习

# 参数说明
# doccnAbCdEfGhIj: 文档ID
# "我的AI学习笔记": 标题（可选）
# AI 学习: 标签（可选，多个用空格分隔）
```

#### 2. 查看文档列表
```bash
# 列出所有文档
npm run docs:list

# 只显示启用的文档
npm run docs:list --enabled

# 搜索文档
npm run docs:list --search=AI

# 按文件夹筛选
npm run docs:list --folder=AI
```

#### 3. 管理文档
```bash
# 禁用文档（暂停同步）
npm run docs:disable doccnAbCdEfGhIj

# 启用文档
npm run docs:enable doccnAbCdEfGhIj

# 删除文档
npm run docs:remove doccnAbCdEfGhIj

# 更新文档信息
npm run docs:update doccnAbCdEfGhIj title="新标题" tags="AI,机器学习"
```

#### 4. 导出配置
```bash
# 导出为环境变量文件
npm run docs:export

# 这会生成 .env.docs 文件，包含所有启用的文档ID
```

#### 5. 执行同步
```bash
# 同步所有启用的文档
npm run sync:all

# 强制同步（跳过变更检查）
npm run sync:force

# 并行同步（更快）
npm run sync:all --parallel

# 限制同步数量
npm run sync:all --limit=5
```

---

## 📂 方法三：混合模式（文件夹+手动）

### 使用场景
- 主要文档在文件夹中自动同步
- 特殊文档手动添加

### 配置示例
```bash
# .env.local
FEISHU_APP_ID=cli_xxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxx

# 文件夹：自动获取
FEISHU_FOLDER_ID=flXXXXXXXXXXXX

# 额外手动文档（添加到 docs.config.json）
# 使用 npm run docs:add 添加
```

### 同步逻辑
```bash
1. 从文件夹自动获取所有文档
2. 加上手动配置的文档
3. 去重（相同ID不会重复）
4. 同步所有启用的文档
```

---

## 🔄 方法四：RSS自动同步

### 适用场景
- 飞书知识库支持RSS
- 不想配置应用权限

### 使用步骤

#### 1. 获取RSS链接
```bash
在飞书知识库中：
1. 点击"分享" → "获取RSS链接"
2. 复制RSS地址
```

#### 2. 配置RSS
```bash
# .env.local
FEISHU_RSS_URL=https://你的知识库.com/rss
FEISHU_SYNC_LIMIT=5
```

#### 3. 执行RSS同步
```bash
npm run sync:feishu:rss
```

---

## ⚡ 方法五：GitHub Actions 自动同步

### 优势
- ✅ 完全自动化
- ✅ 定时同步
- ✅ 自动部署

### 使用步骤

#### 1. 创建GitHub Action
创建 `.github/workflows/feishu-sync.yml`：

```yaml
name: 🚀 飞书文档同步

on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨2点
  workflow_dispatch:  # 手动触发

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 检出代码
        uses: actions/checkout@v3

      - name: ⚙️ 设置 Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: 📦 安装依赖
        run: npm install

      - name: 🔍 自动发现新文档
        env:
          FEISHU_APP_ID: ${{ secrets.FEISHU_APP_ID }}
          FEISHU_APP_SECRET: ${{ secrets.FEISHU_APP_SECRET }}
          FEISHU_FOLDER_ID: ${{ secrets.FEISHU_FOLDER_ID }}
        run: npm run sync:discover

      - name: 🔄 批量同步文档
        env:
          FEISHU_APP_ID: ${{ secrets.FEISHU_APP_ID }}
          FEISHU_APP_SECRET: ${{ secrets.FEISHU_APP_SECRET }}
          FEISHU_DOC_IDS: ${{ secrets.FEISHU_DOC_IDS }}
          FEISHU_FOLDER_ID: ${{ secrets.FEISHU_FOLDER_ID }}
        run: npm run sync:all --parallel

      - name: 📝 提交更改
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -A
          git commit -m "📝 自动同步飞书文档 $(date)" || exit 0

      - name: 🚀 推送更改
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

#### 2. 配置GitHub Secrets
在GitHub仓库 → Settings → Secrets and variables → Actions：

```
FEISHU_APP_ID=cli_xxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx
FEISHU_FOLDER_ID=flXXXXXXXXXXXX
FEISHU_DOC_IDS=（可选，如果不使用文件夹）
```

#### 3. 手动触发
在GitHub仓库 → Actions → "飞书文档同步" → Run workflow

---

## 🎯 最佳实践推荐

### 🏆 推荐方案：文件夹批量管理

**适用场景**：大部分文档都在一个或几个文件夹中

```bash
# 1. 配置文件夹ID
FEISHU_FOLDER_ID=flXXXXXXXXXXXX

# 2. 定期运行自动发现
npm run sync:discover

# 3. 批量同步
npm run sync:all --parallel

# 4. GitHub Actions自动化
# 每天自动同步
```

### 🎯 备选方案：精细化管理

**适用场景**：需要对每篇文档精细控制

```bash
# 1. 手动添加重要文档
npm run docs:add doccnAbCdEfGhIj "核心文档1" 核心

# 2. 分组管理
npm run docs:add doccnXyZaBcDeFg "AI笔记" AI 机器学习
npm run docs:add doccnMnOpQrStUv "Python教程" Python 编程

# 3. 查看和管理
npm run docs:list --folder=AI

# 4. 同步
npm run sync:all --folder=AI
```

---

## 📊 使用场景对比

| 方案 | 易用性 | 灵活性 | 自动化 | 推荐度 |
|------|--------|--------|--------|--------|
| 文件夹批量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🏆 |
| 精细化管理 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 🥈 |
| 混合模式 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🥉 |
| RSS同步 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | - |
| GitHub Actions | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | 🏆 |

---

## 🛠️ 常用命令速查表

### 文档管理
```bash
# 添加文档
npm run docs:add <docId> [title] [tags...]

# 查看文档
npm run docs:list [--enabled] [--folder=name] [--search=keyword]

# 管理文档
npm run docs:enable <docId>     # 启用
npm run docs:disable <docId>    # 禁用
npm run docs:remove <docId>     # 删除

# 导出配置
npm run docs:export
```

### 批量同步
```bash
# 同步所有
npm run sync:all

# 强制同步
npm run sync:force

# 发现新文档
npm run sync:discover

# 并行同步（更快）
npm run sync:all --parallel

# 限制数量
npm run sync:all --limit=5
```

---

## 🔍 文档ID快速获取方法

### 方法1：从链接提取
```
文档链接：
https://你的公司.feishu.cn/docs/doccnAbCdEfGhIjKlMnOp

文档ID：
doccnAbCdEfGhIjKlMnOp
```

### 方法2：从文件夹批量获取
```bash
npm run sync:discover
# 自动显示文件夹中的所有文档ID
```

### 方法3：从飞书API获取
```bash
# 需要先配置 FEISHU_FOLDER_ID
node -e "console.log('文件夹ID: ' + process.env.FEISHU_FOLDER_ID)"
```

---

## 📝 工作流程示例

### 场景：我在飞书写了5篇新文章

#### 方案1：使用文件夹
```bash
1. 把文章放在飞书"博客文章"文件夹
2. 运行: npm run sync:discover
3. 确认发现新文档: y
4. 运行: npm run sync:all --parallel
5. 完成！ ✅
```

#### 方案2：手动管理
```bash
1. 获取5篇文章的ID
2. 批量添加:
   npm run docs:add docid1 "文章1" 标签1 标签2
   npm run docs:add docid2 "文章2" 标签1 标签3
   ... (重复5次)
3. 同步: npm run sync:all
4. 完成！ ✅
```

---

## ❌ 常见问题

### Q1: 文件夹同步失败
```bash
错误：insufficient_app_permissions
解决：
1. 飞书应用需要"读取云空间文件"权限
2. 发布应用版本
```

### Q2: 文档ID找不到
```bash
解决方案：
1. 检查文档ID是否正确
2. 确认有权限访问文档
3. 使用 npm run sync:discover 自动获取
```

### Q3: 同步很慢
```bash
解决方案：
1. 使用并行同步: npm run sync:all --parallel
2. 限制同步数量: npm run sync:all --limit=5
3. 使用文件夹批量模式
```

### Q4: 新文档没同步
```bash
检查：
1. 文档是否在配置的文件夹中
2. 运行 npm run sync:discover 自动发现
3. 手动添加: npm run docs:add <新文档ID>
```

---

## 🎉 总结

现在你有了**5种方法**管理多篇文档：

1. **文件夹批量管理** - 一次配置，自动同步
2. **精细化管理** - 手动控制每篇文档
3. **混合模式** - 文件夹+手动
4. **RSS同步** - 简单但功能有限
5. **GitHub Actions** - 完全自动化

**推荐**：使用**文件夹批量管理** + **GitHub Actions**，省心省力！ 🚀

有任何问题，随时问我！ 😊
