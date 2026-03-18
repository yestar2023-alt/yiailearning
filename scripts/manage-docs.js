#!/usr/bin/env node

/**
 * 文档ID管理工具
 * 方便管理多篇飞书文档的同步
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const DOCS_CONFIG_FILE = 'docs.config.json';
const POSTS_DIR = path.join(__dirname, '../src/data/posts');

/**
 * 文档配置管理类
 */
class DocManager {
  constructor() {
    this.configFile = path.join(process.cwd(), DOCS_CONFIG_FILE);
    this.config = this.loadConfig();
  }

  /**
   * 加载配置文件
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const content = fs.readFileSync(this.configFile, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('❌ 加载配置文件失败:', error.message);
    }

    // 返回默认配置
    return {
      docs: [],
      lastSync: null,
      autoSync: false,
      syncInterval: 3600000, // 1小时
    };
  }

  /**
   * 保存配置文件
   */
  saveConfig() {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2), 'utf8');
      console.log('✅ 配置文件已保存');
      return true;
    } catch (error) {
      console.error('❌ 保存配置文件失败:', error.message);
      return false;
    }
  }

  /**
   * 添加文档
   */
  addDoc(docId, title, tags = [], folder = 'default', type = 'docx') {
    // 检查是否已存在
    const existing = this.config.docs.find(doc => doc.id === docId);
    if (existing) {
      console.log(`⚠️ 文档已存在: ${title}`);
      return false;
    }

    const slug = this.generateSlug(title || docId);
    const doc = {
      id: docId,
      title: title || docId.substring(0, 8),
      slug,
      type,
      tags,
      folder,
      enabled: true,
      created: new Date().toISOString(),
      lastSync: null,
    };

    this.config.docs.push(doc);
    this.saveConfig();

    console.log(`✅ 已添加文档: ${doc.title}`);
    console.log(`   ID: ${docId}`);
    console.log(`   标签: ${tags.join(', ')}`);
    return true;
  }

  /**
   * 批量添加文档
   */
  addDocs(docIds, baseTitle = '飞书文档', tags = []) {
    docIds.forEach((docId, index) => {
      const title = `${baseTitle} ${index + 1}`;
      this.addDoc(docId, title, tags);
    });
  }

  /**
   * 删除文档
   */
  removeDoc(docId) {
    const index = this.config.docs.findIndex(doc => doc.id === docId);
    if (index === -1) {
      console.log(`❌ 未找到文档: ${docId}`);
      return false;
    }

    this.config.docs.splice(index, 1);
    this.saveConfig();
    console.log(`✅ 已删除文档: ${docId}`);
    return true;
  }

  /**
   * 更新文档
   */
  updateDoc(docId, updates) {
    const doc = this.config.docs.find(doc => doc.id === docId);
    if (!doc) {
      console.log(`❌ 未找到文档: ${docId}`);
      return false;
    }

    Object.assign(doc, updates);
    this.saveConfig();
    console.log(`✅ 已更新文档: ${doc.title}`);
    return true;
  }

  /**
   * 启用/禁用文档
   */
  toggleDoc(docId, enabled) {
    return this.updateDoc(docId, { enabled });
  }

  /**
   * 列出所有文档
   */
  listDocs(filter = {}) {
    let docs = [...this.config.docs];

    // 应用过滤器
    if (filter.enabled !== undefined) {
      docs = docs.filter(doc => doc.enabled === filter.enabled);
    }
    if (filter.folder) {
      docs = docs.filter(doc => doc.folder === filter.folder);
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      docs = docs.filter(doc =>
        doc.title.toLowerCase().includes(search) ||
        doc.id.toLowerCase().includes(search)
      );
    }

    return docs;
  }

  /**
   * 显示文档列表
   */
  showDocs(options = {}) {
    const docs = this.listDocs(options);
    const folder = options.folder;

    if (docs.length === 0) {
      console.log('📄 暂无文档配置');
      return;
    }

    console.log(`\n📚 文档列表${folder ? ` - 文件夹: ${folder}` : ''} (${docs.length}篇)`);
    console.log('=' .repeat(80));

    docs.forEach(doc => {
      const status = doc.enabled ? '✅' : '⏸️';
      const syncStatus = doc.lastSync ? `上次同步: ${new Date(doc.lastSync).toLocaleString()}` : '未同步';
      console.log(`${status} ${doc.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   文件: ${doc.slug}.md`);
      console.log(`   标签: ${doc.tags.join(', ') || '无'}`);
      console.log(`   ${syncStatus}`);
      console.log('-'.repeat(80));
    });

    console.log(`\n总计: ${docs.length} 篇文档 (启用: ${docs.filter(d => d.enabled).length})`);
  }

  /**
   * 生成文件 slug
   */
  generateSlug(title) {
    const slug = title
      .normalize('NFKC')
      .trim()
      .toLowerCase()
      .replace(/[<>:"/\\|?*]/g, '') // 移除文件名非法字符
      .replace(/\s+/g, '-') // 空格转横线
      .replace(/-+/g, '-') // 多个横线合并
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    return slug || `doc-${Date.now()}`;
  }

  /**
   * 导出环境变量格式
   */
  exportEnv() {
    const enabledDocs = this.config.docs.filter(doc => doc.enabled);
    const docIds = enabledDocs.map(doc => doc.id).join(',');
    const envContent = `# 文档ID列表 (由 docs.config.json 自动生成)
# 生成时间: ${new Date().toISOString()}
FEISHU_DOC_IDS=${docIds}

# 可选: 文件夹ID (自动获取文件夹内所有文档)
FEISHU_FOLDER_ID=

# 其他配置
FEISHU_SYNC_LIMIT=10
`;

    fs.writeFileSync('.env.docs', envContent);
    console.log('✅ 已导出到 .env.docs 文件');
  }

  /**
   * 更新同步时间
   */
  updateSyncTime(docId) {
    const doc = this.config.docs.find(doc => doc.id === docId);
    if (doc) {
      doc.lastSync = new Date().toISOString();
      this.saveConfig();
    }
  }

  /**
   * 获取启用的文档ID列表
   */
  getEnabledDocIds() {
    return this.config.docs
      .filter(doc => doc.enabled)
      .map(doc => doc.id);
  }

  /**
   * 检查文档是否需要同步
   */
  shouldSync(doc, force = false) {
    if (!doc.enabled) return false;
    if (force) return true;

    const now = Date.now();
    const lastSync = doc.lastSync ? new Date(doc.lastSync).getTime() : 0;
    const timeSinceLastSync = now - lastSync;

    // 如果超过同步间隔，返回true
    return timeSinceLastSync > this.config.syncInterval;
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = new DocManager();

  switch (command) {
    case 'add':
      // 添加文档: node manage-docs.js add <docId> [title] [tags...]
      if (args.length < 2) {
        console.log('用法: node manage-docs.js add <docId> [title] [tags...]');
        process.exit(1);
      }
      const docId = args[1];
      const title = args[2] || null;
      const tags = args.slice(3);
      manager.addDoc(docId, title, tags);
      break;

    case 'remove':
      // 删除文档: node manage-docs.js remove <docId>
      if (args.length < 2) {
        console.log('用法: node manage-docs.js remove <docId>');
        process.exit(1);
      }
      manager.removeDoc(args[1]);
      break;

    case 'update':
      // 更新文档: node manage-docs.js update <docId> <field>=<value>
      if (args.length < 3) {
        console.log('用法: node manage-docs.js update <docId> <field>=<value>');
        process.exit(1);
      }
      const updates = {};
      args.slice(2).forEach(update => {
        const [field, value] = update.split('=');
        if (field && value !== undefined) {
          updates[field] = value === 'true' ? true : value === 'false' ? false : value;
        }
      });
      manager.updateDoc(args[1], updates);
      break;

    case 'list':
      // 列出文档: node manage-docs.js list [--enabled] [--folder=name] [--search=keyword]
      const filter = {};
      args.slice(2).forEach(arg => {
        if (arg.startsWith('--enabled')) {
          filter.enabled = arg.includes('=true') ? true : true;
        } else if (arg.startsWith('--folder=')) {
          filter.folder = arg.split('=')[1];
        } else if (arg.startsWith('--search=')) {
          filter.search = arg.split('=')[1];
        }
      });
      manager.showDocs(filter);
      break;

    case 'enable':
      // 启用文档: node manage-docs.js enable <docId>
      if (args.length < 2) {
        console.log('用法: node manage-docs.js enable <docId>');
        process.exit(1);
      }
      manager.toggleDoc(args[1], true);
      break;

    case 'disable':
      // 禁用文档: node manage-docs.js disable <docId>
      if (args.length < 2) {
        console.log('用法: node manage-docs.js disable <docId>');
        process.exit(1);
      }
      manager.toggleDoc(args[1], false);
      break;

    case 'export':
      // 导出环境变量: node manage-docs.js export
      manager.exportEnv();
      break;

    case 'sync':
      // 同步指定文档: node manage-docs.js sync <docId>
      if (args.length < 2) {
        console.log('用法: node manage-docs.js sync <docId>');
        process.exit(1);
      }
      const syncId = args[1];
      // 这里可以调用同步逻辑
      console.log(`🔄 开始同步文档: ${syncId}`);
      break;

    case 'help':
    default:
      console.log(`
📝 文档管理工具

用法:
  node manage-docs.js add <docId> [title] [tags...]     添加文档
  node manage-docs.js remove <docId>                    删除文档
  node manage-docs.js update <docId> <field>=<value>    更新文档
  node manage-docs.js list [--enabled] [--folder=name]  列出文档
  node manage-docs.js enable <docId>                    启用文档
  node manage-docs.js disable <docId>                   禁用文档
  node manage-docs.js export                            导出环境变量
  node manage-docs.js sync <docId>                      同步文档
  node manage-docs.js help                              显示帮助

示例:
  # 添加单篇文档
  node manage-docs.js add doccnAbCdEfGhIj "我的AI笔记" AI 学习

  # 列出所有文档
  node manage-docs.js list

  # 只显示启用的文档
  node manage-docs.js list --enabled

  # 搜索文档
  node manage-docs.js list --search=AI

  # 禁用文档
  node manage-docs.js disable doccnAbCdEfGhIj

  # 导出环境变量
  node manage-docs.js export
      `);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = DocManager;
