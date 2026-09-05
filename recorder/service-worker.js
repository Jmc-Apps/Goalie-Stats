const CACHE_NAME='goalie-stats-recorder-v1-29-reset3';
const FILES=[
 './',
 './index.html',
 './goalie_stats_recorder_v1_29.html',
 './manifest.webmanifest',
 './manifest.webmanifest?v=1.29',
 './assets/d_heat_map.png',
 './assets/goal_box_heat_map.png',
 './assets/title-logo.png',
 './assets/home-logo.png',
 './assets/app-icon-master-v127.png',
 './icon-192.png',
 './icon-512.png',
 './apple-touch-icon.png',
 './favicon-32.png',
 './icon-192-v1-29.png',
 './icon-512-v1-29.png',
 './apple-touch-icon-v1-29.png',
 './favicon-32-v1-29.png'
];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/manifest.webmanifest')){
   e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
   return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return resp})));
});
