const K='pb-v2';self.addEventListener('install',e=>e.waitUntil(caches.open(K).then(c=>c.addAll(['./','index.html','game.js','manifest.webmanifest','three-view.js','vendor/three.module.min.js']))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
