#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'src/data/posts');

function getDraftPosts() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const fullPath = path.join(postsDirectory, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        file,
        slug: file.replace(/\.md$/, ''),
        title: data.title || file,
        date: data.date || '',
        draft: data.draft === true,
        tags: Array.isArray(data.tags) ? data.tags : [],
        lastModified: fs.statSync(fullPath).mtime,
      };
    })
    .filter((post) => post.draft)
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
}

function printDraftPosts(drafts = getDraftPosts()) {
  console.log('\n📝 待发布草稿列表');
  console.log('='.repeat(80));

  if (drafts.length === 0) {
    console.log('✅ 当前没有待发布草稿');
    console.log('='.repeat(80));
    return drafts;
  }

  drafts.forEach((post, index) => {
    const tags = post.tags.length > 0 ? post.tags.join(', ') : '无标签';
    const date = post.date || post.lastModified.toISOString().split('T')[0];

    console.log(`${index + 1}. ${post.title}`);
    console.log(`   文件: ${post.file}`);
    console.log(`   日期: ${date}`);
    console.log(`   标签: ${tags}`);
    console.log('-'.repeat(80));
  });

  console.log(`共 ${drafts.length} 篇草稿。`);
  console.log('发布方法：在飞书文档顶部写 “状态：发布” 或 “draft: false”，再执行 npm run sync:publish');
  console.log('='.repeat(80));

  return drafts;
}

if (require.main === module) {
  printDraftPosts();
}

module.exports = {
  getDraftPosts,
  printDraftPosts,
};
