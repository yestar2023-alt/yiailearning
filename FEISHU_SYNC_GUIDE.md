# 飞书内容同步指南

本指南将帮助你将飞书文档同步到博客网站。

## 🚀 快速开始

### 方案一：API同步（推荐）

#### 1. 创建飞书应用
```bash
1. 访问 https://open.feishu.cn/
2. 使用企业账号登录
3. 点击"创建企业自建应用"
4. 填写应用信息并创建
```

#### 2. 配置应用权限
```
必需权限：
- 读取文档内容 (doc:document:readonly)
- 读取云空间文件 (drive:drive:readonly)
- 获取用户信息 (contact:user.id:readonly)
```

#### 3. 获取文档ID
```bash
方法1：飞书文档链接
https://your-domain.feishu.cn/docs/doc_id=xxxxxxxxxxxxxx

方法2：API获取
GET https://open.feishu.cn/open-apis/drive/v1/metas
```

#### 4. 配置环境变量
```bash
# 复制环境变量模板
cp .env.feishu.example .env.local

# 编辑配置
FEISHU_APP_ID=cli_xxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxx
FEISHU_DOC_IDS=doc_id_1,doc_id_2,doc_id_3
```

#### 5. 安装必要依赖
```bash
npm install axios xml2js
```

#### 6. 执行同步
```bash
# 手动同步
npm run sync:feishu

# 定时同步
npm run sync:feishu:schedule
```

### 方案二：RSS同步

#### 1. 启用飞书知识库RSS
```bash
1. 打开飞书知识库
2. 点击"分享" → "获取RSS链接"
3. 复制RSS地址
```

#### 2. 配置RSS同步
```bash
# 在 .env.local 中添加
FEISHU_RSS_URL=https://your-knowledge-base.com/rss
FEISHU_SYNC_LIMIT=5
```

#### 3. 执行RSS同步
```bash
npm run sync:feishu:rss
```

## 🔧 高级配置

### 自动构建触发

创建触发文件：
```javascript
// scripts/trigger-build.js
const fs = require('fs');

function triggerBuild() {
  const timestamp = new Date().toISOString();
  fs.writeFileSync('.last-sync', timestamp);
  console.log(`✅ 构建触发器已更新: ${timestamp}`);
}

module.exports = triggerBuild;
```

### GitHub Secrets配置

在GitHub仓库设置中添加：
```
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx
FEISHU_DOC_IDS=doc_id_1,doc_id_2
```

### 自定义同步规则

在同步脚本中添加过滤条件：
```javascript
// 只同步标记了"发布"标签的文档
const filteredDocs = docs.filter(doc => {
  return doc.tags && doc.tags.includes('发布');
});
```

## 📝 文档格式转换

### 飞书 → Markdown 映射表

| 飞书元素 | Markdown格式 | 示例 |
|---------|-------------|------|
| 标题1 | `# 标题1` | `# 章节一` |
| 标题2 | `## 标题2` | `## 小节1.1` |
| 标题3 | `### 标题3` | `### 具体内容` |
| 加粗 | `**文本**` | `**重要**` |
| 斜体 | `*文本*` | `*强调*` |
| 链接 | `[文本](url)` | `[链接](https://)` |
| 代码 | `` `代码` `` | `` `console.log()` `` |
| 代码块 | ```代码块``` | ```js\ncode\n``` |
| 列表 | `- 列表项` | `- 第一项` |
| 引用 | `> 引用` | `> 这是引用` |
| 表格 | `\| 列1 \| 列2 \|` | 表格语法 |

## 🔍 故障排查

### 常见问题

#### 1. 获取access_token失败
```bash
错误：invalid_app_id
解决：检查 FEISHU_APP_ID 是否正确
```

#### 2. 权限不足
```bash
错误：insufficient_app_permissions
解决：在飞书后台为应用添加必要权限
```

#### 3. 文档不存在
```bash
错误：doc_not_found
解决：检查 doc_id 是否正确，文档是否存在
```

#### 4. 同步失败但构建成功
```bash
原因：网络问题或API限流
解决：添加重试机制，降低同步频率
```

### 调试模式

启用详细日志：
```bash
DEBUG=feishu-sync npm run sync:feishu
```

## 📊 最佳实践

### 1. 文档结构
```
建议的飞书文档结构：
📄 文章标题
📝 摘要
🏷️ 标签
📅 发布日期
```

### 2. 同步策略
```bash
# 建议同步频率：
开发环境：手动同步
生产环境：每6小时自动同步
```

### 3. 版本控制
```bash
# 同步后的文件会自动提交到Git
# 每次同步都会生成唯一的commit message
```

### 4. 备份策略
```bash
# 定期备份原始飞书文档
# 保留同步日志和错误记录
```

## 🛠️ 扩展功能

### 添加新功能

1. **图片同步**
```javascript
// 下载飞书文档中的图片
async function downloadImages(content) {
  const imageUrls = extractImageUrls(content);
  for (const url of imageUrls) {
    await downloadAndSave(url);
  }
}
```

2. **评论同步**
```javascript
// 同步评论为文章备注
async function syncComments(docId) {
  const comments = await getComments(docId);
  return comments.map(comment => `> ${comment.content}`).join('\n');
}
```

3. **智能摘要生成**
```javascript
// 根据文档内容生成摘要
function generateSummary(content) {
  const sentences = extractSentences(content);
  return sentences.slice(0, 2).join(' ');
}
```

## 📞 技术支持

如有问题，请：
1. 查看同步日志
2. 检查环境变量配置
3. 验证飞书应用权限
4. 参考故障排查部分

---

**参考资源**：
- [飞书开放平台文档](https://open.feishu.cn/document/)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [RSS规范](https://www.rssboard.org/)
