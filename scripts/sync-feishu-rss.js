const axios = require('axios');
const parseString = require('xml2js').parseString;
const fs = require('fs');
const path = require('path');

class FeishuRSSSync {
  constructor(rssUrl) {
    this.rssUrl = rssUrl;
  }

  async fetchRSS() {
    try {
      const response = await axios.get(this.rssUrl);
      return new Promise((resolve, reject) => {
        parseString(response.data, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    } catch (error) {
      console.error('❌ RSS获取失败:', error.message);
      throw error;
    }
  }

  convertToMarkdown(item) {
    const title = item.title[0];
    const description = item.description[0] || '';
    const pubDate = new Date(item.pubDate[0]).toISOString().split('T')[0];

    // 提取图片
    let coverImage = '';
    const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      coverImage = imgMatch[1];
    }

    // 清理HTML标签
    const content = description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim();

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9一-龥]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const frontmatter = `---
title: '${title.replace(/'/g, "\\'")}'
date: '${pubDate}'
summary: '${content.substring(0, 150)}'
tags: ['飞书同步']
coverImage: '${coverImage}'
---

${content}
`;

    return {
      slug,
      frontmatter,
      filename: `${slug}.md`
    };
  }

  async syncLatestPosts(limit = 5) {
    const rss = await this.fetchRSS();
    const items = rss.rss.channel[0].item.slice(0, limit);

    for (const item of items) {
      const post = this.convertToMarkdown(item);
      const postPath = path.join(__dirname, '../src/data/posts', post.filename);

      // 检查文件是否已存在
      if (fs.existsSync(postPath)) {
        console.log(`⏭️ 跳过已存在的文章: ${post.slug}`);
        continue;
      }

      fs.writeFileSync(postPath, post.frontmatter, 'utf8');
      console.log(`✅ 新增文章: ${post.slug}`);
    }

    console.log(`🎉 RSS同步完成！`);
  }
}

// 使用示例
const feishuRSS = new FeishuRSSSync('https://your-feishu-knowledge-base.com/rss');

// 同步最近5篇文章
feishuRSS.syncLatestPosts(5).catch(console.error);
