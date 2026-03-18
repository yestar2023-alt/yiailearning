---
title: "如何快速部署网站并绑定域名：从 GitHub 到 Vercel 的完整实战指南"
date: "2024-12-25"
description: "详细记录网站部署上线的完整流程，包括 GitHub 代码托管、Cloudflare 域名解析、Vercel 自动化部署等关键步骤，帮助你更稳地把网站上线。"
summary: "这是一篇从代码托管到域名解析再到正式上线的完整部署记录。内容覆盖 GitHub、Cloudflare 和 Vercel 的实际配置步骤，适合第一次做个人网站或博客部署的人快速照着走一遍，少踩一些域名解析、HTTPS、自动部署和上线联调上的坑。"
excerpt: "从 GitHub 托管到 Cloudflare 域名解析，再到 Vercel 自动部署，这篇文章把个人网站上线过程中最关键的步骤和容易踩坑的地方都整理出来了。"
tags: ["部署", "域名", "Vercel", "Cloudflare", "GitHub"]
category: "技术教程"
keywords: "网站部署,域名绑定,Vercel 部署,Cloudflare DNS,GitHub 托管,博客上线"
---

## 如何快速部署网站并绑定域名：完整实战指南

最近成功将我的博客网站部署上线，在这个过程中踩了一些坑，也总结了一些经验。本文详细记录整个部署流程，希望能帮助到有相同需求的朋友。

## 🚀 部署流程概览

整个部署过程主要分为三个步骤：
1. **代码托管**：将项目代码上传到 GitHub
2. **域名解析**：使用 Cloudflare 进行域名解析配置
3. **网站部署**：通过 Vercel 实现自动化部署

---

## 📂 第一步：代码托管到 GitHub

### 为什么选择 GitHub？

- 与各大部署平台集成良好
- 支持私有和公开仓库
- 版本控制功能强大
- 社区生态完善

### 使用 Cursor 快速提交代码

如果你使用 Cursor 编辑器，可以通过以下方式实现快速提交：

1. **配置快捷键**
   - 打开 Cursor 设置
   - 找到键盘快捷键配置
   - 设置 Git 提交快捷键

![Cursor设置快捷键界面](/images/posts/cursor-settings-shortcut.png)

![Cursor快捷键配置详情](/images/posts/cursor-git-shortcut-config.png)

2. **一键提交流程**
   ```bash
   # Cursor 会自动执行以下命令
   git add .
   git commit -m "你的提交信息"
   git push origin main
   ```

**💡 提示**：建议设置有意义的提交信息，方便后续版本管理。

---

## 🌐 第二步：Cloudflare 域名解析

### 为什么使用 Cloudflare？

- **免费 CDN 加速**：全球节点，访问速度更快
- **DDoS 防护**：基础安全防护功能
- **SSL 证书**：免费 HTTPS 证书自动配置
- **灵活的 DNS 管理**：支持各种记录类型

### 详细配置步骤

#### 1. 添加域名到 Cloudflare

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击「添加站点」
3. 输入你的域名（例如：example.com）
4. 选择免费计划
5. Cloudflare 会自动扫描现有 DNS 记录

![Cloudflare添加站点界面](/images/posts/cloudflare-add-site.png)

![Cloudflare域名扫描结果](/images/posts/cloudflare-dns-scan.png)

![Cloudflare获取NS记录](/images/posts/cloudflare-get-nameservers.png)

#### 2. 获取 Cloudflare DNS 服务器

完成域名添加后，Cloudflare 会提供两个 NS（名称服务器）记录，类似：
```
ns1.cloudflare.com
ns2.cloudflare.com
```

#### 3. 修改域名注册商的 DNS 设置

以 Spaceship 为例：

1. 登录 [Spaceship 控制台](https://www.spaceship.com/application/domain-list-application/)
2. 找到你的域名，点击「管理」
3. 进入「DNS 设置」页面
4. 将默认的 DNS 服务器替换为 Cloudflare 提供的 NS 记录
5. 保存设置

**⚠️ 注意**：DNS 生效通常需要 24-48 小时，但一般在几分钟到几小时内就会生效。

![Spaceship域名管理界面](/images/posts/spaceship-domain-management.png)

![Spaceship修改DNS服务器](/images/posts/spaceship-change-nameservers.png)

#### 4. 关键安全设置

##### 加密模式配置
```
SSL/TLS → 概述 → 加密模式 → 选择「完全（严格）」
```

**重要说明**：
- 「灵活」模式：可能导致重定向循环
- 「完全」模式：推荐用于大多数情况
- 「完全（严格）」：最安全，需要有效证书

![Cloudflare SSL设置页面](/images/posts/cloudflare-ssl-settings.png)

![Cloudflare加密模式选择](/images/posts/cloudflare-encryption-mode.png)

##### 强制 HTTPS
```
SSL/TLS → 边缘证书 → 始终使用 HTTPS → 开启
```

这个设置会自动将所有 HTTP 请求重定向到 HTTPS。

![Cloudflare强制HTTPS设置](/images/posts/cloudflare-force-https.png)

---

## 🚢 第三步：Vercel 部署

### 为什么选择 Vercel？

- **零配置部署**：支持主流前端框架
- **自动化 CI/CD**：Git 推送自动触发部署
- **全球 CDN**：边缘网络加速
- **免费额度充足**：个人项目完全够用

### 部署步骤

#### 1. 连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击「New Project」
3. 选择「Import Git Repository」
4. 授权 Vercel 访问你的 GitHub 账户
5. 选择要部署的仓库

#### 2. 配置部署设置

```javascript
// vercel.json 配置示例（可选）
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "nextjs",
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3. 绑定自定义域名

1. 在项目设置中找到「Domains」
2. 点击「Add Domain」
3. 输入你的域名（例如：example.com）
4. 同时添加 www 子域名（例如：www.example.com）

#### 4. 配置域名重定向

**推荐配置**：将 www 域名重定向到主域名
```
www.example.com → example.com (308 永久重定向)
```

这样做的好处：
- SEO 友好，避免重复内容
- 用户体验统一
- 域名权重集中

![Vercel域名绑定配置](/images/posts/vercel-domain-configuration.png)

---

## 📋 部署后检查清单

### 功能性检查
- [ ] 网站可以正常访问
- [ ] HTTPS 证书正常工作
- [ ] 移动端响应式正常
- [ ] 页面加载速度合理

### SEO 检查
- [ ] 域名重定向正确配置
- [ ] sitemap.xml 文件存在
- [ ] robots.txt 文件配置正确
- [ ] 页面 meta 标签完整

### 性能优化
- [ ] 启用 Cloudflare 缓存
- [ ] 图片资源优化
- [ ] CSS/JS 文件压缩
- [ ] 启用 Gzip 压缩

---

## 🔧 常见问题解决

### 1. 网站无法访问
**可能原因**：
- DNS 解析未生效
- Cloudflare 加密模式设置错误
- Vercel 部署失败

**解决方案**：
```bash
# 检查 DNS 解析
nslookup your-domain.com

# 查看部署日志
# 在 Vercel Dashboard 中查看 Functions 标签页
```

### 2. HTTPS 证书问题
**解决步骤**：
1. 确认 Cloudflare 加密模式为「完全」或「完全（严格）」
2. 检查「始终使用 HTTPS」是否开启
3. 清除浏览器缓存重试

### 3. 部署失败
**常见错误排查**：
```bash
# 检查 package.json 中的构建脚本
"scripts": {
  "build": "next build",
  "start": "next start"
}

# 确认 Node.js 版本兼容性
"engines": {
  "node": ">=18.0.0"
}

---

## 📚 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Cloudflare 学习中心](https://www.cloudflare.com/learning/)
- [GitHub Actions 自动化部署](https://docs.github.com/en/actions)

通过以上步骤，你应该能够成功部署并绑定域名。如果在操作过程中遇到问题，建议查看对应平台的官方文档，或者在相关社区寻求帮助。

记住，第一次部署可能会遇到各种问题，这是正常的。重要的是记录每次的解决方案，为将来的项目积累经验。
