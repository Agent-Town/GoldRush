import {parseArgs} from 'node:util';
import {launch,pageFor,read,write,host} from './browser.mjs';
const {values}=parseArgs({options:{map:{type:'string'},profile:{type:'string'},minutes:{type:'string',default:'30'},resume:{type:'boolean'}}});
const inventory=await read('inventory.json');const maps=[{id:'town'},...inventory.priority.filter(id=>id!=='town').map(id=>inventory.maps.find(m=>m.id===id)),...inventory.maps.filter(m=>!inventory.priority.includes(m.id))];
const profiles={unthrottled:{latency:0,downloadThroughput:-1,uploadThroughput:-1},Fast3G:{latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8},'4G':{latency:60,downloadThroughput:9000000/8,uploadThroughput:9000000/8}};
const rows=values.resume?(await read('delivery.json')).rows:[];const env=await launch(),deadline=Date.now()+Number(values.minutes)*60000;
try{
 outer:for(const map of maps.filter(m=>!values.map||m.id===values.map))for(const name of values.profile?[values.profile]:['unthrottled','Fast3G','4G']){
  if(Date.now()>deadline)break outer;const key=`${map.id}-${name}`;if(rows.some(r=>r.key===key))continue;
  const {page,context,errors}=await pageFor(env.browser,{width:390,height:844});const cdp=await context.newCDPSession(page);const requests=new Map();let navStamp;
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:false});await cdp.send('Network.emulateNetworkConditions',{offline:false,...profiles[name]});
  cdp.on('Network.requestWillBeSent',e=>{
   if(!e.request.url.startsWith(env.base))return;
   if(e.type==='Document'&&navStamp===undefined)navStamp=e.timestamp;
   requests.set(e.requestId,{url:new URL(e.request.url).pathname,startedMs:(e.timestamp-navStamp)*1000,type:e.type,prefetch:Object.keys(e.request.headers).some(k=>k.toLowerCase()==='x-gold-rush-prefetch'),initiator:e.initiator.type});
  });
  cdp.on('Network.responseReceived',e=>{const r=requests.get(e.requestId);if(r)Object.assign(r,{status:e.response.status,contentLength:Number(e.response.headers['Content-Length']??e.response.headers['content-length']??0),responseMs:(e.timestamp-navStamp)*1000,fromDiskCache:e.response.fromDiskCache??false,mime:e.response.mimeType,contentEncoding:e.response.headers['content-encoding']??null});});
  cdp.on('Network.loadingFinished',e=>{const r=requests.get(e.requestId);if(r)Object.assign(r,{finishedMs:(e.timestamp-navStamp)*1000,encodedBytes:e.encodedDataLength});});
  cdp.on('Network.loadingFailed',e=>{const r=requests.get(e.requestId);if(r)Object.assign(r,{failed:e.errorText,finishedMs:(e.timestamp-navStamp)*1000});});
  const row={key,map:map.id,profile:name,network:profiles[name],viewport:{width:390,height:844},before:host(),errors,buildMode:'all-epoch production preview; fresh browser context; DPR 1; full tier; HTTP cache enabled and initially empty'};
  try{
   const query=map.id==='town'?'town3dPilot=all&tier=full':new URLSearchParams({contract:map.id,epoch:map.epochId,tier:'full',debug:'',nolevel:'',nopause:'',nokill:'',nowaves:''}).toString();
   await page.goto(`${env.base}/?${query}`,{waitUntil:'domcontentloaded',timeout:60000});
   if(map.id==='town')await page.getByTestId('start-menu-enter-town').click({timeout:60000});
   await page.waitForFunction(()=>__PERF_SURVEY__.firstFrameMs!==null,null,{timeout:60000});
   row.firstFrameMs=await page.evaluate(()=>__PERF_SURVEY__.firstFrameMs);
   // The throttled leg measures first frame, not eventual complete download. Unthrottled
   // leg supplies the settled per-map dependency set without multiplying slow-link waiting.
   if(name==='unthrottled'){
    await page.waitForFunction(()=>{const c=document.querySelector('#game-canvas');return Number(c?.dataset.assetLoadingTotal)>0&&c.dataset.assetLoadingState==='ready';},null,{timeout:20000}).catch(()=>{});
    row.assetReadyMs=await page.evaluate(()=>performance.now());
    await page.waitForTimeout(5000);
   }else await page.waitForTimeout(1000);
   row.end=await page.evaluate(()=>({atMs:performance.now(),dataset:{...document.querySelector('#game-canvas')?.dataset},resources:performance.getEntriesByType('resource').filter(r=>r.name.startsWith(location.origin)).map(r=>({url:new URL(r.name).pathname,startTime:r.startTime,responseEnd:r.responseEnd,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize,decodedBodySize:r.decodedBodySize}))}));
   row.status='measured';
  }catch(e){row.status='failed';row.failure=String(e);row.firstFrameMs=await page.evaluate(()=>__PERF_SURVEY__?.firstFrameMs).catch(()=>null);}
  row.requests=[...requests.values()];row.completedWireBytes=row.requests.reduce((s,r)=>s+(r.encodedBytes??0),0);row.firstFrameWireBytes=row.requests.filter(r=>r.finishedMs<=row.firstFrameMs).reduce((s,r)=>s+(r.encodedBytes??0),0);
  const demanded=new Set(row.requests.filter(r=>!r.prefetch).map(r=>r.url));const prefetched=new Map(row.requests.filter(r=>r.prefetch&&!demanded.has(r.url)).map(r=>[r.url,r]));
  row.prefetchOnly=[...prefetched.values()];row.prefetchOnlyBodyBytes=row.prefetchOnly.reduce((s,r)=>s+r.contentLength,0);row.responseBodyBytes=row.requests.reduce((s,r)=>s+(r.contentLength??0),0);row.top10=[...row.requests].sort((a,b)=>(b.contentLength??0)-(a.contentLength??0)).slice(0,10);
  row.after=host();rows.push(row);await write('delivery.json',{at:new Date().toISOString(),profiles,method:'First frame = first perspective scene render through the existing three.js observation hook; excludes user think time. Header x-gold-rush-prefetch marks speculative fetches exactly. Prefetch-only = URL never requested by a demand caller in the observation window. Unthrottled observed through assets-ready + 5 s; throttled observed through first frame + 1 s. In-flight requests are retained and are not counted as completed bytes.',rows});console.log(`${key}: ${row.status} firstFrame=${row.firstFrameMs?.toFixed(0)}ms wire=${row.completedWireBytes} ${row.failure??''}`);
  await cdp.detach();await context.close();
 }
}finally{await env.close();}
