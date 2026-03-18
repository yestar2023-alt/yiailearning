const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// SEO检查配置
const SEO_CONFIG = {
  titleMinLength: 30,
  titleMaxLength: 60,
  summaryMinLength: 120,
  summaryMaxLength: 160,
  excerptMinLength: 150,
  excerptMaxLength: 200,
  minContentLength: 1000,
  maxKeywordDensity: 0.03, // 3%
  minInternalLinks: 2,
  requiredTags: 3,
};

// 获取所有文章
function getAllPosts() {
  const postsDirectory = path.join(process.cwd(), 'src/data/posts');
  const filenames = fs.readdirSync(postsDirectory);
  
  return filenames
    .filter(name => name.endsWith('.md'))
    .map(filename => {
      const fullPath = path.join(postsDirectory, filename);

      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          filename,
          meta: data,
          content,
          slug: filename.replace(/\.md$/, '')
        };
      } catch (error) {
        return {
          filename,
          meta: {
            title: filename,
            summary: '',
          },
          content: '',
          slug: filename.replace(/\.md$/, ''),
          parseError: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
    .filter(post => post.meta?.draft !== true && post.meta?.published !== false);
}

// 检查标题SEO
function checkTitle(title) {
  const issues = [];
  
  if (!title) {
    issues.push('❌ 缺少标题');
    return issues;
  }
  
  if (title.length < SEO_CONFIG.titleMinLength) {
    issues.push(`⚠️ 标题太短 (${title.length}字符，建议${SEO_CONFIG.titleMinLength}+)`);
  }
  
  if (title.length > SEO_CONFIG.titleMaxLength) {
    issues.push(`⚠️ 标题太长 (${title.length}字符，建议${SEO_CONFIG.titleMaxLength}以内)`);
  }
  
  return issues;
}

// 检查摘要SEO
function checkSummary(summary) {
  const issues = [];
  
  if (!summary) {
    issues.push('❌ 缺少摘要');
    return issues;
  }
  
  if (summary.length < SEO_CONFIG.summaryMinLength) {
    issues.push(`⚠️ 摘要太短 (${summary.length}字符，建议${SEO_CONFIG.summaryMinLength}+)`);
  }
  
  if (summary.length > SEO_CONFIG.summaryMaxLength) {
    issues.push(`⚠️ 摘要太长 (${summary.length}字符，建议${SEO_CONFIG.summaryMaxLength}以内)`);
  }
  
  return issues;
}

function getSummaryValue(meta) {
  return meta.summary || meta.excerpt || meta.description || '';
}

// 检查标签
function checkTags(tags) {
  const issues = [];
  
  if (!tags || !Array.isArray(tags)) {
    issues.push('❌ 缺少标签');
    return issues;
  }
  
  if (tags.length < SEO_CONFIG.requiredTags) {
    issues.push(`⚠️ 标签数量不足 (${tags.length}个，建议${SEO_CONFIG.requiredTags}+)`);
  }
  
  return issues;
}

// 检查内容长度
function checkContentLength(content) {
  const issues = [];
  const wordCount = content.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '').length;
  
  if (wordCount < SEO_CONFIG.minContentLength) {
    issues.push(`⚠️ 内容太短 (${wordCount}字符，建议${SEO_CONFIG.minContentLength}+)`);
  }
  
  return issues;
}

// 检查关键词密度
function checkKeywordDensity(content, keywords) {
  const issues = [];
  
  if (!keywords) {
    issues.push('⚠️ 建议添加关键词字段');
    return issues;
  }
  
  const keywordList = keywords.split(',').map(k => k.trim());
  const contentLower = content.toLowerCase();
  
  keywordList.forEach(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'g');
    const matches = contentLower.match(regex) || [];
    const density = matches.length / content.length;
    
    if (density > SEO_CONFIG.maxKeywordDensity) {
      issues.push(`⚠️ 关键词"${keyword}"密度过高 (${(density * 100).toFixed(2)}%)`);
    }
  });
  
  return issues;
}

// 检查内部链接
function checkInternalLinks(content) {
  const issues = [];
  const linkRegex = /\[([^\]]+)\]\(\/[^)]+\)/g;
  const matches = content.match(linkRegex) || [];
  
  if (matches.length < SEO_CONFIG.minInternalLinks) {
    issues.push(`⚠️ 内部链接不足 (${matches.length}个，建议${SEO_CONFIG.minInternalLinks}+)`);
  }
  
  return issues;
}

// 检查图片alt标签
function checkImageAlt(content) {
  const issues = [];
  const imgRegex = /!\[([^\]]*)\]\([^)]+\)/g;
  const matches = content.match(imgRegex) || [];
  
  matches.forEach(match => {
    const altMatch = match.match(/!\[([^\]]*)\]/);
    if (!altMatch[1] || altMatch[1].trim() === '') {
      issues.push('⚠️ 发现没有alt描述的图片');
    }
  });
  
  return issues;
}

// 主检查函数
function checkPostSEO(post) {
  const issues = [];

  if (post.parseError) {
    issues.push(`❌ Frontmatter 解析失败: ${post.parseError}`);
    return issues;
  }
  
  // 检查各个方面
  issues.push(...checkTitle(post.meta.title));
  issues.push(...checkSummary(getSummaryValue(post.meta)));
  issues.push(...checkTags(post.meta.tags));
  issues.push(...checkContentLength(post.content));
  issues.push(...checkKeywordDensity(post.content, post.meta.keywords));
  issues.push(...checkInternalLinks(post.content));
  issues.push(...checkImageAlt(post.content));
  
  // 检查必要字段 - 已移除封面图片要求
  
  if (!post.meta.excerpt && !post.meta.description) {
    issues.push('⚠️ 建议添加excerpt字段用于社交分享');
  }
  
  return issues;
}

// 运行检查
function runSEOCheck() {
  console.log('🔍 开始SEO检查...\n');
  
  const posts = getAllPosts();
  let totalIssues = 0;
  
  posts.forEach(post => {
    const issues = checkPostSEO(post);
    
    console.log(`📝 文章：${post.meta.title || post.filename}`);
    console.log(`📁 文件：${post.filename}`);
    
    if (issues.length === 0) {
      console.log('✅ SEO检查通过！');
    } else {
      console.log(`❌ 发现 ${issues.length} 个问题：`);
      issues.forEach(issue => console.log(`   ${issue}`));
      totalIssues += issues.length;
    }
    
    console.log('─'.repeat(60));
  });
  
  console.log(`\n📊 检查完成！`);
  console.log(`📝 检查文章数：${posts.length}`);
  console.log(`⚠️ 总问题数：${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('🎉 所有文章SEO检查通过！');
  } else {
    console.log('💡 建议根据上述问题进行优化');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runSEOCheck();
}

module.exports = { runSEOCheck, checkPostSEO }; 
