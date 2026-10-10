const CACHE="waktu-makassar-v11";
const ASSETS=[
  "./","./index.html","./manifest.webmanifest",
  "./icons/icon-192.png","./icons/icon-512.png","./icons/icon-180.png",
  "./icons/icon-96.png","./icons/subuh-masjid.png"
];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith("waktu-makassar-")&&key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  // HTML navigations use network first so updates are not hidden by old cached pages.
  if(event.request.mode==="navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/")){
    event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>{
      const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy)); return response;
    }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  })));
});
