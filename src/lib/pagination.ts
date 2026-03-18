/**
 * 分页工具函数
 * 支持文章列表、数据列表等多种分页场景
 */

export interface PaginationOptions {
  page: number; // 当前页码 (从1开始)
  limit: number; // 每页显示数量
}

export interface PaginatedResult<T> {
  items: T[]; // 当前页数据
  total: number; // 总数据量
  page: number; // 当前页码
  limit: number; // 每页数量
  totalPages: number; // 总页数
  hasNext: boolean; // 是否有下一页
  hasPrev: boolean; // 是否有上一页
  nextPage?: number; // 下一页页码
  prevPage?: number; // 上一页页码
}

/**
 * 生成分页信息
 * @param data 所有数据
 * @param options 分页选项
 * @returns 分页结果
 */
export function paginate<T>(
  data: T[],
  options: PaginationOptions
): PaginatedResult<T> {
  const { page, limit } = options;
  const total = data.length;
  const totalPages = Math.ceil(total / limit);

  // 计算偏移量
  const offset = (page - 1) * limit;

  // 获取当前页数据
  const items = data.slice(offset, offset + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : undefined,
    prevPage: page > 1 ? page - 1 : undefined,
  };
}

/**
 * 获取分页范围 (用于显示"第X-Y条，共Z条")
 * @param page 当前页码
 * @param limit 每页数量
 * @param total 总数据量
 * @returns 范围信息
 */
export function getPaginationRange(
  page: number,
  limit: number,
  total: number
): {
  start: number; // 起始条数
  end: number; // 结束条数
} {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return { start, end };
}

/**
 * 生成分页链接
 * @param currentPage 当前页
 * @param totalPages 总页数
 * @param basePath 基础路径
 * @param maxVisible 最大显示页码数
 * @returns 页码数组
 */
export function generatePaginationLinks(
  currentPage: number,
  totalPages: number,
  basePath: string = '/posts',
  maxVisible: number = 5
): Array<{
  page: number;
  url: string;
  isActive: boolean;
  isEllipsis?: boolean;
}> {
  const links = [];

  // 如果总页数小于等于最大显示数，显示所有页码
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      links.push({
        page: i,
        url: `${basePath}?page=${i}`,
        isActive: i === currentPage,
      });
    }
    return links;
  }

  // 计算起始和结束页码
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  // 调整起始页码，确保显示足够的页码
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  // 第一页
  if (start > 1) {
    links.push({
      page: 1,
      url: `${basePath}?page=1`,
      isActive: currentPage === 1,
    });

    // 省略号
    if (start > 2) {
      links.push({
        page: start - 1,
        url: `${basePath}?page=${start - 1}`,
        isActive: false,
        isEllipsis: true,
      });
    }
  }

  // 中间页码
  for (let i = start; i <= end; i++) {
    links.push({
      page: i,
      url: `${basePath}?page=${i}`,
      isActive: i === currentPage,
    });
  }

  // 最后一页
  if (end < totalPages) {
    // 省略号
    if (end < totalPages - 1) {
      links.push({
        page: end + 1,
        url: `${basePath}?page=${end + 1}`,
        isActive: false,
        isEllipsis: true,
      });
    }

    links.push({
      page: totalPages,
      url: `${basePath}?page=${totalPages}`,
      isActive: currentPage === totalPages,
    });
  }

  return links;
}

/**
 * 智能分页策略
 * 根据数据量和访问模式自动调整分页策略
 * @param total 数据总量
 * @param estimatedReadTime 预计阅读时间(秒)
 * @param baseLimit 基础每页数量
 * @returns 优化的分页选项
 */
export function getSmartPaginationOptions(
  total: number,
  estimatedReadTime: number,
  baseLimit: number = 10
): PaginationOptions {
  // 如果数据量很小，不需要分页
  if (total <= baseLimit) {
    return { page: 1, limit: total };
  }

  // 根据阅读时间调整每页数量
  // 假设用户每次访问愿意阅读5-10分钟
  const targetReadTime = 5 * 60; // 5分钟
  const adjustedLimit = Math.round(baseLimit * (targetReadTime / estimatedReadTime));

  // 确保每页数量在合理范围内
  const limit = Math.max(5, Math.min(adjustedLimit, 50));

  return {
    page: 1,
    limit,
  };
}

/**
 * 无限滚动分页
 * @param allData 所有数据
 * @param currentPage 当前页
 * @param limit 每页数量
 * @returns 无限滚动结果
 */
export function getInfiniteScrollData<T>(
  allData: T[],
  currentPage: number,
  limit: number = 10
): {
  items: T[];
  hasMore: boolean;
  nextPage: number;
} {
  const paginated = paginate(allData, { page: currentPage, limit });

  return {
    items: paginated.items,
    hasMore: paginated.hasNext,
    nextPage: paginated.nextPage || 0,
  };
}

/**
 * 搜索分页
 * @param searchResults 搜索结果
 * @param query 搜索关键词
 * @param page 页码
 * @param limit 每页数量
 * @returns 搜索分页结果
 */
export function paginateSearchResults<T extends { score?: number }>(
  searchResults: T[],
  query: string,
  page: number,
  limit: number = 10
): PaginatedResult<T> & {
  query: string;
  totalResults: number;
} {
  // 按分数排序 (如果有)
  const sortedResults = searchResults.sort((a, b) => (b.score || 0) - (a.score || 0));

  // 分页
  const paginated = paginate(sortedResults, { page, limit });

  return {
    ...paginated,
    query,
    totalResults: searchResults.length,
  };
}

/**
 * 虚拟滚动分页 (用于大数据集)
 * @param allData 所有数据
 * @param visibleStart 可见区域起始索引
 * @param visibleEnd 可见区域结束索引
 * @param buffer 缓冲区大小
 * @returns 虚拟滚动数据
 */
export function getVirtualScrollData<T>(
  allData: T[],
  visibleStart: number,
  visibleEnd: number,
  buffer: number = 5
): {
  items: T[];
  total: number;
  startIndex: number;
  endIndex: number;
} {
  const total = allData.length;

  // 添加缓冲区
  const startIndex = Math.max(0, visibleStart - buffer);
  const endIndex = Math.min(total, visibleEnd + buffer);

  return {
    items: allData.slice(startIndex, endIndex),
    total,
    startIndex,
    endIndex,
  };
}

/**
 * 分页URL解析
 * @param searchParams URL搜索参数
 * @param defaultLimit 默认每页数量
 * @returns 分页选项
 */
export function parsePaginationParams(
  searchParams: { [key: string]: string | string[] | undefined },
  defaultLimit: number = 10
): PaginationOptions {
  const page = parseInt((searchParams.page as string) || '1', 10);
  const limit = parseInt((searchParams.limit as string) || defaultLimit.toString(), 10);

  // 验证和限制页码范围
  const safePage = Math.max(1, isNaN(page) ? 1 : page);
  const safeLimit = Math.max(1, Math.min(100, isNaN(limit) ? defaultLimit : limit));

  return {
    page: safePage,
    limit: safeLimit,
  };
}

/**
 * 生成SEO友好的分页Meta信息
 * @param currentPage 当前页
 * @param totalPages 总页数
 * @param baseTitle 基础标题
 * @returns Meta信息
 */
export function generatePaginationMeta(
  currentPage: number,
  totalPages: number,
  baseTitle: string
): {
  title: string;
  canonical?: string;
  robots?: string;
} {
  if (currentPage === 1) {
    return {
      title: baseTitle,
    };
  }

  return {
    title: `${baseTitle} - 第${currentPage}页`,
    canonical: currentPage > 2 ? `canonical-url/page-${currentPage}` : undefined,
    robots: currentPage > 10 ? 'noindex' : undefined,
  };
}
