const matter = require('gray-matter');

function buildSlug(value, fallback = `doc-${Date.now()}`) {
  const slug = (value || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  return slug || fallback.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function extractSummary(content, maxLength = 140) {
  const summary = (content || '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`>*_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (summary.length <= maxLength) {
    return summary;
  }

  return `${summary.slice(0, maxLength).trim()}...`;
}

function splitTags(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/[,，、|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeDraftValue(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (['true', 'draft', 'private', 'yes', 'y', '1', '草稿', '未发布', '隐藏'].includes(normalized)) {
    return true;
  }

  if (['false', 'published', 'public', 'no', 'n', '0', '发布', '已发布', '公开'].includes(normalized)) {
    return false;
  }

  return undefined;
}

function normalizeInlineMeta(rawMeta = {}) {
  const normalized = { ...rawMeta };

  if (typeof normalized.tags === 'string' || Array.isArray(normalized.tags)) {
    normalized.tags = splitTags(normalized.tags);
  }

  if (typeof normalized.keywords === 'string') {
    normalized.keywords = normalized.keywords
      .split(/[,，、|]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .join(',');
  }

  const statusDraft = normalizeDraftValue(normalized.status);
  if (statusDraft !== undefined) {
    normalized.draft = statusDraft;
  }

  const publishedDraft = normalizeDraftValue(normalized.published);
  if (publishedDraft !== undefined) {
    normalized.draft = !publishedDraft;
  }

  const directDraft = normalizeDraftValue(normalized.draft);
  if (directDraft !== undefined) {
    normalized.draft = directDraft;
  }

  delete normalized.status;
  delete normalized.published;

  return normalized;
}

function parseSimpleMetaBlock(content) {
  const lines = content.split(/\r?\n/);
  const meta = {};
  const consumed = [];
  let hasDraftSetting = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (consumed.length > 0) {
        consumed.push(line);
      } else {
        break;
      }
      continue;
    }

    const match = trimmed.match(/^(标题|title|摘要|summary|excerpt|描述|description|标签|tags|关键词|keywords|slug|状态|status|draft|published|日期|date)\s*[:：]\s*(.+)$/i);
    if (!match) {
      break;
    }

    const rawKey = match[1].toLowerCase();
    const value = match[2].trim();
    consumed.push(line);

    const keyMap = {
      标题: 'title',
      title: 'title',
      摘要: 'summary',
      summary: 'summary',
      excerpt: 'excerpt',
      描述: 'description',
      description: 'description',
      标签: 'tags',
      tags: 'tags',
      关键词: 'keywords',
      keywords: 'keywords',
      slug: 'slug',
      状态: 'status',
      status: 'status',
      draft: 'draft',
      published: 'published',
      日期: 'date',
      date: 'date',
    };

    meta[keyMap[match[1]] || keyMap[rawKey] || rawKey] = value;

    if (['状态', 'status', 'draft', 'published'].includes(match[1]) || ['status', 'draft', 'published'].includes(rawKey)) {
      hasDraftSetting = true;
    }
  }

  if (Object.keys(meta).length === 0) {
    return { metadata: {}, content, hasDraftSetting: false };
  }

  return {
    metadata: normalizeInlineMeta(meta),
    content: lines.slice(consumed.length).join('\n').trim(),
    hasDraftSetting,
  };
}

function stripLeadingTitleHeading(content, title) {
  const trimmedContent = content.trim();
  const trimmedTitle = (title || '').trim();

  if (!trimmedContent || !trimmedTitle) {
    return trimmedContent;
  }

  const escapedTitle = trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingPattern = new RegExp(`^#\\s+${escapedTitle}\\s*(?:\\r?\\n)+`, 'i');

  return trimmedContent.replace(headingPattern, '').trim();
}

function prepareDocForSync(docData, fallbackTitle = '未命名文档') {
  const originalContent = (docData.content || '').trim();
  let body = originalContent;
  let embeddedMeta = {};
  let hasDraftSetting = false;

  if (originalContent.startsWith('---')) {
    try {
      const parsed = matter(originalContent);
      if (Object.keys(parsed.data || {}).length > 0) {
        hasDraftSetting = ['draft', 'status', 'published'].some((key) =>
          Object.prototype.hasOwnProperty.call(parsed.data, key)
        );
        embeddedMeta = normalizeInlineMeta(parsed.data);
        body = parsed.content.trim();
      }
    } catch (error) {
      // Ignore malformed inline frontmatter and fall back to the raw body.
    }
  }

  const simpleMeta = parseSimpleMetaBlock(body);
  body = simpleMeta.content;
  hasDraftSetting = hasDraftSetting || simpleMeta.hasDraftSetting;

  const metadata = normalizeInlineMeta({
    ...(docData.metadata || {}),
    ...simpleMeta.metadata,
    ...embeddedMeta,
  });

  const title = metadata.title || docData.metadata?.title || fallbackTitle;
  body = stripLeadingTitleHeading(body, title);

  return {
    content: body,
    metadata: {
      ...metadata,
      title,
    },
    draftConfigured: hasDraftSetting,
  };
}

function generatePostFile(docData, existingMeta = {}, options = {}) {
  const { fallbackTitle = '未命名文档', extraTags = [] } = options;
  const prepared = prepareDocForSync(docData, fallbackTitle);
  const { content, metadata, draftConfigured } = prepared;
  const date = metadata.date || existingMeta.date || new Date().toISOString().split('T')[0];
  const summary = metadata.summary || existingMeta.summary || extractSummary(content);
  const excerpt = metadata.excerpt || existingMeta.excerpt || summary;
  const tags = Array.from(
    new Set(['飞书同步', ...extraTags, ...(existingMeta.tags || []), ...(metadata.tags || [])])
  ).filter(Boolean);
  const isNewFile = Object.keys(existingMeta).length === 0;
  const hasExistingDraft = Object.prototype.hasOwnProperty.call(existingMeta, 'draft');
  const shouldDraft = draftConfigured
    ? metadata.draft === true
    : hasExistingDraft
      ? existingMeta.draft === true
      : isNewFile;

  const frontmatter = {
    ...existingMeta,
    ...metadata,
    title: metadata.title || existingMeta.title || fallbackTitle,
    date,
    summary,
    excerpt,
    tags,
  };

  if (metadata.slug || existingMeta.slug) {
    frontmatter.slug = metadata.slug || existingMeta.slug;
  }

  if (shouldDraft) {
    frontmatter.draft = true;
  } else {
    delete frontmatter.draft;
  }

  return matter.stringify(`${content.trim()}\n`, frontmatter);
}

module.exports = {
  buildSlug,
  extractSummary,
  generatePostFile,
  prepareDocForSync,
};
