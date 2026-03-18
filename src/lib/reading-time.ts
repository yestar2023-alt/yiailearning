/**
 * 文章阅读时间计算工具
 * 基于中英文平均阅读速度计算
 */

export interface ReadingTimeOptions {
  wordsPerMinute?: number; // 每分钟阅读字数
  includeImages?: boolean; // 是否包含图片阅读时间
  imageTime?: number; // 每张图片额外阅读时间(秒)
}

/**
 * 计算文章阅读时间
 * @param content 文章内容(Markdown或HTML)
 * @param options 配置选项
 * @returns 阅读时间信息
 */
export function calculateReadingTime(
  content: string,
  options: ReadingTimeOptions = {}
): {
  text: string;
  minutes: number;
  seconds: number;
  words: number;
} {
  const {
    wordsPerMinute = 300, // 中文平均阅读速度 300字/分钟
    includeImages = true,
    imageTime = 12, // 每张图片平均阅读时间 12秒
  } = options;

  // 移除Markdown语法标记
  const cleanContent = content
    // 移除代码块
    .replace(/```[\s\S]*?```/g, ' ')
    // 移除内联代码
    .replace(/`[^`]+`/g, ' ')
    // 移除链接，保留文本
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, ' ')
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除加粗、斜体标记
    .replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2')
    // 移除HTML标签
    .replace(/<[^>]*>/g, ' ')
    // 移除特殊字符
    .replace(/[#>*_`~\-![\]()]/g, ' ')
    // 移除多余空白
    .replace(/\s+/g, ' ')
    .trim();

  // 计算字数
  const words = cleanContent.length;

  // 计算基本阅读时间(秒)
  const baseTimeSeconds = (words / wordsPerMinute) * 60;

  // 计算图片数量和额外时间
  const imageCount = includeImages ? (content.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length : 0;
  const imageTimeSeconds = imageCount * imageTime;

  // 总阅读时间(秒)
  const totalSeconds = Math.ceil(baseTimeSeconds + imageTimeSeconds);

  // 转换为分钟和秒
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // 生成可读的时间文本
  let text: string;
  if (minutes === 0) {
    text = `${seconds}秒`;
  } else if (seconds === 0) {
    text = `${minutes}分钟`;
  } else {
    text = `${minutes}分${seconds}秒`;
  }

  return {
    text,
    minutes,
    seconds,
    words,
  };
}

/**
 * 格式化阅读时间为友好的文本
 * @param readingTime 原始阅读时间
 * @param locale 本地化设置
 * @returns 格式化后的文本
 */
export function formatReadingTime(
  readingTime: ReturnType<typeof calculateReadingTime>,
  locale: string = 'zh-CN'
): string {
  const { minutes, seconds, words } = readingTime;

  // 根据本地化设置返回不同格式
  if (locale === 'en') {
    if (minutes === 0) return `${seconds}s read`;
    if (seconds === 0) return `${minutes} min read`;
    return `${minutes}m ${seconds}s read`;
  }

  // 中文格式
  const timeStr = minutes === 0 ? `${seconds}秒` : `${minutes}分${seconds}秒`;
  return `阅读时间 ${timeStr}`;
}

/**
 * 检查内容是否需要"快读"标记
 * @param readingTime 阅读时间
 * @param quickReadThreshold 快读阈值(分钟)
 * @returns 是否为快读内容
 */
export function isQuickRead(
  readingTime: ReturnType<typeof calculateReadingTime>,
  quickReadThreshold: number = 2
): boolean {
  return readingTime.minutes <= quickReadThreshold;
}

/**
 * 根据阅读时间生成颜色标记
 * @param readingTime 阅读时间
 * @returns CSS类名
 */
export function getReadingTimeColorClass(
  readingTime: ReturnType<typeof calculateReadingTime>
): string {
  if (readingTime.minutes <= 2) {
    return 'text-green-600 dark:text-green-400'; // 快读
  } else if (readingTime.minutes <= 5) {
    return 'text-primary dark:text-primary-light'; // 中等
  } else if (readingTime.minutes <= 10) {
    return 'text-orange-600 dark:text-orange-400'; // 较长
  } else {
    return 'text-red-600 dark:text-red-400'; // 长文
  }
}

// 预设配置
export const READING_TIME_PRESETS = {
  fast: {
    wordsPerMinute: 400,
    name: '快读',
  },
  average: {
    wordsPerMinute: 300,
    name: '普通',
  },
  thorough: {
    wordsPerMinute: 200,
    name: '细读',
  },
} as const;

export type ReadingTimePreset = keyof typeof READING_TIME_PRESETS;
