const CATBOX_FILES = 'https://files.catbox.moe';
const FILE_EXT = /\.(mp3|mp4|wav|ogg|flac|aac|m4a|opus|webm|mov|avi|mkv|jpg|jpeg|png|gif|webp|svg|bmp|avif|pdf|zip|rar|7z|tar|gz|txt|md|docx|xlsx|pptx|csv)$/i;

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only intercept same-origin file-like paths
  if (url.origin !== self.location.origin) return;

  // Get just the filename: /cloud/abc123.mp3 → abc123.mp3
  const filename = url.pathname.split('/').pop();
  if (!filename || !FILE_EXT.test(filename)) return;

  const catUrl = CATBOX_FILES + '/' + filename;

  e.respondWith(
    fetch(catUrl, {
      headers: e.request.headers.get('Range')
        ? { 'Range': e.request.headers.get('Range') }
        : {}
    })
    .then(res => {
      const h = new Headers(res.headers);
      h.set('Access-Control-Allow-Origin', '*');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    })
    .catch(() => new Response('Not found', { status: 404 }))
  );
});
