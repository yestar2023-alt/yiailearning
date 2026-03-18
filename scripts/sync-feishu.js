#!/usr/bin/env node

/**
 * 飞书文档同步脚本
 * 功能：自动将飞书文档同步到博客文章
 *
 * 使用方法：
 * 1. 配置环境变量 (复制 .env.feishu.example 到 .env.local)
 * 2. 运行脚本: npm run sync:feishu
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { buildSlug, generatePostFile } = require('./feishu-sync-utils');
const { printDraftPosts } = require('./list-drafts');

class FeishuSync {
  constructor() {
    this.appId = process.env.FEISHU_APP_ID;
    this.appSecret = process.env.FEISHU_APP_SECRET;
    this.docIds = (process.env.FEISHU_DOC_IDS || '').split(',').map(id => id.trim()).filter(Boolean);
    this.token = null;
    this.tokenExpiry = null;
    this.postsDir = path.join(__dirname, '../src/data/posts');
  }

  getExistingFrontmatter(postPath) {
    if (!fs.existsSync(postPath)) {
      return {};
    }

    try {
      const existingContent = fs.readFileSync(postPath, 'utf8');
      return matter(existingContent).data || {};
    } catch (error) {
      console.warn(`⚠️ 读取现有 frontmatter 失败: ${path.basename(postPath)}`);
      return {};
    }
  }

  async getAccessToken() {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
        app_id: this.appId,
        app_secret: this.appSecret,
      });

      this.token = response.data.app_access_token;
      this.tokenExpiry = Date.now() + (response.data.expire - 300) * 1000;
      console.log('✅ 获取飞书访问令牌成功');
      return this.token;
    } catch (error) {
      console.error('❌ 获取访问令牌失败:', error.response?.data || error.message);
      throw error;
    }
  }

  async getDocumentContent(docId, docType = 'docx') {
    const token = await this.getAccessToken();
    try {
      if (docType === 'docx') {
        // 新版文档使用 blocks API
        const response = await axios.get(
          `https://open.feishu.cn/open-apis/docx/v1/documents/${docId}/blocks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page_size: 500,
            }
          }
        );

        const blocks = response.data.data?.items || [];
        return this.parseDocxBlocks(blocks);
      } else {
        // 旧版文档使用原API
        const response = await axios.get(
          `https://open.feishu.cn/open-apis/doc/v2/doc/content?doc_id=${docId}&lang=zh-CN`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return this.parseDocument(response.data.content);
      }
    } catch (error) {
      console.error(`❌ 获取文档 ${docId} 失败:`, error.response?.data || error.message);
      throw error;
    }
  }

  parseDocxBlocks(blocks) {
    let markdown = '';
    let metadata = {
      title: '',
      date: new Date(),
      tags: [],
    };

    blocks.forEach((block, index) => {
      const blockType = block.block_type;

      // 页面块（通常是文档根节点）
      if (blockType === 1) {
        // Page block, skip
        return;
      }

      // 文本块
      if (blockType === 2) {
        const text = this.extractTextFromBlock(block.text);
        if (text) {
          // 第一个非空文本作为标题
          if (!metadata.title && index < 10 && text.length < 100) {
            metadata.title = text;
          }
          markdown += text + '\n\n';
        }
      }

      // 标题块 (3=H1, 4=H2, 5=H3, ...)
      if (blockType >= 3 && blockType <= 11) {
        const text = this.extractTextFromBlock(block.heading);
        if (text) {
          const level = blockType - 2; // 3->1, 4->2, etc
          const prefix = '#'.repeat(Math.min(level, 6));

          if (!metadata.title) {
            metadata.title = text;
          }
          markdown += `${prefix} ${text}\n\n`;
        }
      }

      // 代码块
      if (blockType === 14) {
        const codeBlock = block.code;
        if (codeBlock) {
          const language = codeBlock.language || '';
          const text = this.extractTextFromBlock(codeBlock);
          markdown += `\`\`\`${language}\n${text}\n\`\`\`\n\n`;
        }
      }

      // 引用块
      if (blockType === 15) {
        const text = this.extractTextFromBlock(block.quote);
        if (text) {
          markdown += `> ${text}\n\n`;
        }
      }

      // 无序列表
      if (blockType === 12) {
        const text = this.extractTextFromBlock(block.bullet);
        if (text) {
          markdown += `- ${text}\n`;
        }
      }

      // 有序列表
      if (blockType === 13) {
        const text = this.extractTextFromBlock(block.ordered);
        if (text) {
          markdown += `1. ${text}\n`;
        }
      }

      // 图片块
      if (blockType === 27) {
        const imageToken = block.image?.token;
        if (imageToken) {
          markdown += `![图片](${imageToken})\n\n`;
        }
      }
    });

    return {
      content: markdown.trim(),
      metadata,
    };
  }

  extractTextFromBlock(blockContent) {
    if (!blockContent) return '';

    const elements = blockContent.elements || [];
    let text = '';

    elements.forEach(el => {
      if (el.text_run) {
        text += el.text_run.content || '';
      }
    });

    return text.trim();
  }

  parseDocument(content) {
    const elements = content.elements || [];
    let markdown = '';
    let metadata = {
      title: '',
      date: new Date(),
      tags: [],
    };

    elements.forEach((element, index) => {
      if (element.text_run) {
        const text = element.text_run.text || '';

        // 提取标题（通常是第一个heading）
        if (!metadata.title && index < 5 && text.length > 0 && text.length < 100) {
          metadata.title = text;
          markdown += `# ${text}\n\n`;
        } else if (element.type === 'heading1') {
          markdown += `# ${text}\n\n`;
        } else if (element.type === 'heading2') {
          markdown += `## ${text}\n\n`;
        } else if (element.type === 'heading3') {
          markdown += `### ${text}\n\n`;
        } else if (element.type === 'code') {
          const language = element.code?.language || '';
          markdown += `\`\`\`${language}\n${text}\n\`\`\`\n\n`;
        } else if (element.type === 'quote') {
          markdown += `> ${text}\n\n`;
        } else if (element.type === 'bullet' || element.type === 'number') {
          const mark = element.type === 'bullet' ? '-' : '1.';
          markdown += `${mark} ${text}\n`;
        } else {
          // 处理@提及和链接
          if (text.includes('@')) {
            markdown += text + ' ';
          } else if (text.includes('http')) {
            markdown += `[${text}](${text}) `;
          } else {
            markdown += text + '\n\n';
          }
        }
      } else if (element.image) {
        // 保留图片引用
        markdown += `![图片](${element.image?.image_key})\n\n`;
      }
    });

    return {
      content: markdown,
      metadata,
    };
  }

  async syncToPosts(docId, slug, title, docType = 'docx') {
    try {
      const docData = await this.getDocumentContent(docId, docType);
      const postPath = path.join(this.postsDir, `${slug}.md`);
      const existingMeta = this.getExistingFrontmatter(postPath);
      const frontmatter = generatePostFile(docData, existingMeta, { fallbackTitle: title });

      // 检查文件是否已存在
      if (fs.existsSync(postPath)) {
        // 读取现有文件比较内容
        const existingContent = fs.readFileSync(postPath, 'utf8');
        if (existingContent === frontmatter) {
          console.log(`⏭️ 跳过未变更的文档: ${title}`);
          return false;
        }
      }

      fs.writeFileSync(postPath, frontmatter, 'utf8');
      console.log(`✅ 已同步文档: ${title} → ${slug}.md`);
      return true;
    } catch (error) {
      console.error(`❌ 同步文档失败: ${title}`, error.message);
      return false;
    }
  }

  async getFolderDocuments(folderId) {
    const token = await this.getAccessToken();
    try {
      // 使用 v2 版本的 API（官方推荐）
      const response = await axios.get(
        `https://open.feishu.cn/open-apis/drive/explorer/v2/folder/${folderId}/children`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );

      // 处理不同的响应结构
      const respData = response.data;
      let children = [];

      if (respData.data && respData.data.children) {
        const childrenData = respData.data.children;
        // 飞书返回的children可能是对象格式 {nodeId: {name, token, type}}
        if (typeof childrenData === 'object' && !Array.isArray(childrenData)) {
          children = Object.values(childrenData);
        } else if (Array.isArray(childrenData)) {
          children = childrenData;
        }
      } else if (respData.children) {
        if (typeof respData.children === 'object' && !Array.isArray(respData.children)) {
          children = Object.values(respData.children);
        } else {
          children = respData.children;
        }
      }

      // 确保 children 是数组
      if (!Array.isArray(children)) {
        console.log('⚠️ 响应格式不符合预期，children不是数组');
        children = [];
      }

      // 获取文档类型的文件（doc, docx），返回完整信息
      const docs = children
        .filter(item => item.type === 'doc' || item.type === 'docx')
        .map(item => ({
          token: item.token,
          type: item.type,
          name: item.name || item.title || '未命名',
        }));

      console.log(`📁 文件夹中找到 ${docs.length} 个文档`);
      if (children.length > 0) {
        console.log(`   (文件夹共有 ${children.length} 个项目)`);
        docs.forEach(item => {
          console.log(`   - ${item.name} (${item.type})`);
        });
      }
      return docs;
    } catch (error) {
      const errData = error.response?.data;
      const errCode = errData?.code;
      const errMsg = errData?.msg || error.message;

      if (errCode === 99991663 || errCode === 99991664) {
        console.error('❌ 权限不足：请确保飞书应用已被添加到文件夹的协作者中');
        console.error('   解决方法：打开文件夹 → 分享 → 添加应用为协作者');
      } else if (errCode === 99991665) {
        console.error('❌ 文件夹不存在或已被删除');
      } else {
        console.error('❌ 获取文件夹内容失败:', errCode, errMsg);
      }
      return [];
    }
  }

  async syncAll() {
    // 如果配置了文件夹ID，批量获取文档
    let docs = [];
    const folderId = process.env.FEISHU_FOLDER_ID;

    if (folderId) {
      console.log(`📁 从文件夹获取文档列表: ${folderId}`);
      const folderDocs = await this.getFolderDocuments(folderId);
      docs = [...docs, ...folderDocs];
    }

    // 添加手动配置的文档ID（默认为docx类型）
    const manualDocIds = this.docIds.map(id => ({
      token: id,
      type: 'docx',
      name: `飞书文档 ${id.substring(0, 8)}`,
    }));
    docs = [...docs, ...manualDocIds];

    // 去重（按token）
    const seen = new Set();
    docs = docs.filter(doc => {
      if (seen.has(doc.token)) return false;
      seen.add(doc.token);
      return true;
    });

    if (docs.length === 0) {
      console.log('⚠️ 未配置 FEISHU_DOC_IDS，跳过同步');
      return;
    }

    console.log(`🚀 开始同步 ${docs.length} 个飞书文档...\n`);

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const doc of docs) {
      const slug = buildSlug(doc.name, doc.token);
      try {
        const result = await this.syncToPosts(doc.token, slug, doc.name, doc.type);
        if (result === true) {
          successCount++;
        } else if (result === false) {
          skipCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    console.log(`\n📊 同步完成:`);
    console.log(`  ✅ 成功: ${successCount}`);
    console.log(`  ⏭️ 跳过: ${skipCount}`);
    console.log(`  ❌ 失败: ${failCount}`);

    if (successCount > 0) {
      console.log(`\n💡 提示: 运行 'npm run build' 重新生成静态页面`);
    }

    printDraftPosts();
  }
}

// 主函数
async function main() {
  console.log('='.repeat(50));
  console.log('📝 飞书文档同步工具');
  console.log('='.repeat(50));
  console.log('');

  const sync = new FeishuSync();

  try {
    await sync.syncAll();
    console.log('\n🎉 同步任务完成！');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 同步失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = FeishuSync;
