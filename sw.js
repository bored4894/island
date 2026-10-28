// 오프라인 실행용 서비스워커. 게임을 새 버전으로 올리면 CACHE 숫자를 올리세요.
const CACHE='island-v10.1.0';
const THREE_CDN='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(CACHE);
  await c.addAll(FILES);
  const r=await fetch(THREE_CDN);          // three.js를 처음 한 번 받아 저장
  if(r.ok)await c.put('three-lib',r);
  self.skipWaiting();
})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);
  await self.clients.claim();
})())});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.pathname.endsWith('/three.min.js')||e.request.url===THREE_CDN){
    e.respondWith(caches.match('three-lib').then(r=>r||fetch(e.request)));return;
  }
  if(u.origin!==location.origin)return;
  const isPage=e.request.mode==='navigate'||u.pathname.endsWith('index.html');
  e.respondWith(isPage
    ? fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))  // 온라인이면 최신, 오프라인이면 저장본
    : caches.match(e.request).then(r=>r||fetch(e.request)));
});
