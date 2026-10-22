const K='pb-v27';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(K).then(c=>c.addAll(['./','index.html','game.js','fg.js','season.js','rosters.js','arcade.js','manifest.webmanifest','three-view.js','sprites.js','helmets.js','vendor/three.module.min.js'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==K).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(K).then(ca=>ca.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
