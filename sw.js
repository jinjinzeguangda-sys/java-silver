// 目的: 初回に読んだものをキャッシュし、以降オフラインでも開けるようにする。
// 方針（2026-09-24 に2点 直した）:
//   ① ページ本体（ナビゲーション / index.html）は network-first。
//      cache-first だと直しても古い画面が出続ける。実際この日、直した版を出した後も
//      端末側が旧版を表示し続け、「反映されていない」と3回 指摘された。
//      オフライン時だけキャッシュに落ちる。
//   ② activate の掃除は必ず自分の接頭辞だけ。
//      ★Cache Storage は「オリジン単位」で、同じドメインに入口＋37本が同居している。
//      k !== CACHE で消すと、更新のたびに他の36本のキャッシュを全部 巻き添えで消す。
const CACHE  = 'javasilver-9c15f5be';
const PREFIX = 'javasilver-';
// ★接頭辞だけだと、名前が接頭辞になっている兄弟（javasilver-drill のような追加）まで消す。
//   末尾が index.html の md5(8桁) であることまで見る（2026-09-25 実測で site 側が実際に踏んだ）
const STALE  = new RegExp('^' + PREFIX + '[0-9a-f]{8}$');
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE && STALE.test(k))
                                .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isPage = e.request.mode === 'navigate' || url.pathname.endsWith('/index.html')
                 || url.pathname.endsWith('/java-silver/');
  if (isPage) {                       // 本体は「まず取りに行く」
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.ok && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(                      // それ以外は今までどおり速さ優先
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res && res.ok && url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
