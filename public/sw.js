// Service Worker：离线缓存 + 主屏幕应用
// 策略：导航请求走网络（保证内容更新），失败回退缓存；
//       静态资源走缓存优先（文件名带哈希，天然不可变）

const CACHE = 'neck-care-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== location.origin) return

  if (event.request.mode === 'navigate') {
    // 页面：网络优先，离线时用缓存兜底
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(event.request, copy))
          return res
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // 静态资源：缓存优先
  event.respondWith(
    caches.match(event.request).then(
      (hit) =>
        hit ||
        fetch(event.request).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(event.request, copy))
          return res
        })
    )
  )
})
