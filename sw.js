const CACHE = 'kairos-majorque-1.3.0';
const CORE = ['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url); if(url.origin!==self.location.origin)return;
 const shell=url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
 if(shell){event.respondWith(fetch(event.request,{cache:'no-store'}).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put('./index.html',r.clone()));return r;}).catch(()=>caches.match('./index.html')));return;}
 event.respondWith(caches.match(event.request).then(c=>c||fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE).then(cache=>cache.put(event.request,r.clone()));return r;})));
});
