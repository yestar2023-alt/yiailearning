/**
 * Service Worker for caching and offline support
 * 自动缓存页面和静态资源，提供离线访问能力
 */

const CACHE_NAME = 'yi-learning-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/posts',
  '/resources',
  '/roadmap',
  '/favicon.ico',
  '/manifest.json',
];

// 缓存策略配置
const CACHE_STRATEGIES = {
  // 静态资源：缓存优先
  STATIC: {
    pattern: /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/,
    strategy: 'cache-first',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
  },
  // 页面：网络优先，失败时回退到缓存
  PAGES: {
    pattern: /\/(posts|resources|roadmap)(\/.*)?$/,
    strategy: 'network-first',
    maxAge: 24 * 60 * 60 * 1000, // 1天
  },
  // API请求：网络优先
  API: {
    pattern: /\/api\//,
    strategy: 'network-first',
    maxAge: 60 * 60 * 1000, // 1小时
  },
};

/**
 * 安装事件 - 缓存静态资源
 */
self.addEventListener('install', (event) => {
  console.log('[SW] 安装 Service Worker');

  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      // 缓存静态资源
      try {
        await cache.addAll(STATIC_ASSETS);
        console.log('[SW] 静态资源缓存成功');
      } catch (error) {
        console.error('[SW] 静态资源缓存失败:', error);
      }

      // 强制激活新的 Service Worker
      await self.skipWaiting();
    })()
  );
});

/**
 * 激活事件 - 清理旧缓存
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活 Service Worker');

  event.waitUntil(
    (async () => {
      // 清理旧缓存
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );

      // 立即控制所有页面
      await self.clients.claim();
      console.log('[SW] 缓存清理完成');
    })()
  );
});

/**
 * 拦截网络请求 - 实现缓存策略
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 仅处理 GET 请求
  if (request.method !== 'GET') return;

  // 跳过非HTTP请求
  if (!url.protocol.startsWith('http')) return;

  // 跳过Chrome扩展和其他协议
  if (url.protocol === 'chrome-extension:') return;

  // 根据请求URL确定缓存策略
  const strategy = getCacheStrategy(request.url);

  if (strategy === 'cache-first') {
    event.respondWith(cacheFirstStrategy(request));
  } else if (strategy === 'network-first') {
    event.respondWith(networkFirstStrategy(request));
  } else if (strategy === 'stale-while-revalidate') {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

/**
 * 根据URL获取缓存策略
 */
function getCacheStrategy(url) {
  for (const [name, config] of Object.entries(CACHE_STRATEGIES)) {
    if (config.pattern.test(url)) {
      return config.strategy;
    }
  }
  return 'network-first'; // 默认策略
}

/**
 * 缓存优先策略 - 适用于静态资源
 */
async function cacheFirstStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // 后台更新缓存
    updateCache(request, cache);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] 网络请求失败:', error);
    return cached || new Response('离线模式：资源不可用', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * 网络优先策略 - 适用于页面和API
 */
async function networkFirstStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] 网络失败，尝试从缓存获取:', request.url);

    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    // 如果是页面请求，返回离线页面
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('离线模式', {
        status: 503,
      });
    }

    throw error;
  }
}

/**
 * 过期重验证策略 - 适用于不频繁更新的资源
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.error('[SW] 后台更新失败:', error);
      return cached;
    });

  // 返回缓存的版本（如果有），或者等待网络响应
  return cached || fetchPromise;
}

/**
 * 后台更新缓存
 */
async function updateCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
  } catch (error) {
    // 静默失败
  }
}

/**
 * 处理来自客户端的消息
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_CACHE_SIZE':
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;

    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;

    default:
      console.log('[SW] 未知消息类型:', type);
  }
});

/**
 * 获取缓存大小
 */
async function getCacheSize() {
  let totalSize = 0;
  const cacheNames = await caches.keys();

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      const headers = response.headers;
      const size = parseInt(headers.get('content-length') || '0', 10);

      if (!isNaN(size)) {
        totalSize += size;
      }
    }
  }

  return totalSize;
}

/**
 * 清理所有缓存
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
}

/**
 * 推送通知处理
 */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '您有新的内容更新',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/checkmark.png',
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/xmark.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('AI学习笔记', options)
  );
});

/**
 * 通知点击处理
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/posts')
    );
  }
});

console.log('[SW] Service Worker 脚本加载完成');
