const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'src/data/posts');
const slug = '我如何为-247-openclaw-agent-团队管理记忆(以及为什么一次纠正能修复所有-agent)';

async function test() {
    const fullPath = path.join(postsDirectory, slug + '.md');
    console.log('Path:', fullPath);
    console.log('Exists?', fs.existsSync(fullPath));

    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        console.log('Matter parsed ok. Metadata:', data);

        // Try remark/rehype dynamically importing because they are ESM maybe?
        const { remark } = await import('remark');
        const html = (await import('remark-html')).default;
        const toc = (await import('remark-toc')).default;
        const { rehype } = await import('rehype');
        const rehypeSlug = (await import('rehype-slug')).default;
        const rehypePrism = (await import('rehype-prism-plus')).default;

        console.log('Dependencies loaded');
        const processedContentRemark = await remark()
            .use(html)
            .use(toc, { heading: '目录', maxDepth: 2 })
            .process(content);
        console.log('Remark processed ok');

        const finalContent = await rehype()
            .use(rehypeSlug)
            .use(rehypePrism, { showLineNumbers: true })
            .process(processedContentRemark.toString());
        console.log('Rehype processed ok');

    } catch (e) {
        console.error('ERROR:', e);
    }
}

test();
