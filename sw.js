const CATBOX = 'https://files.catbox.moe';

// Files that should be proxied to catbox
const FILE_EXT = /\.(mp3|mp4|wav|ogg|flac|aac|m4a|opus|webm|mov|avi|mkv|jpg|jpeg|png|gif|webp|svg|bmp|avif|pdf|zip|rar|7z|tar|gz|txt|md|doc|docx|xls|xlsx|ppt|pptx|csv)$/i;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only intercept same-origin requests that look like files
  if (url.origin === self.location.origin && FILE_EXT.test(url.pathname)) {
    const catboxUrl = CATBOX + url.pathname;

    e.respondWith(
      fetch(catboxUrl, {
        headers: { 'Range': e.request.headers.get('Range') || '' }
      }).then(res => {
        // Pass through all headers + status (important for video/audio range requests)
        const headers = new Headers(res.headers);
        headers.set('Access-Control-Allow-Origin', '*');
        return new Response(res.body, {
          status:  res.status,
          headers: headers
        });
      }).catch(() => {
        return new Response('Not found', { status: 404 });
      })
    );
  }
});
